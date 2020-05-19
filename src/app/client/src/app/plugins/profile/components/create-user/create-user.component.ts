import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { ResourceService, ToasterService, IUserData } from '@sunbird/shared';
import { ProfileService } from './../../services';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import * as _ from 'lodash-es';
import { IInteractEventObject, IInteractEventEdata } from '@sunbird/telemetry';
import { Subscription, of, throwError } from 'rxjs';
import { first, mergeMap, map, filter } from 'rxjs/operators';
import { FrameworkService, FormService, UserService, ChannelService, OrgDetailsService } from '@sunbird/core';


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
  public selectedOption: any = {};
  private editMode: boolean;
  private unsubscribe: Subscription;
  private custodianOrg = false;
  public formFieldOptions = [];
  private custodianOrgBoard: any = {};
  private frameWorkId: string;
  private custOrgFrameworks: any;
  private _formFieldProperties: any;
  private categoryMasterList: any = {};

  constructor(public resourceService: ResourceService, public toasterService: ToasterService,
    public profileService: ProfileService, formBuilder: FormBuilder,
    public userService: UserService, private frameworkService: FrameworkService, private formService: FormService,
    private channelService: ChannelService, private orgDetailsService: OrgDetailsService) {
    this.sbFormBuilder = formBuilder;
  }

  ngOnInit() {
    this.userSubscription = this.userService.userData$.subscribe((user: IUserData) => {
      if (user.userProfile) {
        this.userProfile = user.userProfile;
        this.initializeFormFields();
        this.getBMC();
        this.getState();
      }
    });
  }

  getBMC() {
    this.editMode = _.some(this.selectedOption, 'length') || false;
    this.unsubscribe = this.isCustodianOrgUser().pipe(
      mergeMap((custodianOrgUser: boolean) => {
        this.custodianOrg = custodianOrgUser;
        return this.getFormOptionsForCustodianOrg();
      })).subscribe(data => {
        this.formFieldOptions = data;
        console.log('this.formFieldOptions', this.formFieldOptions);
      }, err => {
        this.toasterService.warning(this.resourceService.messages.emsg.m0012);
      });
  }

  private getFormOptionsForCustodianOrg() {
    return this.getCustodianOrgData().pipe(mergeMap((data) => {
      this.custodianOrgBoard = data;
      const boardObj = _.cloneDeep(this.custodianOrgBoard);
      boardObj.range = _.sortBy(boardObj.range, 'index');
      const board = boardObj;
      if (_.get(this.selectedOption, 'board[0]')) { // update mode, get 1st board framework and update all fields
        this.selectedOption.board = _.get(this.selectedOption, 'board[0]');
        this.frameWorkId = _.get(_.find(this.custOrgFrameworks, { 'name': this.selectedOption.board }), 'identifier');
        return this.getFormatedFilterDetails().pipe(map((formFieldProperties) => {
          this._formFieldProperties = formFieldProperties;
          this.mergeBoard(); // will merge board from custodian org and board from selected framework data
          return this.getUpdatedFilters(board, true);
        }));
      } else {
        const fieldOptions = [board,
          { code: 'medium', label: 'Medium', index: 2 },
          { code: 'gradeLevel', label: 'Class', index: 3 }];
        return of(fieldOptions);
      }
    }));
  }

  private getFormatedFilterDetails() {
    this.frameworkService.initialize(this.frameWorkId);
    return this.frameworkService.frameworkData$.pipe(
      filter((frameworkDetails: any) => { // wait to get the framework name if passed as input
        if (!frameworkDetails.err) {
          const framework = this.frameWorkId ? this.frameWorkId : 'defaultFramework';
          if (!_.get(frameworkDetails.frameworkdata, framework)) {
            return false;
          }
        }
        return true;
      }),
      mergeMap((frameworkDetails: any) => {
        if (!frameworkDetails.err) {
          const framework = this.frameWorkId ? this.frameWorkId : 'defaultFramework';
          const frameworkData = _.get(frameworkDetails.frameworkdata, framework);
          this.frameWorkId = frameworkData.identifier;
          this.categoryMasterList = frameworkData.categories;
          return this.getFormDetails();
        } else {
          return throwError(frameworkDetails.err);
        }
      }), map((formData: any) => {
        const formFieldProperties = _.filter(formData, (formFieldCategory) => {
          formFieldCategory.range = _.get(_.find(this.categoryMasterList, { code: formFieldCategory.code }), 'terms') || [];
          return true;
        });
        return _.sortBy(_.uniqBy(formFieldProperties, 'code'), 'index');
      }), first());
  }
  private getFormDetails() {
    const formServiceInputParams = {
      formType: 'user',
      formAction: 'update',
      contentType: 'framework',
      framework: this.frameWorkId
    };
    return this.formService.getFormConfig(formServiceInputParams, this.userService.hashTagId);
  }
  public handleFieldChange(event, field) {
    if (!this.custodianOrg || field.index !== 1) { // no need to fetch data, just rearrange fields
      this.formFieldOptions = this.getUpdatedFilters(field);
      return;
    }
    this.frameWorkId = _.get(_.find(field.range, { name: _.get(this.selectedOption, field.code) }), 'identifier');
    if (this.unsubscribe) { // cancel if any previous api call in progress
      this.unsubscribe.unsubscribe();
    }
    this.unsubscribe = this.getFormatedFilterDetails().pipe().subscribe(
      (formFieldProperties) => {
        if (!formFieldProperties.length) {
        } else {
          this._formFieldProperties = formFieldProperties;
          this.mergeBoard();
          this.formFieldOptions = this.getUpdatedFilters(field);
        }
      }, (error) => {
        this.toasterService.warning(this.resourceService.messages.emsg.m0012);
      });
  }
  private mergeBoard() {
    _.forEach(this._formFieldProperties, (field) => {
      if (field.code === 'board') {
        field.range = _.unionBy(_.concat(field.range, this.custodianOrgBoard.range), 'name');
      }
    });
  }
  private getUpdatedFilters(field, editMode = false) {
    const targetIndex = field.index + 1; // only update next field if not editMode
    const formFields = _.reduce(this.formFieldProperties, (accumulator, current) => {
      if (current.index === targetIndex || editMode) {
        const parentField: any = _.find(this.formFieldProperties, { index: current.index - 1 }) || {};
        const parentAssociations = _.reduce(parentField.range, (collector, term) => {
          const selectedFields = this.selectedOption[parentField.code] || [];
          if ((selectedFields.includes(term.name) || selectedFields.includes(term.code))) {
            const selectedAssociations = _.filter(term.associations, { category: current.code }) || [];
            collector = _.concat(collector, selectedAssociations);
          }
          return collector;
        }, []);
        const updatedRange = _.filter(current.range, range => _.find(parentAssociations, { code: range.code }));
        current.range = updatedRange.length ? updatedRange : current.range;
        current.range = _.unionBy(current.range, 'identifier');
        if (!editMode) {
          this.selectedOption[current.code] = [];
        }
        accumulator.push(current);
      } else {
        if (current.index <= field.index) { // retain options for already selected fields
          const updateField = current.code === 'board' ? current : _.find(this.formFieldOptions, { index: current.index });
          accumulator.push(updateField);
        } else { // empty filters and selection
          current.range = [];
          this.selectedOption[current.code] = [];
          accumulator.push(current);
        }
      }
      return accumulator;
    }, []);
    return formFields;
  }
  private getCustodianOrgData() {
    return this.channelService.getFrameWork(this.userService.hashTagId).pipe(map((channelData: any) => {
      this.custOrgFrameworks = _.get(channelData, 'result.channel.frameworks') || [];
      this.custOrgFrameworks = _.sortBy(this.custOrgFrameworks, 'index');
      return {
        range: this.custOrgFrameworks,
        label: 'Board',
        code: 'board',
        index: 1
      };
    }));
  }

  private isCustodianOrgUser() {
    return this.orgDetailsService.getCustodianOrg().pipe(map((custodianOrg) => {
      if (_.get(this.userService, 'userProfile.rootOrg.rootOrgId') === _.get(custodianOrg, 'result.response.value')) {
        return true;
      }
      return false;
    }));
  }
  get formFieldProperties() {
    return _.cloneDeep(this._formFieldProperties);
  }



  initializeFormFields() {
    this.userDetailsForm = this.sbFormBuilder.group({
      name: new FormControl(null, [Validators.required]),
      board: new FormControl(null),
      state: new FormControl(null, [Validators.required]),
      district: new FormControl(null, [Validators.required])
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
    this.setInteractEventData();
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
    this.stateControl = this.userDetailsForm.get('state');
    this.districtControl = this.userDetailsForm.get('district');
    this.enableSubmitBtn = false;
    if ((this.forChanges.prevDistrictValue !== this.districtControl.value)
      || (this.forChanges.prevStateValue !== this.stateControl.value)) {
      document.getElementById('stateModifiedButton').click();
    }
    if (_.trim(this.userDetailsForm.value.name) !== this.userProfile.firstName) {
      document.getElementById('nameModifiedButton').click();
    }
    const locationCodes = [];
    if (this.userDetailsForm.value.state) { locationCodes.push(this.userDetailsForm.value.state); }
    if (this.userDetailsForm.value.district) { locationCodes.push(this.userDetailsForm.value.district); }
    const data = { firstName: _.trim(this.userDetailsForm.value.name), locationCodes: locationCodes };
    this.updateProfile(data);
  }

  updateProfile(data) {
    this.profileService.updateProfile(data).subscribe(res => {
      this.toasterService.success(this.resourceService.messages.smsg.m0046);
    }, err => {
      this.toasterService.error(this.resourceService.messages.emsg.m0018);
    });
  }

  setInteractEventData() {
    this.submitNameInteractEdata = {
      id: 'submit-personal-details',
      type: 'click',
      pageid: 'profile-read'
    };
    this.submitStateInteractEdata = {
      id: 'profile-edit-address',
      type: 'click',
      pageid: 'profile-read'
    };
    this.telemetryInteractObject = {
      id: this.userService.userid,
      type: 'User',
      ver: '1.0'
    };
  }

  ngOnDestroy() {
  }
}
