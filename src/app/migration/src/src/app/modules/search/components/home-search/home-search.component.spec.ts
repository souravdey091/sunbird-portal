import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {SharedModule, ServerResponse, PaginationService, ResourceService,
  ConfigService, ToasterService, INoResultMessage } from '@sunbird/shared';
import { SearchService, UserService, LearnerService, ContentService} from '@sunbird/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IPagination } from '@sunbird/announcement';
import * as _ from 'lodash';
import { Ng2IziToastModule } from 'ng2-izitoast';
import { Observable } from 'rxjs/Observable';
import { HomeSearchComponent } from './home-search.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {Response} from './home-search.component.spec.data';


describe('HomeSearchComponent', () => {
  let component: HomeSearchComponent;
  let fixture: ComponentFixture<HomeSearchComponent>;
    const resourceBundle = {
      'messages': {
        'stmsg': {
          'm0008': 'no-results',
          'm0007': 'Please search for something else.'
        }
      }
    };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SharedModule, Ng2IziToastModule, RouterTestingModule],
      declarations: [ HomeSearchComponent ],
      providers: [ ResourceService, SearchService, PaginationService, UserService,
        LearnerService, ContentService, ConfigService, ToasterService,
        { provide: ResourceService, useValue: resourceBundle }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call search api', () => {
    const searchService = TestBed.get(SearchService);
    const learnerService = TestBed.get(LearnerService);
    spyOn(searchService, 'compositeSearch').and.callFake(() => Observable.of(Response.successData));
    component.populateCompositeSearch();
    fixture.detectChanges();
    expect(component.searchList).toBeDefined();
    expect(component.totalCount).toBeDefined();
    expect(component.showLoader).toBeFalsy();
    expect(component.noResult).toBeFalsy();
  });
  it('should call search api', () => {
    const searchService = TestBed.get(SearchService);
    const learnerService = TestBed.get(LearnerService);
    spyOn(searchService, 'compositeSearch').and.callFake(() => Observable.of(Response.successDataWithNoCount));
    component.populateCompositeSearch();
    fixture.detectChanges();
    expect(component.showLoader).toBeFalsy();
    expect(component.noResult).toBeTruthy();
  });
  it('should throw error when searchService api is not called', () => {
    const searchService = TestBed.get(SearchService);
    spyOn(searchService, 'compositeSearch').and.callFake(() => Observable.throw({}));
    component.populateCompositeSearch();
    fixture.detectChanges();
    expect(component.showLoader).toBeFalsy();
    expect(component.noResult).toBeFalsy();
  });
});
