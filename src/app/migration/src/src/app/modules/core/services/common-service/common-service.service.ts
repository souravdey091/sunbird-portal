import { Router, ActivatedRoute } from '@angular/router';
import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class MyServiceEvent {
    name: string;
}

@Injectable()
export class CommonService {

  // constructor( private router: Router, private activatedRoute: ActivatedRoute) {
  //   this.activatedRoute.data.subscribe((data: any) => {
  //     console.log('data', data);
  //   });
  // }

  public onChange: EventEmitter<MyServiceEvent> = new EventEmitter<MyServiceEvent>();

  public doSomething(name: string) {
      // do something, then...
      this.onChange.emit({name: name});
      console.log('??????', name);
  }

}
