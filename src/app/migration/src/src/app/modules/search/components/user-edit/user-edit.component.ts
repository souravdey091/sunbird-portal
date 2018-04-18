import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResourceService, ToasterService, RouterNavigationService, ServerResponse } from '@sunbird/shared';
import { UserSearchService } from './../../services';
import * as _ from 'lodash';
import { SearchService, UserService } from '@sunbird/core';

/**
 * The delete component deletes the announcement
 * which is requested by the logged in user have announcement
 * creator access
 */
@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  /**
	 * Contains unique announcement id
	 */
  userId: string;

  selectedOrgName: string;

  /**
	 * Contains announcement details returned from API or object called from
   * announcement service
	 */
  userDetails: any;

  allRoles = [
    {'role': 'COURSE_MENTOR', 'actions': [{}], 'roleName': 'Course Mentor'},
    {'role': 'CONTENT_REVIEWER', 'actions': [{'urls': ['v1/course/create'], 'name': 'createCourse', 'id': 'createCourse'},
    {'urls': [], 'name': 'updateCourse', 'id': 'updateCourse'},
    {'urls': [], 'name': 'createContent', 'id': 'createContent'},
    {'urls': [], 'name': 'updateContent', 'id': 'updateContent'},
    {'urls': [], 'name': 'flagCourse', 'id': 'flagCourse'},
    {'urls': [], 'name': 'flagContent', 'id': 'flagContent'},
    {'urls': ['/v1/course/publish'], 'name': 'publishCourse', 'id': 'publishCourse'},
    {'urls': ['/v1/course/publish'], 'name': 'publishContent', 'id': 'publishContent'}], 'roleName': 'Content Reviewer'},
    {'role': 'TEACHER_BADGE_ISSUER', 'actions': [], 'roleName': 'Teacher Badge Issuer'},
    {'role': 'BOOK_CREATOR', 'actions': [], 'roleName': 'Book Creator'},
    {'role': 'BOOK_REVIEWER', 'actions': [], 'roleName': 'Book Reviewer'},
    {'role': 'OFFICIAL_TEXTBOOK_BADGE_ISSUER', 'actions': [], 'roleName': 'Official TextBook Badge Issuer'},
    {'role': 'PUBLIC', 'actions': [{}], 'roleName': 'Public'},
    {'role': 'ANNOUNCEMENT_SENDER', 'actions': [{}], 'roleName': 'Announcement Sender'},
    {'role': 'CONTENT_CREATOR', 'actions': [{'urls': ['v1/course/create'], 'name': 'createCourse', 'id': 'createCourse'},
    {'urls': [], 'name': 'updateCourse', 'id': 'updateCourse'},
    {'urls': [], 'name': 'createContent', 'id': 'createContent'},
    {'urls': [], 'name': 'updateContent', 'id': 'updateContent'}], 'roleName': 'Content Creator'},
    {'role': 'FLAG_REVIEWER', 'actions': [{}], 'roleName': 'Flag Reviewer'}];


  /**
   * To make get announcement by id
   */
  private searchService: SearchService;
  private userSearchService: UserSearchService;

  /**
   * To send activatedRoute.snapshot to routerNavigationService
   */
  public activatedRoute: ActivatedRoute;

  /**
   * To call resource service which helps to use language constant
   */
  public resourceService: ResourceService;

  /**
   * To show toaster(error, success etc) after any API calls
   */
  private toasterService: ToasterService;

  /**
   * To navigate back to parent component
   */
  public routerNavigationService: RouterNavigationService;

  /**
	 * Constructor to create injected service(s) object
	 *
	 * Default method of DeleteComponent class
	 *
   * @param {UserSearchService} userSearchService Reference of UserSearchService
   * @param {ActivatedRoute} activatedRoute Reference of ActivatedRoute
   * @param {ResourceService} resourceService Reference of ResourceService
   * @param {ToasterService} toasterService Reference of ToasterService
   * @param {RouterNavigationService} routerNavigationService Reference of routerNavigationService
	 */
  constructor(userSearchService: UserSearchService, searchService: SearchService,
    activatedRoute: ActivatedRoute,
    resourceService: ResourceService,
    toasterService: ToasterService,
    routerNavigationService: RouterNavigationService) {
    this.userSearchService = userSearchService;
    this.searchService = searchService;
    this.activatedRoute = activatedRoute;
    this.resourceService = resourceService;
    this.toasterService = toasterService;
    this.routerNavigationService = routerNavigationService;
  }

  /**
   * This method calls the delete API with a particular announcement
   * id and and changes the status to cancelled of that particular
   * announcement.
	 */
  deleteUser(): void {
    const option = { userId: this.userId };
    this.userSearchService.deleteUser(option).subscribe(
      (apiResponse: ServerResponse) => {
        this.toasterService.success(this.resourceService.messages.smsg.m0029);
        this.redirect();
      },
      err => {
        this.toasterService.error(this.resourceService.messages.emsg.m0005);
        this.redirect();
      }
    );
  }

  /**
   * This method helps to redirect to the parent component
   * page, i.e, outbox listing page with proper page number
	 *
	 */
  redirect(): void {
    this.routerNavigationService.navigateToParentUrl(this.activatedRoute.snapshot);
  }

  populateOrgName() {
    // Getting Org Ids
    const orgArray = [];
    _.each(this.userDetails.organisations, (orgKey) => {
      orgArray.push(orgKey.organisationId);
    });

    // Calling Org search API
    this.searchService.getOrganisationDetails({ orgid: orgArray }).subscribe(
      (orgApiResponse: any) => {
        // Setting Org Name
        _.each(this.userDetails.organisations, (org) => {
          const orgNameAndId = _.find(orgApiResponse.result.response.content, function (organisation) {
            return organisation.id === org.organisationId;
          });
          if (orgNameAndId) { org.orgName = orgNameAndId.orgName; }
        });
      }
    );

    console.log('this.userDetails1-----', this.userDetails);

  }

  populateUserDetails() {
    if (this.userSearchService.userDetailsObject === undefined ||
      this.userSearchService.userDetailsObject.id !== this.userId) {
      const option = { userId: this.userId };
      this.userSearchService.getUserById(option).subscribe(
        (apiResponse: ServerResponse) => {
          this.userDetails = apiResponse.result.response;
          this.populateOrgName();
        },
        err => {
          this.toasterService.error(this.resourceService.messages.emsg.m0005);
          this.redirect();
        }
      );
    } else {
      this.userDetails = this.userSearchService.userDetailsObject;
    }
  }

  /**
   * This method sets the annmouncementId and pagenumber from
   * activated route
	 */
  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.userId = params.userId;
    });
    this.populateUserDetails();
  }
}


