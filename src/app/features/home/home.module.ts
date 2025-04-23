import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../_shared/shared.module';
import { HomeComponent } from './home.component';
import {FormTestComponent} from '../../_shared/components/form-test.component';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: HomeComponent },
      { path: 'form-test', component: FormTestComponent }
    ])
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
