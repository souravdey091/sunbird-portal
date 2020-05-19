import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { ResourceService, ToasterService, IUserData } from '@sunbird/shared';
import { ProfileService } from './../../services';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import * as _ from 'lodash-es';
import { IInteractEventObject, IInteractEventEdata } from '@sunbird/telemetry';
import { OrgDetailsService, ChannelService, FrameworkService, UserService } from '@sunbird/core';
import { Subscription, Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';


@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit, OnDestroy {

  userProfile: any;
  allStates: any;
  allDistricts: any;
  userDetailsForm: FormGroup;
  sbFormBuilder: FormBuilder;
  enableSubmitBtn = false;
  showDistrictDivLoader = false;
  submitNameInteractEdata: IInteractEventEdata;
  submitStateInteractEdata: IInteractEventEdata;
  telemetryInteractObject: IInteractEventObject;
  selectedState;
  selectedDistrict;
  stateControl: any;
  districtControl: any;
  forChanges = {
    prevStateValue: '',
    prevDistrictValue: ''
  };
  userSubscription: Subscription;
  public unsubscribe$ = new Subject<void>();
  boardOption = [];
  mediumOption = [];
  classOption = [];
  frameworkCategories: any;

  constructor(public resourceService: ResourceService, public toasterService: ToasterService,
    public profileService: ProfileService, formBuilder: FormBuilder,
    public userService: UserService, public orgDetailsService: OrgDetailsService, public channelService: ChannelService,
    public frameworkService: FrameworkService) {
    this.sbFormBuilder = formBuilder;
  }

  ngOnInit() {
    this.userSubscription = this.userService.userData$.subscribe((user: IUserData) => {
      if (user.userProfile) {
        this.userProfile = user.userProfile;
        this.initializeFormFields();
        this.getCustodianOrg();
        this.getState();
      }
    });
  }

  initializeFormFields() {
    this.userDetailsForm = this.sbFormBuilder.group({
      name: new FormControl(null, [Validators.required]),
      board: new FormControl(null),
      medium: new FormControl(null),
      class: new FormControl(null),
      state: new FormControl(null, [Validators.required]),
      district: new FormControl(null, [Validators.required]),
      checkbox: new FormControl(null, [Validators.required])
    }, {
      validator: (formControl) => {
        const nameCtrl = formControl.controls.name;
        if (_.trim(nameCtrl.value) === '') { nameCtrl.setErrors({ required: true }); }
        return null;
      }
    });
    this.enableSubmitBtn = (this.userDetailsForm.status === 'VALID');
    this.onStateChange();
    this.enableSubmitButton();
  }

  getState() {
    const requestData = { 'filters': { 'type': 'state' } };
    this.profileService.getUserLocation(requestData).subscribe(res => {
      this.allStates = res.result.response;
      const location = _.find(this.userProfile.userLocations, (locations) => {
        return locations.type === 'state';
      });
      let locationExist: any;
      if (location) {
        locationExist = _.find(this.allStates, (locations) => {
          this.forChanges.prevStateValue = location.code;
          return locations.code === location.code;
        });
      }
      this.selectedState = locationExist;
      locationExist ? this.userDetailsForm.controls['state'].setValue(locationExist.code) :
        this.userDetailsForm.controls['state'].setValue('');
    }, err => {
      this.toasterService.error(this.resourceService.messages.emsg.m0016);
    });
  }

  getCustodianOrg() {
    this.orgDetailsService.getCustodianOrgDetails()
      .pipe(first(), takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.readChannel(_.get(data, 'result.response.value'));
      });
  }

  readChannel(custodianOrgId) {
    this.channelService.getFrameWork(custodianOrgId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.boardOption = this.getSortedFilters(_.get(data, 'result.channel.frameworks'), 'board');
        this.onBoardChange();
      }, err => {
      });
  }

  clearForm(values) {
    _.forEach(values, value => {
      this.userDetailsForm.controls[`${value}`].setValue('');
    });
  }

  onBoardChange(event?) {
    this.mediumOption = [];
    this.classOption = [];
    this.clearForm(['medium', 'class']);
    if (this.userDetailsForm.value.board) {
      this.frameworkService.getFrameworkCategories(_.get(this.userDetailsForm.value.board, 'identifier'))
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((data) => {
          if (data && _.get(data, 'result.framework.categories')) {
            this.frameworkCategories = _.get(data, 'result.framework.categories');
            const board = _.find(this.frameworkCategories, (element) => {
              return element.code === 'board';
            });
            if (_.get(board, 'terms')) {
              this.mediumOption = this.getSortedFilters(this.getAssociationData(board.terms, 'medium',
                this.frameworkCategories), 'medium');
              this.onMediumChange();
            }
          }
        }, err => {
        });
    }
  }

  onMediumChange(event?) {
    this.classOption = [];
    this.clearForm(['class']);
    if (!_.isEmpty(event)) {
      this.classOption = this.getSortedFilters(this.getAssociationData([event],
        'gradeLevel', this.frameworkCategories), 'gradeLevel');
    }
  }

  getSortedFilters(filters, type) {
    return (type === 'gradeLevel' || _.lowerCase(type) === 'class') ?
      _.sortBy(filters, ['index', 'name']) : _.sortBy(filters, 'name');
  }

  getAssociationData(selectedData: Array<any>, category: string, frameworkCategories) {
    // Getting data for selected parent, eg: If board is selected it will get the medium data from board array
    let selectedCategoryData = [];
    _.forEach(selectedData, (data) => {
      const categoryData = _.filter(data.associations, (o) => {
        return o.category === category;
      });
      if (categoryData) {
        selectedCategoryData = _.concat(selectedCategoryData, categoryData);
      }
    });

    // Getting associated data from next category, eg: If board is selected it will get the association data for medium
    let associationData;
    _.forEach(frameworkCategories, (data) => {
      if (data.code === category) {
        associationData = data.terms;
      }
    });

    // Mapping the final data for next drop down
    let resultArray = [];
    _.forEach(selectedCategoryData, (data) => {
      const codeData = _.find(associationData, (element) => {
        return element.code === data.code;
      });
      if (codeData) {
        resultArray = _.concat(resultArray, codeData);
      }
    });
    return _.sortBy(_.unionBy(resultArray, 'identifier'), 'index');
  }

  enableSubmitButton() {
    this.userDetailsForm.valueChanges.subscribe(val => {
      this.enableSubmitBtn = (this.userDetailsForm.status === 'VALID');
    });
  }

  onStateChange() {
    const stateControl = this.userDetailsForm.get('state');
    let stateValue = '';
    stateControl.valueChanges.subscribe(
      (data: string) => {
        if (stateControl.status === 'VALID' && stateValue !== stateControl.value) {
          const state = _.find(this.allStates, (states) => {
            return states.code === stateControl.value;
          });
          this.getDistrict(state.id);
          stateValue = stateControl.value;
        }
      });
  }

  getDistrict(stateId) {
    this.showDistrictDivLoader = true;
    const requestData = { 'filters': { 'type': 'district', parentId: stateId } };
    this.profileService.getUserLocation(requestData).subscribe(res => {
      this.allDistricts = res.result.response;
      this.showDistrictDivLoader = false;
      const location = _.find(this.userProfile.userLocations, (locations) => {
        return locations.type === 'district';
      });
      let locationExist: any;
      if (location) {
        locationExist = _.find(this.allDistricts, (locations) => {
          this.forChanges.prevDistrictValue = location.code;
          return locations.code === location.code;
        });
      }
      this.selectedDistrict = locationExist;
      locationExist ? this.userDetailsForm.controls['district'].setValue(locationExist.code) :
        this.userDetailsForm.controls['district'].setValue('');
    }, err => {
      this.toasterService.error(this.resourceService.messages.emsg.m0017);
    });
  }

  onSubmitForm() {
    console.log('this.userDetailsForm', this.userDetailsForm);
  }

  updateProfile(data) {
    this.profileService.updateProfile(data).subscribe(res => {
      this.toasterService.success(this.resourceService.messages.smsg.m0046);
    }, err => {
      this.toasterService.error(this.resourceService.messages.emsg.m0018);
    });
  }

  ngOnDestroy() {
  }
}
