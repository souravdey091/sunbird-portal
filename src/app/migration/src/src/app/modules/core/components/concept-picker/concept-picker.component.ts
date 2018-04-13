import { SearchService } from './../../services/search/search.service';
import { ServerResponse, ResourceService, ToasterService } from '@sunbird/shared';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
declare  var $: any;
@Component({
  selector: 'app-concept-picker',
  templateUrl: './concept-picker.component.html',
  styleUrls: ['./concept-picker.component.css']
})
export class ConceptPickerComponent implements OnInit {
  /**
   * concepts list
   */
  concepts = [];
  /**
   * concept Data
   */
  conceptData: object;
  /**
   * selectedConcepts Data
   */
  @Input() selectedConcepts: any;
  /**
   * number of selectedConcepts Data
   */
  contentConcepts: any;
  /**
   * message about how many concept are selected
   */
  pickerMessage: string;
  /**
   * This variable hepls to show and hide page loader.
   * It is kept true by default as at first when we comes
   * to a page the loader should be displayed before showing
   * any data
   */
  showLoader = true;

  @Output('Concepts')
  Concepts = new EventEmitter<any>();

  constructor(public searchService: SearchService) { }
/**
 * checks concept is present or not
 * if present calls loadDomains
 * else calls getConcept
 */
  loadConceptTree() {
    if (this.concepts && this.concepts.length > 0) {
      this.loadDomains(false, this.concepts);
    } else {
     this.getConcept(0, 200, this.loadDomains);
    }
  }
 /**
 * call search api with objectType =['Dimension', 'Domain']
 */
  loadDomains = (err, conceptArr) => {
    const domains = [];
    const searchParams = {
      filters: {
        objectType: ['Dimension', 'Domain']
      }
    };
    this.searchService.compositeSearch(searchParams).subscribe(
      (apiResponse: ServerResponse) => {
        if (apiResponse.result && _.isArray(apiResponse.result.domains)) {
            console.log('response', apiResponse);
            _.forEach(apiResponse.result.domains, (value) => {
              const domain = {};
              domain['id'] = value['identifier'];
              domain['name'] = value['name'];
              const domainChild = [];
              _.forEach(this.getChild(value['identifier']
                , apiResponse.result.dimensions),
              (val) => {
                const dimension = {};
                dimension['id'] = val['id'];
                dimension['name'] = val['name'];
                dimension['nodes'] = this.getChild(val.id, this.concepts);
                domainChild.push(dimension);
              });
              domain['nodes'] = domainChild;
              domains.push(domain);
            });
            this.conceptData = domains;
            this.showLoader = false;
           this.initConceptBrowser();
        }
      }
    );
  }
/**
 * call search api with objectType =['Concept']
 */
  getConcept(offset, limit, callback) {
    const searchParams = {
      filters: {
        objectType: ['Concept']
      },
      offset: offset,
        limit: limit
    };
    this.searchService.compositeSearch(searchParams).subscribe(
      (apiResponse: ServerResponse) => {
        if (apiResponse.result && _.isArray(apiResponse.result.concepts)) {
            _.forEach(apiResponse.result.concepts, (value) => {
              this.concepts.push(value);
            });
            if ((apiResponse.result.count > offset) && apiResponse.result.count > (offset + limit)) {
              offset += limit;
              limit = apiResponse.result.count - limit;
              this.getConcept(offset, limit, callback);
            }  else {
              callback(null, this.concepts);
            }
        }
      }
    );
  }
/**
 * call tree picker
 */
  initConceptBrowser() {
    this.selectedConcepts = this.selectedConcepts || [];
    this.contentConcepts = _.map(this.selectedConcepts, 'identifier');
   this.pickerMessage = this.contentConcepts.length + ' concepts selected';
   $('.tree-picker-selector').val(this.pickerMessage);
    setTimeout(() => {
      $('.tree-picker-selector').treePicker({
        data: this.conceptData,
        name: 'Concepts',
        picked: this.contentConcepts,
        onSubmit:  (nodes) => {
          $('.tree-picker-selector').val(nodes.length + ' concepts selected');
         this.contentConcepts = [];
          _.forEach(nodes, (obj) => {
            this.contentConcepts.push({
              identifier: obj.id,
              name: obj.name
            });
          });
          this.selectedConcepts = this.contentConcepts;
          console.log('selected', this.selectedConcepts);
          this.Concepts.emit(this.selectedConcepts);
        },
        nodeName: 'conceptSelector_treePicker',
        minSearchQueryLength: 1
      });
    }, 500);
  }
   /**
    *  Get child recursively
    */
   getChild(id, resp) {
    const childArray = [];
    _.forEach(resp, (value) => {
      if (value.parent !== undefined) {
        if (value.parent[0] === id) {
          const child = {};
          child['id'] = value['identifier'];
          child['name'] = value['name'];
          child['selectable'] = 'selectable';
          child['nodes'] = this.getChild(value.identifier, resp);
          childArray.push(child);
        }
      }
    });
    return _.uniqBy(childArray, 'id');
  }
/**
 * calls loadConceptTree or initConceptBrowser
 */
  ngOnInit() {
    console.log(this.selectedConcepts);
    if (!this.conceptData) {
      this.loadConceptTree();
    } else {
      this.initConceptBrowser();
    }
}
}
