import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeSearchComponent} from './components';
const routes: Routes = [
  {
     path: 'search/All/:pageNumber', component: HomeSearchComponent, data : {some_data : true}

  }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
