import {Component, OnInit, OnDestroy} from '@angular/core';
import {ResourceService, ToasterService, ServerResponse, UtilService} from '@sunbird/shared';
import {ProfileService} from './../../services';
import {FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import * as _ from 'lodash-es';
import {IInteractEventObject, IInteractEventEdata} from '@sunbird/telemetry';
import {OrgDetailsService, ChannelService, FrameworkService, UserService} from '@sunbird/core';
import {Subscription, Subject} from 'rxjs';
import {Router} from '@angular/router';


@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit, OnDestroy {

  userProfile: any;
  userDetailsForm: FormGroup;
  sbFormBuilder: FormBuilder;
  enableSubmitBtn = false;
  tncLatestVersion: any;
  termsAndConditionLink: any;
  showTncPopup = false;
  instance: string;

  constructor(public resourceService: ResourceService, public toasterService: ToasterService,
              public profileService: ProfileService, formBuilder: FormBuilder, public router: Router,
              public userService: UserService, public orgDetailsService: OrgDetailsService, public channelService: ChannelService,
              public frameworkService: FrameworkService, public utilService: UtilService) {
    this.sbFormBuilder = formBuilder;
  }

  ngOnInit() {
    this.instance = _.upperCase(this.resourceService.instance || 'SUNBIRD');
    this.fetchTncData();
    this.initializeFormFields();
    this.userProfile = this.userService.userProfile;
  }

  fetchTncData() {
    this.profileService.getTncConfig().subscribe((data: ServerResponse) => {
        const response = _.get(data, 'result.response.value');
        if (response) {
          try {
            const tncConfig = this.utilService.parseJson(response);
            this.tncLatestVersion = _.get(tncConfig, 'latestVersion') || {};
            this.termsAndConditionLink = tncConfig[this.tncLatestVersion].url;
          } catch (e) {
            this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
          }
        }
      }, (err) => {
        this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
      }
    );
  }

  showAndHidePopup(mode: boolean) {
    this.showTncPopup = mode;
  }

  initializeFormFields() {
    this.userDetailsForm = this.sbFormBuilder.group({
      name: new FormControl(null, [Validators.required]),
      checkbox: new FormControl(null, [Validators.required])
    }, {
      validator: (formControl) => {
        const nameCtrl = formControl.controls.name;
        if (_.trim(nameCtrl.value) === '') {
          nameCtrl.setErrors({required: true});
        }
        return null;
      }
    });
    this.enableSubmitBtn = (this.userDetailsForm.status === 'VALID');
    this.enableSubmitButton();
  }

  enableSubmitButton() {
    this.userDetailsForm.valueChanges.subscribe(val => {
      this.enableSubmitBtn = (this.userDetailsForm.status === 'VALID');
    });
  }


  onSubmitForm() {
    const createUserRequest = {
      request: {
        firstName: this.userDetailsForm.value.name,
        managedBy: this.userService.userid/*,
        framework: this.userProfile.framework,
        userLocations: this.userProfile.userLocations*/
      }
    };
    this.userService.registerUser(createUserRequest).subscribe((resp: ServerResponse) => {
        const requestBody = {
          request: {
            version: this.userProfile.tncLatestVersion,
            userId: resp.result.userId
          }
        };
        this.userService.acceptTermsAndConditions(requestBody).subscribe(res => {
          this.router.navigate(['/profile/choose-user']);
        }, err => {
          this.toasterService.error(this.resourceService.messages.fmsg.m0085);
        });
      },
      (err) => {
        this.toasterService.error(this.resourceService.messages.fmsg.m0085);
      }
    );
  }

  ngOnDestroy() {
  }
}
