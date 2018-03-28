import { ResourceService } from '@sunbird/shared';
import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
/**
 * Main menu component
 */
@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {
  /**
   * reference of resourceService service.
   */
  public resourceService: ResourceService;
  data: any;
  /*
  * constructor
  */
  constructor(resourceService: ResourceService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.resourceService = resourceService;
  }

  ngOnInit() {
    // this.activatedRoute.data.subscribe( params => {
    //   this.data = params;
    //   console.log(d)
    // });
    }

}
