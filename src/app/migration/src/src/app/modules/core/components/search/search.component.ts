// import { setTimeout } from 'timers';

import { SearchService } from './../../services/search/search.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ServerResponse } from '@sunbird/shared';

/**
 * Main menu component
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  /**
   * Sui dropdown initiator
   */
  key: string;
  menu: string;
  isOpen: boolean;
  autosuggestData: Array<any> = [];
  searchService: SearchService;
  selectedBoards: any;
  selectedMediums: any;
  selectedSubjects: any;
  queryParam: any;
  url: string;
  value: any;
  model: any;
  constructor(private router: Router, private activatedRoute: ActivatedRoute, searchService: SearchService) {
    this.searchService = searchService;
  }

search = {
   All: '/search/All',
  home: '/search/All',
  learn: '/search/Courses',
  Courses: '/search/Courses',
  resources: '/search/Library',
  Library: '/search/Library',
  Users: '/search/Users',
  profile: '/search/Users'
};

searchUrl = {
home: 'All',
learn: 'Courses',
resources: 'Library',
profile: 'Users'
};
  selectedOption: string;
  // options: Array<string>;
  onChange() {
    console.log(this.search[this.selectedOption]);
     this.router.navigate([this.search[this.selectedOption], 1]);
  }

  onEnter(params) {
    console.log('????', params, this.search[this.selectedOption] );
    this.url = this.search[this.selectedOption];
      this.router.navigate([this.url, 1], {
        queryParams: {key: params, board: this.queryParam.board, language: this.queryParam.language,
        subject: this.queryParam.subject }
      });
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
    this.queryParam = params;
      console.log('/.....', params.board);
    });
    this.router.events
    .filter(e => e instanceof NavigationEnd).subscribe((params: any) => {
      this.value = params.url.split('/' , 3);
      if (this.searchUrl[this.value[1]]) {
        this.selectedOption = this.searchUrl[this.value[1]];
        console.log('/////', this.selectedOption);
      } else if (this.value[1] === 'search') {
        this.selectedOption = this.value[2];
        console.log('.....', this.value[2]);
      } else {
        this.selectedOption = 'All';
      }

    });

  }

}
