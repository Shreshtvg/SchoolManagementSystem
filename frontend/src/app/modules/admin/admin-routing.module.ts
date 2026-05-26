import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { FeesManagementComponent } from './components/fees-management/fees-management.component';
import { ManageStudentsComponent } from './components/manage-students/manage-students.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'fees', component: FeesManagementComponent },
  { path: 'students', component: ManageStudentsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }