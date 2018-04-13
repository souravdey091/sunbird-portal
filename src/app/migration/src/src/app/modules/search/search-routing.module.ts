import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeSearchComponent, UserSearchComponent, UserEditComponent, UserDeleteComponent } from './components';
const routes: Routes = [
  {
    path: 'search/All/:pageNumber', component: HomeSearchComponent, data: { name: 'All' }
  },
  {
    path: 'search/Users/:pageNumber', component: UserSearchComponent, data: { name: 'Users' },
    children: [
      { path: 'edit/:userId', component: UserEditComponent },
     { path: 'delete/:userId', component: UserDeleteComponent, data: { name: 'Users' } }
    ]

  }

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
