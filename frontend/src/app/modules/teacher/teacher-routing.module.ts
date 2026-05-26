import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { StudentEditComponent } from './components/student-edit/student-edit.component';

const routes: Routes = [
  { path: '', component: TeacherDashboardComponent },
  { path: 'student/:id', component: StudentEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeacherRoutingModule { }