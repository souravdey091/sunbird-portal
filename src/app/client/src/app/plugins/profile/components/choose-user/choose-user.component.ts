import {Component, OnInit} from '@angular/core';
import {ProfileService} from './../../services';
import {UserService} from "@sunbird/core";
import {ServerResponse, ToasterService} from "@sunbird/shared";

@Component({
  selector: 'app-choose-user',
  templateUrl: './choose-user.component.html',
  styleUrls: ['./choose-user.component.scss']
})
export class ChooseUserComponent implements OnInit {

  constructor(public profileService: ProfileService, public userService: UserService,
              public toasterService: ToasterService) {
  }

  ngOnInit() {
    this.getManagedUserList();
  }

  getManagedUserList() {
    const fetchManagedUserRequest = {
      request: {
        filters: {
          managedBy: this.userService.userid
        },
        offset: 0,
        limit: 20
      }
    };
    this.profileService.fetchManagedUserList(fetchManagedUserRequest).subscribe((data: ServerResponse) => {
        console.log(data);

      }, (err) => {
        // this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
      }
    );
  }

  switchUser(userId) {
    this.profileService.initiateSwitchUser(userId).subscribe((data) => {
        console.log(data);

      }, (err) => {
        // this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
      }
    );
  }
}
