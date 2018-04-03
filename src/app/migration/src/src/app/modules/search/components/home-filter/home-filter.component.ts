import { SelectFilter } from './../../interfaces/select-filter';
import { ConfigService, ResourceService } from '@sunbird/shared';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '@sunbird/core';
@Component({
  selector: 'app-home-filter',
  templateUrl: './home-filter.component.html',
  styleUrls: ['./home-filter.component.css']
})

export class HomeFilterComponent implements OnInit {
  @Input() queryParams: any;
  @Output('filter')
  filter = new EventEmitter<any>();
  config: ConfigService;
  resourceService: ResourceService;
  searchService: SearchService;
  searchBoards: Array<string>;
  searchLanguages: Array<string>;
  searchSubjects: Array<string>;
  pageNumber: number;
  selectedBoard: any;
  search: SelectFilter = {};

  constructor(config: ConfigService, searchService: SearchService, private activatedRoute: ActivatedRoute,
    resourceService: ResourceService, private router: Router) {
    this.config = config;
    this.resourceService = resourceService;
    this.searchService = searchService;
  }
  init() {
    this.search.boards = this.search.boards || [];
    this.search.languages = this.search.languages || [];
    this.search.subjects = this.search.subjects || [];
  }

  selectFilter(filterType, value) {
    this.init();
    const itemIndex = this.search[filterType].indexOf(value);
    if (itemIndex === -1) {
      this.search[filterType].push(value);
    } else {
      this.search[filterType].splice(itemIndex, 1);
    }
  }

  removeFilterSelection(filterType, value) {
    if (filterType === 'selectedConcepts') {

    } else {
      const itemIndex = this.search[filterType].indexOf(value);
      if (itemIndex !== -1) {
        this.search[filterType].splice(itemIndex, 1);
      }
    }
  }
  applyFilters() {
    const queryParams = this.search;
    queryParams['key'] = this.queryParams.key;
    console.log('??????', this.queryParams);
    this.filter.emit(queryParams);
    console.log('called', queryParams);
  }

  resetFilters() {
    this.search.boards = [];
    this.search.languages = [];
    this.search.subjects = [];
    this.router.navigate(['/search/All', 1]);
  }
  ngOnInit() {
    this.searchBoards = this.config.dropDownConfig.FILTER.RESOURCES.boards;
    this.searchLanguages = this.config.dropDownConfig.FILTER.RESOURCES.languages;
    this.searchSubjects = this.config.dropDownConfig.FILTER.RESOURCES.subjects;
  }

}
