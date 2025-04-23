import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../_shared/shared.module';
import { FlightSearchComponent } from './flight-search.component';
import { ResultsListComponent } from './components/results-list.component';
import { FlightDetailComponent } from './components/flight-detail.component';

const routes: Routes = [
  { 
    path: '', 
    component: FlightSearchComponent 
  },
  { 
    path: 'results', 
    component: ResultsListComponent 
  },
  { 
    path: ':id', 
    component: FlightDetailComponent 
  }
];

@NgModule({
  declarations: [
    FlightSearchComponent,
    ResultsListComponent,
    FlightDetailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class FlightSearchModule { }