import { Subscription } from 'rxjs/Subscription';
import { ServerResponse, PaginationService } from '@sunbird/shared';
import { SearchService } from '@sunbird/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPagination } from '@sunbird/announcement';
import 'rxjs/add/observable/forkJoin';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.css']
})
export class HomeSearchComponent implements OnInit {
  searchService: SearchService;
  /**
   * Contains list of published course(s) of logged-in user
   */
  myCoursesList: Array<any> = [];
  key: string;
  board: Array<string>;
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
  queryParams: any;
  language: Array<string>;
  subject: Array<string>;
  /**
     * Contains returned object of the pagination service
  * which is needed to show the pagination on inbox view
     */
  pager: IPagination;

  constructor(searchService: SearchService, route: Router,
    activatedRoute: ActivatedRoute, paginationService: PaginationService) {
    this.searchService = searchService;
    this.route = route;
    this.activatedRoute = activatedRoute;
    this.paginationService = paginationService;
  }

  populateCompositeSearch(route) {
    const searchParams = {
      contentType: ['Collection', 'TextBook', 'LessonPlan', 'Resource', 'Course'],
      limit: this.pageLimit,
      pageNumber: this.pageNumber,
      query: this.key,
      params: {},
      board: this.board,
      language: this.language,
      subject: this.subject
    };
    this.searchService.searchContentByUserId(searchParams).subscribe(
      (apiResponse: ServerResponse) => {
        this.myCoursesList = apiResponse.result.content;
        this.pager = this.paginationService.getPager(apiResponse.result.count, this.pageNumber, this.pageLimit);
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
      queryParams: {
        key: this.key, board: this.board,
        language: this.language, subject: this.subject
      }
    });
  }

  ngOnInit() {
    Observable
      .combineLatest(
      this.activatedRoute.params,
      this.activatedRoute.queryParams,
      (params: any, queryParams: any) => {
        return {
          page: params.pageNumber,
          key: queryParams.key ? queryParams.key : null,
          board: queryParams.board ? queryParams.board : null,
          language: queryParams.language ? queryParams.language : null,
          subject: queryParams.subject ? queryParams.subject : null
        };
      })
      .subscribe(bothParams => {
        if (bothParams.page) {
              this.pageNumber = Number(bothParams.page);
            }
        this.key = bothParams.key;
        this.board = bothParams.board;
        this.language = bothParams.language;
        this.subject = bothParams.subject;
        this.populateCompositeSearch(bothParams);
        console.log('????', bothParams);
      });
  }

}
