import { Injectable, Input } from '@angular/core';
import { UserService } from './../user/user.service';
import { ContentService } from './../content/content.service';
import { ConfigService, ServerResponse } from '@sunbird/shared';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import {SearchParam, Params} from '@sunbird/core';
/**
 * Service to search content
 */
@Injectable()

/**
 * @class SearchService
 */
export class SearchService {
  /**
   * Contains searched content list
   */
  private _searchedContentList: any;

  /**
   * Contains searched organization list
   */
  private _searchedOrganisationList: any;

  /**
   * Reference of user service.
   */
  public user: UserService;

  /**
   * Reference of content service.
   */
  public content: ContentService;

  /**
   * Reference of config service
   */
  public config: ConfigService;

  /**
   * Default method of OrganisationService class
   *
   * @param {UserService} user user service reference
   * @param {ContentService} content content service reference
   * @param {ConfigService} config config service reference
   */
  constructor(user: UserService, content: ContentService, config: ConfigService) {
    this.user = user;
    this.content = content;
    this.config = config;
  }

  /**
   * Search content by user id.
   *
   * @param {SearchParam} requestParam api request data
   */
  searchContentByUserId(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.COMPOSITE.SEARCH,
      data: {
        request: {
          filters: {
            status: requestParam.status || ['Live'],
           // createdBy: requestParam.params.userId ? requestParam.params.userId : this.user.userid,
            contentType: requestParam.contentType || ['Course'],
            concept: requestParam.concept,
            board: requestParam.board,
            language: requestParam.language,
            subject: requestParam.subject,
          },
          limit: requestParam.limit,
          offset: (requestParam.pageNumber - 1) * requestParam.limit,
          query: requestParam.query,
          sort_by: {
            lastUpdatedOn: requestParam.params.lastUpdatedOn || 'desc'
          }
        }
      }
    };

    return this.content.post(option)
    .map((data: ServerResponse) => {
      this._searchedContentList = data.result;
      return data;
    });
  }

  /**
   * Get searched content list
   */
  get searchedContentList(): { content: Array<any>, count: number } {
    return this._searchedContentList;
  }

  /**
   * Get organization details.
   *
   * @param {requestParam} requestParam api request data
   */
  getOrganisationDetails(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.ADMIN.ORG_SEARCH,
      data: {
        request: {
          filters: {
            id: requestParam.orgid,
          }
        }
      }
    };

    return this.content.post(option)
    .map((data: ServerResponse) => {
      this._searchedOrganisationList = data.result.response;
      return data;
    });
  }
  /**
   * Get searched organization list
   */
  get searchedOrganisationList(): { content: Array<any>, count: number } {
    return this._searchedOrganisationList;
  }

  searchContent(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.CONTENT.SEARCH,
      data: {
        request: {
          filters: {
            concept: requestParam.concept,
            contentType: requestParam.contentType || ['Course'],
            objectType: requestParam.objectType,
            board: requestParam.channel,
            language: requestParam.language,
            subject: requestParam.subject,
            gradeLevel: requestParam.gradeLevel
          },
          sort_by: {
            lastUpdatedOn: requestParam.params.lastUpdatedOn || 'desc'
          },
          limit: requestParam.limit,
          offset: requestParam.offset,
          query: requestParam.query
        }
      }
    };

    return this.content.post(option)
    .map((data: ServerResponse) => {
      this._searchedContentList = data.result;
      return data;
    });
  }

  searchCourse(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.COURSE.SEARCH,
      data: {
        request: {
          filters: {
            concept: requestParam.concept,
            contentType: requestParam.contentType || ['Course'],
            objectType: requestParam.objectType,
            board: requestParam.channel,
            language: requestParam.language,
            subject: requestParam.subject,
          },
          sort_by: {
            lastUpdatedOn: requestParam.params.lastUpdatedOn || 'desc'
          },
          limit: requestParam.limit,
          offset: requestParam.offset,
          query: requestParam.query
        }
      }
    };

    return this.content.post(option)
    .map((data: ServerResponse) => {
      this._searchedContentList = data.result;
      return data;
    });
  }

  // getChannel(requestParam: SearchParam) {
  //  const  channel = requestParam.channel;
  //  const option = {
  //   url: this.config.urlConFig.URLS.CHANNEL.READ + channel,
  //  };
  //  return this.content.get(option)
  //  .map((data: ServerResponse) => {
  //   this._searchedContentList = data.result;
  //   return data;
  // });
  // }

  // getFramework() {

  // }
}
