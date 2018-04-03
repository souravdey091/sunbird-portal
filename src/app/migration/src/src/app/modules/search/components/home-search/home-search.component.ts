import { Subscription } from 'rxjs/Subscription';
import { ServerResponse, PaginationService, ResourceService } from '@sunbird/shared';
import { SearchService, CommonService, MyServiceEvent } from '@sunbird/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPagination } from '@sunbird/announcement';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { queryDef } from '@angular/core/src/view/query';


@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.css']
})
export class HomeSearchComponent implements OnInit {
  searchService: SearchService;
  resourceService: ResourceService;
  /**
   * Contains list of published course(s) of logged-in user
   */
  myCoursesList: Array<any> = [];
  /**
   * To navigate to other pages
   */
  route: Router;
  /**
   * To send activatedRoute.snapshot to router navigation
   * service for redirection to parent component
   */
  private activatedRoute: ActivatedRoute;
  /**
   * For showing pagination on inbox list
   */
  private paginationService: PaginationService;
  paramSubscription: Subscription;
  /**
     * Current page number of inbox list
   */
  pageNumber = 1;
  pageLimit = 20;
  /**
   * This variable hepls to show and hide page loader.
   * It is kept true by default as at first when we comes
   * to a page the loader should be displayed before showing
   * any data
   */
  showLoader = true;
  loaderMessage: any;
  /**
     * Contains returned object of the pagination service
  * which is needed to show the pagination on inbox view
     */
  pager: IPagination;
  params: any;
  queryParams: any;
  constructor(searchService: SearchService, route: Router,
    activatedRoute: ActivatedRoute, paginationService: PaginationService,
    resourceService: ResourceService) {
    this.searchService = searchService;
    this.route = route;
    this.activatedRoute = activatedRoute;
    this.paginationService = paginationService;
    this.resourceService = resourceService;
  }

  populateCompositeSearch(bothParams) {
    console.log(this.queryParams.key, bothParams);
    const searchParams = {
      filters: {
        contentType: ['Collection', 'TextBook', 'LessonPlan', 'Resource', 'Course'],
        board: this.queryParams.selectedBoards,
        language: this.queryParams.selectedMediums,
        subject: this.queryParams.selectedSubjects
      },
      limit: this.pageLimit,
      pageNumber: this.pageNumber,
      query: this.queryParams.key,
      params: {}
    };
    this.searchService.compositeSearch(searchParams).subscribe(
      (apiResponse: ServerResponse) => {
        this.showLoader = false;
        this.myCoursesList = apiResponse.result.content;
        this.pager = this.paginationService.getPager(apiResponse.result.count, this.pageNumber, this.pageLimit);
        _.forEach(this.myCoursesList, (item, key) => {
          const action = { left: { displayType: 'rating' } };
          this.myCoursesList[key].action = action;
        });
      },
      err => {
        this.showLoader = false;
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
  }

  ngOnInit() {
    console.log('queryPrams', this.queryParams);
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
        if (bothParams.params.page) {
          this.pageNumber = Number(bothParams.params.page);
        }
        this.params = bothParams.params;
        this.queryParams = bothParams.queryParams;
        this.populateCompositeSearch(bothParams);
        console.log(bothParams);
      });
  }

}
