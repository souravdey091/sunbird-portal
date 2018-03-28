import { SharedModule } from '@sunbird/shared';
import { SearchRoutingModule } from './search-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeSearchComponent } from './components/home-search/home-search.component';
import { SuiModule } from 'ng2-semantic-ui/dist';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeFilterComponent } from './components/home-filter/home-filter.component';
@NgModule({
  imports: [
    CommonModule,
    SearchRoutingModule,
    SharedModule,
    SuiModule,
    FormsModule
  ],
  declarations: [ HomeSearchComponent, HomeFilterComponent]
})
export class SearchModule { }
