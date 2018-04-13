
import { SelectFilter } from './../../interfaces/select-filter';
import { ConfigService, ResourceService } from '@sunbird/shared';
import { Component, OnInit, Input, Output, EventEmitter, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '@sunbird/core';
import * as _ from 'lodash';
@Component({
  selector: 'app-home-filter',
  templateUrl: './home-filter.component.html',
  styleUrls: ['./home-filter.component.css']
})

export class HomeFilterComponent implements OnInit {
  @Input() queryParams: any;
  @Output('filter')
  filter = new EventEmitter<any>();
  /**
   * To get url, app configs
   */
  public config: ConfigService;
  private resourceService: ResourceService;
  private searchService: SearchService;
  /**
   * To navigate to other pages
   */
  private router: Router;
  searchBoards: Array<string>;
  searchLanguages: Array<string>;
  searchSubjects: Array<string>;
  label: any;
  refresh = true;
  /**
    * Constructor to create injected service(s) object
    Default method of Draft Component class
    * @param {Router} route Reference of Router
    * @param {PaginationService} paginationService Reference of PaginationService
    * @param {ConfigService} config Reference of ConfigService
  */
  constructor(config: ConfigService,
    resourceService: ResourceService, router: Router,  private cdr: ChangeDetectorRef) {
    this.config = config;
    this.resourceService = resourceService;
    this.router = router;
  }

  concepts(events) {
    const name = [];
    _.forEach( events, (item, key) => {
      console.log(events[key].name);
      name.push(events[key].name);
      console.log(name);
    });
    this.queryParams['Concepts']  = name;
  console.log(this.queryParams['Concepts']);
  }

  removeFilterSelection(filterType, value) {
    this.refresh = false;
    if (filterType === 'selectedConcepts') {
    // for concept picker
    } else {
      const itemIndex = this.queryParams[filterType].indexOf(value);
      if (itemIndex !== -1) {
        console.log(this.queryParams[filterType], value);
        this.queryParams[filterType].splice(itemIndex, 1);
        console.log(this.queryParams[filterType]);
       // this.cdr.detectChanges();
      }
    }
   /// this.appRef.tick();
    setTimeout(() => {
      this.refresh = true;
    }, 0);
  }

  applyFilters() {
    this.filter.emit(this.queryParams);
  }

  resetFilters() {
    this.refresh = false;
    this.queryParams = {};
    this.router.navigate(['/search/All', 1]);
    setTimeout(() => {
      this.refresh = true;
    }, 0);
  }
  ngOnInit() {
    _.forIn(this.queryParams, (value, key) => {
      if (typeof value === 'string') {
        this.queryParams[key] = [value];
      }
    });
    this.queryParams = { ...this.config.dropDownConfig.FILTER.SEARCH.All.DROPDOWN, ...this.queryParams };
    console.log(this.queryParams);
    this.label = this.config.dropDownConfig.FILTER.SEARCH.All.label;
    this.searchBoards = this.config.dropDownConfig.FILTER.RESOURCES.boards;
    this.searchLanguages = this.config.dropDownConfig.FILTER.RESOURCES.languages;
    this.searchSubjects = this.config.dropDownConfig.FILTER.RESOURCES.subjects;
  }

}
