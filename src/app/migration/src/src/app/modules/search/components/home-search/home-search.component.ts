import { ServerResponse, PaginationService, ResourceService, ConfigService, ToasterService, INoResultMessage } from '@sunbird/shared';
import { SearchService } from '@sunbird/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPagination } from '@sunbird/announcement';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.css']
})
export class HomeSearchComponent implements OnInit {
  private searchService: SearchService;
  private resourceService: ResourceService;
  /**
   * To get url, app configs
   */
  public config: ConfigService;
  /**
  * To show toaster(error, success etc) after any API calls
  */
  private toasterService: ToasterService;
  /**
   * Contains list of published course(s) of logged-in user
   */
  searchList: Array<any> = [];
  /**
   * To navigate to other pages
   */
  private route: Router;
  /**
  * To send activatedRoute.snapshot to router navigation
  * service for redirection to parent component
  */
  private activatedRoute: ActivatedRoute;
  /**
   * For showing pagination on inbox list
   */
  private paginationService: PaginationService;
  /**
    * To show / hide no result message when no result found
   */
  noResult = false;
  /**
   * no result  message
  */
  noResultMessage: INoResultMessage;
  /**
    * totalCount of the list
  */
  totalCount: Number;
  /**
   * Current page number of inbox list
   */
  pageNumber = 1;
  /**
	 * Contains page limit of outbox list
	 */
  pageLimit: number;
  /**
   * This variable hepls to show and hide page loader.
   * It is kept true by default as at first when we comes
   * to a page the loader should be displayed before showing
   * any data
   */
  showLoader = true;
  /**
     * loader message
    */
  loaderMessage: any;
  /**
   * Contains returned object of the pagination service
   * which is needed to show the pagination on inbox view
   */
  pager: IPagination;
  /**
   *url value
   */
  queryParams: any;
  /**
     * Constructor to create injected service(s) object
     * Default method of Draft Component class
     * @param {SearchService} searchService Reference of SearchService
     * @param {Router} route Reference of Router
     * @param {PaginationService} paginationService Reference of PaginationService
     * @param {ActivatedRoute} activatedRoute Reference of ActivatedRoute
     * @param {ConfigService} config Reference of ConfigService
   */
  constructor(searchService: SearchService, route: Router,
    activatedRoute: ActivatedRoute, paginationService: PaginationService,
    resourceService: ResourceService, toasterService: ToasterService,
    config: ConfigService) {
    this.searchService = searchService;
    this.route = route;
    this.activatedRoute = activatedRoute;
    this.paginationService = paginationService;
    this.resourceService = resourceService;
    this.toasterService = toasterService;
    this.config = config;
  }
    /**
     * This method sets the make an api call to get all search data with page No and offset
     */
  populateCompositeSearch() {
    this.showLoader = true;
    this.pageLimit = this.config.appConfig.SEARCH.PAGE_LIMIT;
    const searchParams = {
      filters: {
        contentType: ['Collection', 'TextBook', 'LessonPlan', 'Resource', 'Course'],
        board: this.queryParams.boards,
        language: this.queryParams.languages,
        subject: this.queryParams.subjects
      },
      limit: this.pageLimit,
      pageNumber: this.pageNumber,
      query: this.queryParams.key
    };
    this.searchService.compositeSearch(searchParams).subscribe(
      (apiResponse: ServerResponse) => {
        if (apiResponse.result.count && apiResponse.result.content.length > 0) {
          this.showLoader = false;
          this.noResult = false;
          this.searchList = apiResponse.result.content;
          this.totalCount = apiResponse.result.count;
          this.pager = this.paginationService.getPager(apiResponse.result.count, this.pageNumber, this.pageLimit);
          _.forEach(this.searchList, (item, key) => {
            const action = { left: { displayType: 'rating' } };
            this.searchList[key].action = action;
          });
        } else {
          this.noResult = true;
          this.showLoader = false;
          this.noResultMessage = {
            'message': this.resourceService.messages.stmsg.m0008,
            'messageText': this.resourceService.messages.stmsg.m0007
          };
        }
      },
      err => {
        this.showLoader = false;
        this.noResult = false;
        // this.toasterService.error(this.resourceService.messages.fmsg.m0006);
      }
    );
  }
  /**
  * This method helps to navigate to different pages.
  * If page number is less than 1 or page number is greater than total number
  * of pages is less which is not possible, then it returns.
  *
  * @param {number} page Variable to know which page has been clicked
  *
  * @example navigateToPage(1)
  */
  navigateToPage(page: number): undefined | void {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    this.pageNumber = page;
    this.route.navigate(['search/All', this.pageNumber], {
      queryParams: this.queryParams
    });
  }

  onFilter(event) {
    console.log('onfilter', event);
    this.route.navigate(['search/All', this.pageNumber], { queryParams: event });
    console.log('got trigger');
  }

  ngOnInit() {
    Observable
      .combineLatest(
      this.activatedRoute.params,
      this.activatedRoute.queryParams,
      (params: any, queryParams: any) => {
        return {
          params: params,
          queryParams: queryParams
        };
      })
      .subscribe(bothParams => {
        if (bothParams.params.pageNumber) {
          this.pageNumber = Number(bothParams.params.pageNumber);
        }
        this.queryParams = { ...bothParams.queryParams };

        this.populateCompositeSearch();
        console.log(bothParams);
      });
  }

}
