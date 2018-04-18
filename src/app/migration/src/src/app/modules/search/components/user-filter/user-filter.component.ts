import { ConfigService, ResourceService } from '@sunbird/shared';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '@sunbird/core';
import * as _ from 'lodash';
@Component({
  selector: 'app-user-filter',
  templateUrl: './user-filter.component.html',
  styleUrls: ['./user-filter.component.css']
})

export class UserFilterComponent implements OnInit {
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
  searchGrades: Array<string>;
  searchMediums: Array<string>;
  searchSubjects: Array<string>;
  searchRoles: Array<string>;
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
    resourceService: ResourceService, router: Router) {
    this.config = config;
    this.resourceService = resourceService;
    this.router = router;
  }

  removeFilterSelection(filterType, value) {
    this.refresh = false;
    if (filterType === 'selectedConcepts') {

    } else {
      const itemIndex = this.queryParams[filterType].indexOf(value);
      if (itemIndex !== -1) {
        console.log(this.queryParams[filterType], value);
        this.queryParams[filterType].splice(itemIndex, 1);
        console.log(this.queryParams[filterType]);
      }
    }
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
    this.router.navigate(['/search/Users', 1]);
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
    this.queryParams = { ...this.config.dropDownConfig.FILTER.SEARCH.Users.DROPDOWN, ...this.queryParams };
    console.log(this.queryParams);
    this.searchGrades = this.config.dropDownConfig.COMMON.grades;
    this.searchMediums = this.config.dropDownConfig.COMMON.medium;
    this.searchSubjects = this.config.dropDownConfig.FILTER.RESOURCES.subjects;
    this.searchRoles = this.config.dropDownConfig.FILTER.RESOURCES.roles;

    this.label = this.config.dropDownConfig.FILTER.SEARCH.Users.label;


  }

}

