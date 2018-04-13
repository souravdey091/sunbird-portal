import { SharedModule } from '@sunbird/shared';
import { SearchRoutingModule } from './search-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuiModule } from 'ng2-semantic-ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeSearchComponent, HomeFilterComponent  } from './components/index';
import { UserSearchComponent } from './components/user-search/user-search.component';
import { UserFilterComponent } from './components/user-filter/user-filter.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UserDeleteComponent } from './components/user-delete/user-delete.component';
import { UserSearchService } from './services';

@NgModule({
  imports: [
    CommonModule,
    SearchRoutingModule,
    SharedModule,
    SuiModule,
    FormsModule
  ],
  declarations: [ HomeSearchComponent, HomeFilterComponent, UserSearchComponent,
  UserFilterComponent, UserEditComponent, UserDeleteComponent],
  providers: [UserSearchService]
})
export class SearchModule { }
