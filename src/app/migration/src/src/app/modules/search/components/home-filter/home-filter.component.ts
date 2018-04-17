
import { SelectFilter } from './../../interfaces/select-filter';
import { ConfigService, ResourceService } from '@sunbird/shared';
import { Component, OnInit, Input, Output, EventEmitter, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
    resourceService: ResourceService, router: Router, private activatedRoute: ActivatedRoute, private cdr: ChangeDetectorRef) {
    this.config = config;
    this.resourceService = resourceService;
    this.router = router;
  }
  concepts(events) {
    const name = [];
    _.forEach(events, (item, key) => {
      name.push(events[key].identifier);
      this.isNumber(item);
      console.log(typeof item, item);
    });
    this.queryParams['Concepts'] = events;
  }
  isNumber(val) { return typeof val === 'object'; }
  removeFilterSelection(filterType, value) {
    const itemIndex = this.queryParams[filterType].indexOf(value);
    if (itemIndex !== -1) {
      console.log(this.queryParams[filterType], value);
      this.queryParams[filterType].splice(itemIndex, 1);
      console.log(this.queryParams[filterType]);
      this.refresh = false;
      this.cdr.detectChanges();
      this.refresh = true;
    }
  }

  applyFilters() {
    const queryParams = {};
    _.forIn(this.queryParams, (value, key) => {
      if (value.length > 0) {
        queryParams[key] = value;
        console.log('apply', key , value);
      }
    });
    _.forEach( this.queryParams['Concepts'], (item, key) => {
      this.queryParams['Concepts'][key] = item.identifier;
      console.log(this.queryParams['Concepts'][key]);
    });
    console.log('queryPrams', queryParams);
    this.queryParams = queryParams;
    this.router.navigate(['/search/All', 1], { queryParams: this.queryParams });
  }


  resetFilters() {
    this.queryParams = {};
    this.router.navigate(['/search/All', 1]);
    this.refresh = false;
    this.cdr.detectChanges();
    this.refresh = true;
  }
  ngOnInit() {
    _.forIn(this.queryParams, (value, key) => {
      if (typeof value === 'string') {
        this.queryParams[key] = [value];
      }
    });
    this.queryParams = { ...this.config.dropDownConfig.FILTER.SEARCH.All.DROPDOWN, ...this.queryParams };
    this.label = this.config.dropDownConfig.FILTER.SEARCH.All.label;
    this.searchBoards = this.config.dropDownConfig.FILTER.RESOURCES.boards;
    this.searchLanguages = this.config.dropDownConfig.FILTER.RESOURCES.languages;
    this.searchSubjects = this.config.dropDownConfig.FILTER.RESOURCES.subjects;
  }

}
