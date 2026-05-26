import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-fees-management',
  templateUrl: './fees-management.component.html',
  styleUrls: ['./fees-management.component.scss']
})
export class FeesManagementComponent implements OnInit {
  classes: any[] = [];
  selectedClassId: number | null = null;
  studentsWithFees: any[] = [];
  isLoading = false;

  showFeeForm = false;
  selectedStudentFee: any = {};

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.adminService.getAllClasses().subscribe({
      next: data => this.classes = data,
      error: err => this.toastr.error('Failed to load classes.')
    });
  }

  onClassSelect(): void {
    if (this.selectedClassId) {
      this.isLoading = true;
      this.adminService.getFeesByClass(this.selectedClassId).subscribe({
        next: data => {
          this.studentsWithFees = data;
          this.isLoading = false;
        },
        error: err => {
          this.toastr.error('Failed to load student fee details for this class.');
          this.isLoading = false;
        }
      });
    } else {
      this.studentsWithFees = [];
    }
  }

  showFeeEditForm(studentFee: any): void {
    // We pass the full studentFee object to the form
    this.selectedStudentFee = { ...studentFee };
    this.showFeeForm = true;
  }

  onFeeSubmit(): void {
    // Validate that amount paid doesn't exceed total amount
    if (this.selectedStudentFee.amountPaid > this.selectedStudentFee.totalAmount) {
      this.toastr.error('Amount paid more than total');
      return;
    }

    this.adminService.addOrUpdateFee(this.selectedStudentFee).subscribe({
      next: () => {
        this.toastr.success('Fee details saved successfully!');
        this.onClassSelect(); // Refresh the list
        this.cancelFeeForm();
      },
      error: err => this.toastr.error(err.error.message || 'Failed to save fee details.')
    });
  }

  cancelFeeForm(): void {
    this.showFeeForm = false;
  }

  sendReminder(studentId: number): void {
    this.adminService.sendFeeReminder(studentId).subscribe({
      next: () => {
        this.toastr.success('Email sent');
      },
      error: err => {
        this.toastr.error(err.error.message || 'Failed to send fee reminder.');
      }
    });
  }
}