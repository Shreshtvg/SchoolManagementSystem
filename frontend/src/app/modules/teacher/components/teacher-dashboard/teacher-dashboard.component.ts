import { Component, OnInit } from '@angular/core';
import { TeacherService } from '../../services/teacher.service';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver'; // To handle file downloads
import { TokenStorageService } from '../../../../core/services/token-storage.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileEditModalComponent } from '../profile-edit-modal/profile-edit-modal.component';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit {
  // Main data
  teacherData: any = {}; // Holds teacher profile and assigned class
  students: any[] = [];
  studentsWithData: any[] = []; // Students with attendance and marks data
  teacherName: string = '';
  subjects: any[] = []; // All available subjects

  // State management
  isLoading = true;
  selectedStudent: any = null; // The student currently being managed
  activeStudentTab: string = 'attendance'; // Default tab for student management
  editingAttendance: { [key: number]: boolean } = {}; // Track which student's attendance is being edited
  editingMarks: { [key: number]: boolean } = {}; // Track which student's marks are being edited
  studentMarksData: { [key: number]: { [key: number]: number } } = {}; // Store marks for each student by subjectId

  // Form models
  profileData: any = {};
  attendanceData: any = {};
  marksData: any = {};
  
  // Current month for attendance
  currentMonth: string = new Date().toLocaleString('default', { month: 'long' });

  constructor(
    private teacherService: TeacherService,
    private tokenStorage: TokenStorageService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.teacherName = this.tokenStorage.getUser().username;
    this.loadSubjects();
    this.loadDashboard();
  }

  loadSubjects(): void {
    this.teacherService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects || [];
      },
      error: (err) => {
        console.warn('Could not load subjects:', err);
        this.subjects = [];
      }
    });
  }

  loadDashboard(): void {
    this.isLoading = true;
    
    // Load dashboard data first
    this.teacherService.getTeacherDashboard().subscribe({
      next: (dashboardData) => {
        this.teacherData = dashboardData || {};
        this.students = dashboardData?.students || [];

        // Prepare profileData - use teacher data directly from response
        if (dashboardData?.teacher) {
          this.profileData = {
            name: dashboardData.teacher.name || 'N/A',
            subject: dashboardData.teacher.subject || 'N/A',
            email: dashboardData.teacher.email || 'N/A'
          };
        } else if (dashboardData?.assignedClass?.teacher) {
          // Fallback to assignedClass.teacher if teacher is not directly available
          this.profileData = {
            name: dashboardData.assignedClass.teacher.name || 'N/A',
            subject: dashboardData.assignedClass.teacher.subject || 'N/A',
            email: dashboardData.assignedClass.teacher.email || 'N/A'
          };
        } else {
          // If no class assigned and no students, fetch teacher profile separately
          if (!dashboardData?.assignedClass && (!dashboardData?.students || dashboardData.students.length === 0)) {
            this.loadTeacherProfile();
          } else {
            // If no teacher data available, set defaults
            this.profileData = {
              name: 'N/A',
              subject: 'N/A',
              email: 'N/A'
            };
          }
        }

        // Now try to load attendance and marks separately (don't fail if these fail)
        this.loadAttendanceAndMarks();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        // Initialize with empty data instead of showing error
        this.teacherData = {};
        this.students = [];
        this.studentsWithData = [];
        // Try to load teacher profile separately
        this.loadTeacherProfile();
        this.isLoading = false;
        // Try to load attendance and marks anyway
        this.loadAttendanceAndMarks();
      }
    });
  }

  loadTeacherProfile(): void {
    // Fetch teacher profile data when no class is assigned
    this.teacherService.getTeacherProfile().subscribe({
      next: (teacher) => {
        this.profileData = {
          name: teacher.name || 'N/A',
          subject: teacher.subject || 'N/A',
          email: teacher.email || 'N/A'
        };
        // Also update teacherData for consistency
        if (!this.teacherData.teacher) {
          this.teacherData.teacher = teacher;
        }
      },
      error: (err) => {
        console.warn('Could not load teacher profile:', err);
        // Set defaults if profile load fails
        this.profileData = {
          name: 'N/A',
          subject: 'N/A',
          email: 'N/A'
        };
      }
    });
  }

  loadAttendanceAndMarks(): void {
    // Load attendance - handle errors gracefully
    this.teacherService.getAllStudentsAttendance().subscribe({
      next: (attendanceList) => {
        // Filter duplicates: keep only the latest attendance per student and month
        const attendanceMap = new Map<string, any>();
        (attendanceList || []).forEach((attendance: any) => {
          const key = `${attendance.studentId || attendance.student?.id}_${attendance.month}`;
          if (key && key !== 'undefined_undefined') {
            const existingAttendance = attendanceMap.get(key);
            // Keep the attendance with the highest ID (most recent)
            if (!existingAttendance || (attendance.id && attendance.id > existingAttendance.id)) {
              attendanceMap.set(key, attendance);
            }
          }
        });
        attendanceList = Array.from(attendanceMap.values());
        // Load marks - handle errors gracefully
        this.teacherService.getAllStudentsMarks().subscribe({
          next: (marksList) => {
            this.mapStudentData(attendanceList || [], marksList || []);
          },
          error: (marksErr) => {
            console.warn('Could not load marks:', marksErr);
            // Continue with empty marks
            this.mapStudentData(attendanceList || [], []);
          }
        });
      },
      error: (attendanceErr) => {
        console.warn('Could not load attendance:', attendanceErr);
        // Try to load marks anyway
        this.teacherService.getAllStudentsMarks().subscribe({
          next: (marksList) => {
            this.mapStudentData([], marksList || []);
          },
          error: (marksErr) => {
            console.warn('Could not load marks:', marksErr);
            // Continue with empty data
            this.mapStudentData([], []);
          }
        });
      }
    });
  }

  mapStudentData(attendanceList: any[], marksList: any[]): void {
    this.studentsWithData = this.students.map((student: any) => {
      // Find attendance for current month or latest
      const studentAttendance = attendanceList
        .filter((a: any) => a.student?.id === student.id || a.studentId === student.id)
        .sort((a: any, b: any) => {
          const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                             'July', 'August', 'September', 'October', 'November', 'December'];
          return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
        })[0];

      // Find all marks for this student
      const studentMarks = marksList.filter((m: any) => 
        (m.student?.id === student.id || m.studentId === student.id)
      );

      return {
        ...student,
        attendance: studentAttendance || {
          percentage: 0,
          status: 'POOR',
          daysAttended: 0,
          totalWorkingDays: 0,
          month: this.currentMonth
        },
        marks: studentMarks.length > 0 ? studentMarks : []
      };
    });
  }
  
  // THIS METHOD OPENS THE MODAL
  openProfileEditModal(): void {
    const modalRef = this.modalService.open(ProfileEditModalComponent);
    // Pass the current profile data to the modal
    modalRef.componentInstance.profileData = { ...this.profileData };

    // Handle the result when the modal is closed
    modalRef.result.then(
      (result) => {
        // This block runs when the modal is closed with data (i.e., "Save" was clicked)
        this.profileData = result;
        this.onProfileUpdate(); // Call the existing update method
      },
      (reason) => {
        // This block runs when the modal is dismissed (e.g., "Cancel" or backdrop click)
        console.log('Modal dismissed');
      }
    );
  }


  onProfileUpdate(): void {
    // Check if teacher data exists before updating - try teacher first, then assignedClass.teacher
    const teacher = this.teacherData?.teacher || this.teacherData?.assignedClass?.teacher;
    
    if (!teacher) {
      this.toastr.warning('Teacher data not available.');
      return;
    }

    const updatePayload = {
        name: teacher.name || this.profileData.name,
        subject: teacher.subject || this.profileData.subject,
        email: this.profileData.email,
        username: teacher.user?.username || '',
    };
    
    if (!teacher.id) {
      this.toastr.warning('Teacher ID not available.');
      return;
    }

    this.teacherService.updateProfile(teacher.id, updatePayload).subscribe({
      next: () => {
        this.toastr.success('Profile updated successfully!');
        this.loadDashboard(); // Refresh data from backend
      },
      error: err => this.toastr.error('Failed to update profile.')
    });
  }

  // --- Student Management ---
  selectStudent(student: any): void {
    this.selectedStudent = student;
    this.activeStudentTab = 'attendance'; // Reset to attendance tab
    // Reset forms
    this.attendanceData = { studentId: student.id, month: 'January', daysAttended: 0, totalWorkingDays: 20 };
    this.marksData = { studentId: student.id, subjectId: null, marksObtained: 0 };
  }

  closeStudentView(): void {
    this.selectedStudent = null;
  }

  switchStudentTab(tab: string): void {
    this.activeStudentTab = tab;
  }

  onAttendanceSubmit(): void {
    this.teacherService.addOrUpdateAttendance(this.attendanceData).subscribe({
      next: () => {
        this.toastr.success(`Attendance for ${this.selectedStudent.firstName} saved!`);
        this.closeStudentView();
        this.loadDashboard(); // Reload to refresh data
      },
      error: err => this.toastr.error('Failed to save attendance.')
    });
  }
  
  onMarksSubmit(): void {
    this.teacherService.addOrUpdateMarks(this.marksData).subscribe({
      next: () => {
        this.toastr.success(`Marks for ${this.selectedStudent.firstName} saved!`);
        this.closeStudentView();
        this.loadDashboard(); // Reload to refresh data
      },
      error: err => this.toastr.error('Failed to save marks.')
    });
  }

  // Edit attendance inline
  startEditAttendance(student: any): void {
    this.editingAttendance[student.id] = true;
    if (!student.attendance) {
      student.attendance = {
        studentId: student.id,
        month: this.currentMonth,
        daysAttended: 0,
        totalWorkingDays: 0
      };
    } else {
      student.attendance.studentId = student.id;
      student.attendance.daysAttended = student.attendance.daysAttended || student.attendance.noOfDaysAttended || 0;
      student.attendance.totalWorkingDays = student.attendance.totalWorkingDays || 0;
    }
  }

  getMaxDaysInMonth(month: string): number {
    const monthDays: { [key: string]: number } = {
      'January': 31,
      'February': 29, // Using 29 to account for leap years
      'March': 31,
      'April': 30,
      'May': 31,
      'June': 30,
      'July': 31,
      'August': 31,
      'September': 30,
      'October': 31,
      'November': 30,
      'December': 31
    };
    return monthDays[month] || 31;
  }

  saveAttendance(student: any): void {
    const month = student.attendance.month || this.currentMonth;
    
    if (!month) {
      this.toastr.error('Please select a month.');
      return;
    }

    // Check for decimal values
    if (student.attendance.daysAttended % 1 !== 0) {
      this.toastr.error('Days attended must be a whole number (no decimals).');
      return;
    }

    if (student.attendance.totalWorkingDays % 1 !== 0) {
      this.toastr.error('Total working days must be a whole number (no decimals).');
      return;
    }

    const maxDays = this.getMaxDaysInMonth(month);
    
    if (student.attendance.daysAttended > maxDays) {
      this.toastr.error(`Days attended cannot exceed ${maxDays} for ${month}.`);
      return;
    }

    if (student.attendance.totalWorkingDays > maxDays) {
      this.toastr.error(`Total working days cannot exceed ${maxDays} for ${month}.`);
      return;
    }

    const attendancePayload = {
      studentId: student.id,
      month: month,
      daysAttended: student.attendance.daysAttended,
      totalWorkingDays: student.attendance.totalWorkingDays
    };

    this.teacherService.addOrUpdateAttendance(attendancePayload).subscribe({
      next: () => {
        this.toastr.success(`Attendance for ${student.firstName} ${student.lastName} saved!`);
        this.editingAttendance[student.id] = false;
        this.loadDashboard();
      },
      error: err => {
        this.toastr.error(err.error?.message || 'Failed to save attendance.');
        console.error(err);
      }
    });
  }

  cancelEditAttendance(studentId: number): void {
    this.editingAttendance[studentId] = false;
    this.loadDashboard(); // Reload to reset changes
  }

  // Edit marks inline
  startEditMarks(student: any): void {
    this.editingMarks[student.id] = true;
    
    // Initialize marks data for this student
    if (!this.studentMarksData[student.id]) {
      this.studentMarksData[student.id] = {};
    }
    
    // Pre-populate with existing marks
    if (student.marks && student.marks.length > 0) {
      student.marks.forEach((mark: any) => {
        const subjectId = mark.subjectId || mark.subject?.id;
        if (subjectId) {
          this.studentMarksData[student.id][subjectId] = mark.marksObtained || 0;
        }
      });
    }
  }

  saveMarks(student: any, subjectId: number, marksObtained: number): void {
    if (marksObtained === null || marksObtained === undefined || marksObtained < 0) {
      this.toastr.warning('Please enter valid marks (0 or greater).');
      return;
    }

    const marksPayload = {
      studentId: student.id,
      subjectId: subjectId,
      marksObtained: marksObtained
    };

    this.teacherService.addOrUpdateMarks(marksPayload).subscribe({
      next: () => {
        this.toastr.success(`Marks for ${student.firstName} ${student.lastName} saved!`);
        this.loadDashboard();
      },
      error: err => {
        this.toastr.error('Failed to save marks.');
        console.error(err);
      }
    });
  }

  saveAllMarks(student: any): void {
    if (!this.studentMarksData[student.id]) {
      this.toastr.warning('No marks to save.');
      return;
    }

    let savedCount = 0;
    let errorCount = 0;
    const subjectIds = Object.keys(this.studentMarksData[student.id]);

    if (subjectIds.length === 0) {
      this.toastr.warning('Please enter marks for at least one subject.');
      return;
    }

    // Save marks for all subjects
    subjectIds.forEach((subjectIdStr) => {
      const subjectId = parseInt(subjectIdStr, 10);
      const marksObtained = this.studentMarksData[student.id][subjectId];
      
      if (marksObtained !== null && marksObtained !== undefined && marksObtained >= 0) {
        const marksPayload = {
          studentId: student.id,
          subjectId: subjectId,
          marksObtained: marksObtained
        };

        this.teacherService.addOrUpdateMarks(marksPayload).subscribe({
          next: () => {
            savedCount++;
            if (savedCount + errorCount === subjectIds.length) {
              if (errorCount === 0) {
                this.toastr.success(`All marks for ${student.firstName} ${student.lastName} saved!`);
              } else {
                this.toastr.warning(`Saved ${savedCount} marks, ${errorCount} failed.`);
              }
              this.editingMarks[student.id] = false;
              this.loadDashboard();
            }
          },
          error: err => {
            errorCount++;
            console.error(`Failed to save marks for subject ${subjectId}:`, err);
            if (savedCount + errorCount === subjectIds.length) {
              if (errorCount === 0) {
                this.toastr.success(`All marks for ${student.firstName} ${student.lastName} saved!`);
              } else {
                this.toastr.warning(`Saved ${savedCount} marks, ${errorCount} failed.`);
              }
              this.editingMarks[student.id] = false;
              this.loadDashboard();
            }
          }
        });
      }
    });
  }

  getMarksForSubject(student: any, subjectId: number): number {
    if (!this.studentMarksData[student.id]) {
      return 0;
    }
    return this.studentMarksData[student.id][subjectId] || 0;
  }

  setMarksForSubject(student: any, subjectId: number, marks: number): void {
    if (!this.studentMarksData[student.id]) {
      this.studentMarksData[student.id] = {};
    }
    this.studentMarksData[student.id][subjectId] = marks;
  }

  cancelEditMarks(studentId: number): void {
    this.editingMarks[studentId] = false;
    this.loadDashboard();
  }

  // Helper methods for display
  getAttendanceStatus(attendance: any): string {
    if (!attendance || attendance.percentage === undefined) {
      return 'POOR';
    }
    return attendance.percentage >= 75 ? 'GOOD' : 'POOR';
  }

  getAttendancePercentage(attendance: any): number {
    if (!attendance) return 0;
    if (attendance.percentage !== undefined) return attendance.percentage;
    if (attendance.totalWorkingDays > 0) {
      return (attendance.daysAttended / attendance.totalWorkingDays) * 100;
    }
    return 0;
  }

  isPassingGrade(marks: number): boolean {
    return marks >= 40; // Assuming 40% is passing
  }

  getTotalMarks(student: any): number {
    if (!student.marks || student.marks.length === 0) return 0;
    return student.marks.reduce((sum: number, m: any) => sum + (m.marksObtained || 0), 0);
  }

  getAverageMarks(student: any): number {
    if (!student.marks || student.marks.length === 0) return 0;
    const uniqueMarks = this.getUniqueMarksPerSubject(student.marks);
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

  getOverallStatus(student: any): { status: string; badgeClass: string } {
    if (!student.marks || student.marks.length === 0 || !student.attendance) {
      return { status: '-', badgeClass: '' };
    }

    const marksPercentage = this.getAverageMarks(student);
    const attendancePercentage = this.getAttendancePercentage(student.attendance);
    
    const marksGood = marksPercentage >= 40;
    const attendanceGood = attendancePercentage >= 75;

    if (marksGood && attendanceGood) {
      return { status: 'GOOD', badgeClass: 'badge-success' };
    } else if (!marksGood && !attendanceGood) {
      return { status: 'BAD', badgeClass: 'badge-danger' };
    } else {
      return { status: 'NEED IMPROVEMENT', badgeClass: 'badge-warning' };
    }
  }

  onGenerateReport(student: any): void {
    this.toastr.info(`Generating report for ${student.firstName}...`);
    
    try {
      // Find the student with full data from studentsWithData
      const studentData = this.studentsWithData.find(s => s.id === student.id) || student;
      
      // Get attendance data
      const attendancePercentage = this.getAttendancePercentage(studentData.attendance);
      const attendanceStatus = this.getAttendanceStatus(studentData.attendance) === 'GOOD' ? 'GOOD' : 'BAD';
      const daysAttended = studentData.attendance?.daysAttended || studentData.attendance?.noOfDaysAttended || 0;
      const totalDays = studentData.attendance?.totalWorkingDays || 0;
      
      // Get marks data - filter to show only unique marks per subject (latest one)
      const marksList = this.getUniqueMarksPerSubject(studentData.marks || []);
      const marksPercentage = this.calculateAverageMarks(marksList);
      const marksStatus = marksPercentage >= 40 ? 'PASS' : 'FAIL';
      
      // Generate PDF
      const pdf = this.generatePDF(
        studentData,
        attendancePercentage,
        attendanceStatus,
        daysAttended,
        totalDays,
        marksPercentage,
        marksStatus,
        marksList
      );
      
      // Download PDF
      pdf.save(`report-${studentData.firstName}-${studentData.lastName}.pdf`);
      this.toastr.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      this.toastr.error('Failed to generate report.');
    }
  }

  private generatePDF(
    student: any,
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

    if (student.parent) {
      pdf.text(`Parent Name: ${student.parent.name || 'N/A'}`, margin, yPosition);
      yPosition += lineHeight;
      
      if (student.parent.email) {
        pdf.text(`Parent Email: ${student.parent.email}`, margin, yPosition);
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
}