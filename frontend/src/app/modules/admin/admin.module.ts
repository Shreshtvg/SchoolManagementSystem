import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { FeesManagementComponent } from './components/fees-management/fees-management.component';
import { ManageStudentsComponent } from './components/manage-students/manage-students.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    FeesManagementComponent,
    ManageStudentsComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }