import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherService } from '../../services/teacher.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-student-edit',
  templateUrl: './student-edit.component.html',
  styleUrls: ['./student-edit.component.scss']
})
export class StudentEditComponent implements OnInit {
  studentId: number | null = null;
  student: any = null;
  subjects: any[] = [];
  attendanceRecords: any[] = [];
  marksRecords: any[] = [];
  
  // Form data
  newAttendance: any = {
    month: '',
    daysAttended: 0,
    totalWorkingDays: 0
  };
  
  studentMarksData: { [key: number]: number } = {};
  editingAttendanceId: number | null = null;
  editingAttendanceData: any = {};
  showAddAttendanceForm = false;
  showEditMarksForm = false;

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teacherService: TeacherService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.studentId = +this.route.snapshot.paramMap.get('id')!;
    // Initialize with current month and auto-fill total days
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    this.newAttendance.month = currentMonth;
    this.newAttendance.totalWorkingDays = this.getMaxDaysInMonth(currentMonth);
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Load subjects
    this.teacherService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects || [];
      },
      error: (err) => {
        console.warn('Could not load subjects:', err);
        this.subjects = [];
      }
    });

    // Load student data
    this.teacherService.getStudentAttendance(this.studentId!).subscribe({
      next: (attendanceList) => {
        // Filter duplicates: keep only the latest attendance per month
        const attendanceMap = new Map<string, any>();
        (attendanceList || []).forEach((attendance: any) => {
          const month = attendance.month;
          if (month) {
            const existingAttendance = attendanceMap.get(month);
            // Keep the attendance with the highest ID (most recent)
            if (!existingAttendance || (attendance.id && attendance.id > existingAttendance.id)) {
              attendanceMap.set(month, attendance);
            }
          }
        });
        this.attendanceRecords = Array.from(attendanceMap.values());
        
        // Load marks
        this.teacherService.getStudentMarks(this.studentId!).subscribe({
          next: (marksList) => {
            // Filter duplicates: keep only the latest mark per subject
            const marksMap = new Map<number, any>();
            (marksList || []).forEach((mark: any) => {
              const subjectId = mark.subjectId || mark.subject?.id;
              if (subjectId) {
                const existingMark = marksMap.get(subjectId);
                // Keep the mark with the highest ID (most recent)
                if (!existingMark || (mark.id && mark.id > existingMark.id)) {
                  marksMap.set(subjectId, mark);
                }
              }
            });
            this.marksRecords = Array.from(marksMap.values());
            
            // Initialize marks data
            this.marksRecords.forEach((mark: any) => {
              const subjectId = mark.subjectId || mark.subject?.id;
              if (subjectId) {
                this.studentMarksData[subjectId] = mark.marksObtained || 0;
              }
            });
            
            // Get student info from first attendance or marks record
            if (this.attendanceRecords.length > 0 && this.attendanceRecords[0].student) {
              this.student = this.attendanceRecords[0].student;
            } else if (this.marksRecords.length > 0 && this.marksRecords[0].student) {
              this.student = this.marksRecords[0].student;
            } else {
              // If no records, we need to get student from dashboard
              this.loadStudentFromDashboard();
            }
            
            this.isLoading = false;
          },
          error: (err) => {
            console.warn('Could not load marks:', err);
            this.marksRecords = [];
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.warn('Could not load attendance:', err);
        this.attendanceRecords = [];
        this.loadStudentFromDashboard();
        this.isLoading = false;
      }
    });
  }

  loadStudentFromDashboard(): void {
    this.teacherService.getTeacherDashboard().subscribe({
      next: (dashboardData) => {
        const students = dashboardData?.students || [];
        this.student = students.find((s: any) => s.id === this.studentId);
        if (!this.student) {
          this.toastr.error('Student not found');
          setTimeout(() => {
            this.router.navigate(['/teacher']);
          }, 2000);
        }
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.toastr.error('Failed to load student data');
        setTimeout(() => {
          this.router.navigate(['/teacher']);
        }, 2000);
      }
    });
  }

  // Attendance methods
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

  onMonthChange(month: string, mode: 'add' | 'edit'): void {
    if (!month) return;
    const maxDays = this.getMaxDaysInMonth(month);
    if (mode === 'add') {
      this.newAttendance.month = month;
      this.newAttendance.totalWorkingDays = maxDays;
    } else {
      this.editingAttendanceData.month = month;
      this.editingAttendanceData.totalWorkingDays = maxDays;
    }
  }

  addAttendance(): void {
    if (!this.newAttendance.month) {
      this.toastr.error('Please select a month.');
      return;
    }

    // Check for decimal values
    if (this.newAttendance.daysAttended % 1 !== 0) {
      this.toastr.error('Days attended must be a whole number (no decimals).');
      return;
    }

    if (this.newAttendance.totalWorkingDays % 1 !== 0) {
      this.toastr.error('Total working days must be a whole number (no decimals).');
      return;
    }

    const maxDays = this.getMaxDaysInMonth(this.newAttendance.month);
    
    if (this.newAttendance.daysAttended > maxDays) {
      this.toastr.error(`Days attended cannot exceed ${maxDays} for ${this.newAttendance.month}.`);
      return;
    }

    if (this.newAttendance.totalWorkingDays > maxDays) {
      this.toastr.error(`Total working days cannot exceed ${maxDays} for ${this.newAttendance.month}.`);
      return;
    }

    const attendancePayload = {
      studentId: this.studentId,
      month: this.newAttendance.month,
      daysAttended: this.newAttendance.daysAttended,
      totalWorkingDays: this.newAttendance.totalWorkingDays
    };

    this.teacherService.addOrUpdateAttendance(attendancePayload).subscribe({
      next: () => {
        this.toastr.success('Attendance added successfully!');
        this.showAddAttendanceForm = false; // Hide form after saving
        this.resetNewAttendance();
        this.loadData();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to add attendance.');
        console.error(err);
      }
    });
  }

  showAddAttendance(): void {
    this.showAddAttendanceForm = true;
    // Auto-fill total days when form is shown
    if (this.newAttendance.month) {
      const maxDays = this.getMaxDaysInMonth(this.newAttendance.month);
      this.newAttendance.totalWorkingDays = maxDays;
    }
  }

  cancelAddAttendance(): void {
    this.showAddAttendanceForm = false;
    this.resetNewAttendance();
  }

  startEditAttendance(attendance: any): void {
    this.editingAttendanceId = attendance.id;
    const month = attendance.month;
    const maxDays = this.getMaxDaysInMonth(month);
    this.editingAttendanceData = {
      id: attendance.id,
      month: month,
      daysAttended: attendance.daysAttended || attendance.noOfDaysAttended || 0,
      totalWorkingDays: maxDays
    };
  }

  saveAttendance(): void {
    if (!this.editingAttendanceData.month) {
      this.toastr.error('Please select a month.');
      return;
    }

    // Check for decimal values
    if (this.editingAttendanceData.daysAttended % 1 !== 0) {
      this.toastr.error('Days attended must be a whole number (no decimals).');
      return;
    }

    if (this.editingAttendanceData.totalWorkingDays % 1 !== 0) {
      this.toastr.error('Total working days must be a whole number (no decimals).');
      return;
    }

    const maxDays = this.getMaxDaysInMonth(this.editingAttendanceData.month);
    
    if (this.editingAttendanceData.daysAttended > maxDays) {
      this.toastr.error(`Days attended cannot exceed ${maxDays} for ${this.editingAttendanceData.month}.`);
      return;
    }

    if (this.editingAttendanceData.totalWorkingDays > maxDays) {
      this.toastr.error(`Total working days cannot exceed ${maxDays} for ${this.editingAttendanceData.month}.`);
      return;
    }

    const attendancePayload = {
      studentId: this.studentId,
      month: this.editingAttendanceData.month,
      daysAttended: this.editingAttendanceData.daysAttended,
      totalWorkingDays: this.editingAttendanceData.totalWorkingDays
    };

    this.teacherService.addOrUpdateAttendance(attendancePayload).subscribe({
      next: () => {
        this.toastr.success('Attendance updated successfully!');
        this.editingAttendanceId = null;
        this.editingAttendanceData = {};
        this.loadData();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to update attendance.');
        console.error(err);
      }
    });
  }

  cancelEditAttendance(): void {
    this.editingAttendanceId = null;
    this.editingAttendanceData = {};
  }

  deleteAttendance(attendanceId: number): void {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      this.teacherService.deleteAttendance(attendanceId).subscribe({
        next: () => {
          this.toastr.success('Attendance record deleted successfully!');
          // Remove from local array immediately for better UX
          this.attendanceRecords = this.attendanceRecords.filter(a => a.id !== attendanceId);
          // Small delay to ensure backend deletion is complete, then reload data
          setTimeout(() => {
            this.loadData();
          }, 100);
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to delete attendance record.');
          console.error(err);
        }
      });
    }
  }

  // Marks methods
  getMarksForSubject(subjectId: number): number {
    return this.studentMarksData[subjectId] || 0;
  }

  setMarksForSubject(subjectId: number, marks: number): void {
    this.studentMarksData[subjectId] = marks;
  }

  saveAllMarks(): void {
    const subjectIds = Object.keys(this.studentMarksData);
    
    if (subjectIds.length === 0) {
      this.toastr.warning('Please enter marks for at least one subject.');
      return;
    }

    let savedCount = 0;
    let errorCount = 0;
    const totalSubjects = subjectIds.length;

    subjectIds.forEach((subjectIdStr) => {
      const subjectId = parseInt(subjectIdStr, 10);
      const marksObtained = this.studentMarksData[subjectId];
      
      if (marksObtained !== null && marksObtained !== undefined && marksObtained >= 0) {
        const marksPayload = {
          studentId: this.studentId,
          subjectId: subjectId,
          marksObtained: marksObtained
        };

        this.teacherService.addOrUpdateMarks(marksPayload).subscribe({
          next: () => {
            savedCount++;
            if (savedCount + errorCount === totalSubjects) {
              if (errorCount === 0) {
                this.toastr.success('All marks saved successfully!');
              } else {
                this.toastr.warning(`Saved ${savedCount} marks, ${errorCount} failed.`);
              }
              this.showEditMarksForm = false; // Hide form after saving
              this.loadData();
            }
          },
          error: (err) => {
            errorCount++;
            console.error(`Failed to save marks for subject ${subjectId}:`, err);
            if (savedCount + errorCount === totalSubjects) {
              if (errorCount === 0) {
                this.toastr.success('All marks saved successfully!');
              } else {
                this.toastr.warning(`Saved ${savedCount} marks, ${errorCount} failed.`);
              }
              this.showEditMarksForm = false; // Hide form after saving
              this.loadData();
            }
          }
        });
      } else {
        errorCount++;
        if (savedCount + errorCount === totalSubjects) {
          if (errorCount === 0) {
            this.toastr.success('All marks saved successfully!');
          } else {
            this.toastr.warning(`Saved ${savedCount} marks, ${errorCount} failed.`);
          }
          this.showEditMarksForm = false;
          this.loadData();
        }
      }
    });
  }

  showEditMarks(): void {
    this.showEditMarksForm = true;
    // Load current marks into the form for all subjects
    this.marksRecords.forEach((mark: any) => {
      const subjectId = mark.subjectId || mark.subject?.id;
      if (subjectId) {
        this.studentMarksData[subjectId] = mark.marksObtained || 0;
      }
    });
    // Initialize all subjects with 0 if they don't have marks yet
    this.subjects.forEach((subject: any) => {
      if (!this.studentMarksData[subject.id]) {
        this.studentMarksData[subject.id] = 0;
      }
    });
  }

  cancelEditMarks(): void {
    this.showEditMarksForm = false;
    // Reset marks data
    this.studentMarksData = {};
  }

  deleteMarks(markId: number): void {
    if (confirm('Are you sure you want to delete this marks record?')) {
      this.teacherService.deleteMarks(markId).subscribe({
        next: () => {
          this.toastr.success('Marks record deleted successfully!');
          // Remove from local array immediately for better UX
          this.marksRecords = this.marksRecords.filter(m => m.id !== markId);
          // Small delay to ensure backend deletion is complete, then reload data
          setTimeout(() => {
            this.loadData();
          }, 100);
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to delete marks record.');
          console.error(err);
        }
      });
    }
  }

  getAttendancePercentage(attendance: any): number {
    if (!attendance || !attendance.totalWorkingDays || attendance.totalWorkingDays === 0) {
      return 0;
    }
    const daysAttended = attendance.daysAttended || attendance.noOfDaysAttended || 0;
    return (daysAttended / attendance.totalWorkingDays) * 100;
  }

  getAttendanceStatus(attendance: any): string {
    const percentage = this.getAttendancePercentage(attendance);
    return percentage >= 75 ? 'Good Attendance' : 'Poor Attendance';
  }

  resetNewAttendance(): void {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const maxDays = this.getMaxDaysInMonth(currentMonth);
    this.newAttendance = {
      month: currentMonth,
      daysAttended: 0,
      totalWorkingDays: maxDays
    };
  }

  getFormattedStudentId(): string {
    if (!this.student || !this.student.id) {
      return 'N/A';
    }
    const idStr = this.student.id.toString();
    return idStr.padStart(3, '0');
  }

  goBack(): void {
    this.router.navigate(['/teacher']);
  }
}

