import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { ProfileEditModalComponent } from './components/profile-edit-modal/profile-edit-modal.component';
import { StudentEditComponent } from './components/student-edit/student-edit.component';

@NgModule({
  declarations: [TeacherDashboardComponent, ProfileEditModalComponent, StudentEditComponent],
  imports: [
    CommonModule,
    TeacherRoutingModule,
    FormsModule,
    RouterModule,
    NgbModule
  ]
})
export class TeacherModule { }