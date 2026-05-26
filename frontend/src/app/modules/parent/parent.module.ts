import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ParentRoutingModule } from './parent-routing.module';
import { ParentDashboardComponent } from './components/parent-dashboard/parent-dashboard.component';

@NgModule({
  declarations: [ParentDashboardComponent],
  imports: [
    CommonModule,
    ParentRoutingModule,
    FormsModule,
    RouterModule
  ]
})
export class ParentModule { }

