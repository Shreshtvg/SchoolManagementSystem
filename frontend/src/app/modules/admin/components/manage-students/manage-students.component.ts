import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-students',
  templateUrl: './manage-students.component.html',
  styleUrls: ['./manage-students.component.scss']
})
export class ManageStudentsComponent implements OnInit {
  students: any[] = [];
  showForm = false;
  isEditMode = false;
  isLoading = true;
  
  selectedStudent: any = {
    id: null,
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    parentId: null,
    classId: null
  };

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.adminService.getAllStudents().subscribe({
      next: data => {
        this.students = data;
        this.isLoading = false;
      },
      error: err => {
        this.toastr.error('Failed to load students.');
        this.isLoading = false;
      }
    });
  }

  showAddForm(): void {
    this.isEditMode = false;
    this.selectedStudent = { id: null, firstName: '', lastName: '', dob: '', gender: 'Male', parentId: null, classId: null };
    this.showForm = true;
  }

  showEditForm(student: any): void {
    this.isEditMode = true;
    this.selectedStudent = { ...student };
    this.showForm = true;
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.adminService.updateStudent(this.selectedStudent.id, this.selectedStudent).subscribe({
        next: () => {
          this.toastr.success('Student updated successfully!');
          this.loadStudents();
          this.cancel();
        },
        error: err => this.toastr.error('Failed to update student.')
      });
    } else {
      this.adminService.createStudent(this.selectedStudent).subscribe({
        next: () => {
          this.toastr.success('Student created successfully!');
          this.loadStudents();
          this.cancel();
        },
        error: err => this.toastr.error('Failed to create student.')
      });
    }
  }

  onDelete(studentId: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.adminService.deleteStudent(studentId).subscribe({
        next: () => {
          this.toastr.success('Student deleted successfully!');
          this.loadStudents();
        },
        error: err => this.toastr.error('Failed to delete student.')
      });
    }
  }

  cancel(): void {
    this.showForm = false;
  }
}