import { Component, OnInit } from '@angular/core';
import { ParentService } from '../../services/parent.service';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../../../../core/services/token-storage.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-parent-dashboard',
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.scss']
})
export class ParentDashboardComponent implements OnInit {
  dashboardData: any = {};
  parent: any = {};
  student: any = {};
  attendance: any[] = [];
  marks: any[] = [];
  
  isLoading = true;
  isEditing = false;
  
  editForm: any = {
    firstName: '',
    lastName: '',
    dob: '',
    parentEmail: ''
  };

  constructor(
    private parentService: ParentService,
    private toastr: ToastrService,
    private tokenStorage: TokenStorageService
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.parentService.getParentDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.parent = data.parent || {};
        this.student = data.student || {};
        this.attendance = data.attendance || [];
        this.marks = data.marks || [];
        
        // Initialize edit form
        this.editForm = {
          firstName: this.student.firstName || '',
          lastName: this.student.lastName || '',
          dob: this.student.dob || '',
          parentName: this.parent.name || '',
          parentEmail: this.parent.email || '',
          parentPhone: this.parent.phone || ''
        };
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.toastr.error('Failed to load dashboard data.');
        this.isLoading = false;
      }
    });
  }

  startEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    // Reset form to original values
    this.editForm = {
      firstName: this.student.firstName || '',
      lastName: this.student.lastName || '',
      dob: this.student.dob || '',
      parentName: this.parent.name || '',
      parentEmail: this.parent.email || '',
      parentPhone: this.parent.phone || ''
    };
  }

  saveChanges(): void {
    // Build update data object, only including non-empty fields
    const updateData: any = {};
    
    if (this.editForm.firstName && this.editForm.firstName.trim()) {
      updateData.firstName = this.editForm.firstName.trim();
    }
    if (this.editForm.lastName && this.editForm.lastName.trim()) {
      updateData.lastName = this.editForm.lastName.trim();
    }
    // Only include dob if it's not empty
    if (this.editForm.dob && this.editForm.dob.trim() && this.editForm.dob !== '') {
      updateData.dob = this.editForm.dob.trim();
    }
    if (this.editForm.parentName && this.editForm.parentName.trim()) {
      updateData.parentName = this.editForm.parentName.trim();
    }
    if (this.editForm.parentEmail && this.editForm.parentEmail.trim()) {
      updateData.parentEmail = this.editForm.parentEmail.trim();
    }
    if (this.editForm.parentPhone && this.editForm.parentPhone.trim()) {
      updateData.parentPhone = this.editForm.parentPhone.trim();
    }

    this.parentService.updateStudentDetails(updateData).subscribe({
      next: () => {
        this.toastr.success('Details updated successfully!');
        this.isEditing = false;
        this.loadDashboard(); // Reload to get updated data
      },
      error: (err) => {
        console.error('Error updating details:', err);
        const errorMessage = err?.error?.message || err?.message || 'Failed to update details.';
        this.toastr.error(errorMessage);
      }
    });
  }

  getOverallAttendancePercentage(): number {
    if (!this.attendance || this.attendance.length === 0) return 0;
    
    let totalDays = 0;
    let totalAttended = 0;
    
    this.attendance.forEach(att => {
      const workingDays = att.totalWorkingDays || 0;
      const attended = att.daysAttended || att.noOfDaysAttended || 0;
      totalDays += workingDays;
      totalAttended += attended;
    });
    
    if (totalDays === 0) return 0;
    return (totalAttended / totalDays) * 100;
  }

  getAttendanceStatus(): string {
    const percentage = this.getOverallAttendancePercentage();
    return percentage >= 75 ? 'Good Attendance' : 'Poor Attendance';
  }

  getOverallAverageMarks(): number {
    if (!this.marks || this.marks.length === 0) return 0;
    const uniqueMarks = this.getUniqueMarksPerSubject(this.marks);
    return this.calculateAverageMarks(uniqueMarks);
  }

  // Get unique marks per subject (keep the latest one based on ID)
  private getUniqueMarksPerSubject(marksList: any[]): any[] {
    if (!marksList || marksList.length === 0) return [];
    
    const marksMap = new Map<number, any>();
    
    marksList.forEach((mark: any) => {
      const subjectId = mark.subjectId || mark.subject?.id;
      if (subjectId) {
        const existingMark = marksMap.get(subjectId);
        // Keep the mark with the highest ID (most recent)
        if (!existingMark || (mark.id && mark.id > existingMark.id)) {
          marksMap.set(subjectId, mark);
        }
      }
    });
    
    return Array.from(marksMap.values());
  }

  // Calculate average marks from a marks list
  private calculateAverageMarks(marksList: any[]): number {
    if (!marksList || marksList.length === 0) return 0;
    const total = marksList.reduce((sum: number, mark: any) => {
      return sum + (mark.marksObtained || 0);
    }, 0);
    return total / marksList.length;
  }

  getPassFailStatus(): string {
    const average = this.getOverallAverageMarks();
    return average >= 40 ? 'PASS' : 'FAIL';
  }

  getMarksForSubject(subjectId: number): number {
    const mark = this.marks.find(m => (m.subjectId === subjectId || m.subject?.id === subjectId));
    return mark?.marksObtained || 0;
  }

  getSubjectName(subjectId: number): string {
    const mark = this.marks.find(m => (m.subjectId === subjectId || m.subject?.id === subjectId));
    return mark?.subject?.name || `Subject ${subjectId}`;
  }

  downloadReport(): void {
    if (!this.student?.id) {
      this.toastr.error('Student information not available.');
      return;
    }

    this.toastr.info('Generating report...');
    
    try {
      // Get attendance data
      const attendancePercentage = this.getOverallAttendancePercentage();
      const attendanceStatus = this.getAttendanceStatus() === 'Good Attendance' ? 'GOOD' : 'BAD';
      const totalDaysAttended = this.attendance.reduce((sum, att) => 
        sum + (att.daysAttended || att.noOfDaysAttended || 0), 0);
      const totalWorkingDays = this.attendance.reduce((sum, att) => 
        sum + (att.totalWorkingDays || 0), 0);
      
      // Get marks data - filter to show only unique marks per subject (latest one)
      const uniqueMarks = this.getUniqueMarksPerSubject(this.marks || []);
      const marksPercentage = this.calculateAverageMarks(uniqueMarks);
      const marksStatus = marksPercentage >= 40 ? 'PASS' : 'FAIL';
      
      // Generate PDF
      const pdf = this.generatePDF(
        this.student,
        this.parent,
        attendancePercentage,
        attendanceStatus,
        totalDaysAttended,
        totalWorkingDays,
        marksPercentage,
        marksStatus,
        uniqueMarks
      );
      
      // Download PDF
      pdf.save(`report-${this.student.firstName}-${this.student.lastName}.pdf`);
      this.toastr.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      this.toastr.error('Failed to generate report.');
    }
  }

  private generatePDF(
    student: any,
    parent: any,
    attendancePercentage: number,
    attendanceStatus: string,
    daysAttended: number,
    totalDays: number,
    marksPercentage: number,
    marksStatus: string,
    marksList: any[]
  ): jsPDF {
    const pdf = new jsPDF();
    let yPosition = 20;
    const margin = 20;
    const lineHeight = 7;
    const sectionSpacing = 10;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STUDENT PERFORMANCE REPORT', margin, yPosition);
    yPosition += 15;

    // Date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    pdf.text(`Generated on: ${currentDate}`, margin, yPosition);
    yPosition += sectionSpacing * 2;

    // Student Details Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STUDENT DETAILS', margin, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${student.firstName || ''} ${student.lastName || ''}`, margin, yPosition);
    yPosition += lineHeight;

    if (student.dob) {
      const dob = new Date(student.dob).toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      pdf.text(`Date of Birth: ${dob}`, margin, yPosition);
      yPosition += lineHeight;
    }

    if (student.classDetails) {
      pdf.text(`Class: ${student.classDetails.className || ''} - Section: ${student.classDetails.section || ''}`, margin, yPosition);
      yPosition += lineHeight;
    }

    if (parent) {
      pdf.text(`Parent Name: ${parent.name || 'N/A'}`, margin, yPosition);
      yPosition += lineHeight;
      
      if (parent.email) {
        pdf.text(`Parent Email: ${parent.email}`, margin, yPosition);
        yPosition += lineHeight;
      }

      if (parent.phone) {
        pdf.text(`Parent Phone: ${parent.phone}`, margin, yPosition);
        yPosition += lineHeight;
      }
    }

    yPosition += sectionSpacing;

    // Attendance Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ATTENDANCE PERFORMANCE', margin, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Attendance Percentage: ${attendancePercentage.toFixed(2)}%`, margin, yPosition);
    yPosition += lineHeight;
    pdf.text(`Days Attended: ${daysAttended} / ${totalDays}`, margin, yPosition);
    yPosition += lineHeight;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Status: ${attendanceStatus}`, margin, yPosition);
    yPosition += sectionSpacing;

    // Marks Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MARKS PERFORMANCE', margin, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    if (marksList.length > 0) {
      // Subject-wise marks (already filtered to show unique subjects)
      marksList.forEach((mark: any) => {
        const subjectName = mark.subject?.name || `Subject ${mark.subjectId || mark.subject?.id || ''}`;
        const marksObtained = mark.marksObtained || 0;
        pdf.text(`${subjectName}: ${marksObtained.toFixed(2)}%`, margin, yPosition);
        yPosition += lineHeight;
      });
    } else {
      pdf.text('No marks recorded', margin, yPosition);
      yPosition += lineHeight;
    }

    pdf.text(`Overall Average Marks: ${marksPercentage.toFixed(2)}%`, margin, yPosition);
    yPosition += lineHeight;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Status: ${marksStatus}`, margin, yPosition);

    return pdf;
  }

  getParentName(): string {
    return this.parent?.name || this.tokenStorage.getUser()?.username || 'Parent';
  }
}

