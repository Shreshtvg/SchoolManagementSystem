import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // General Dashboard Properties
  stats: any = { totalStudents: 0, totalTeachers: 0 };
  errorMessage = '';
  activeTab: string = 'students'; // Default to the 'students' tab

  // Properties for Student Management
  students: any[] = [];
  filteredStudents: any[] = [];
  studentSearchTerm: string = '';
  showStudentForm = false;
  isStudentEditMode = false;
  selectedStudent: any = {};
  newStudentWithParent: any = {}; 
  
  // Properties for Teacher Management
  teachers: any[] = [];
  filteredTeachers: any[] = [];
  teacherSearchTerm: string = '';
  showTeacherForm = false;
  isTeacherEditMode = false;
  selectedTeacher: any = {};
  teachersWithClass: any[] = [];
  filteredTeachersWithClass: any[] = [];

  classes: any[] = [];
  showClassForm = false;
  isClassEditMode = false;
  selectedClass: any = {};
  
  // Shared Properties for Dropdowns
  availableClasses: any[] = [];
  availableSubjects: string[] = ['Mathematics', 'Science', 'History', 'English', 'Art']; // Placeholder data

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loadStudents();
    this.loadTeachers();
    this.loadAllClasses();
    this.loadClassesForDropdown();
  }

  // --- Tab Navigation ---
  switchTab(tab: string): void {
    this.activeTab = tab;
    // Hide any open forms when switching tabs
    this.showStudentForm = false;
    this.showTeacherForm = false;
  }

  // --- General Data Loading ---
  loadDashboardStats(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to load dashboard stats.';
        this.toastr.error(this.errorMessage, 'Data Load Error');
      }
    });
  }

  loadClassesForDropdown(): void {
    this.adminService.getAllClasses().subscribe({
      next: data => this.availableClasses = data,
      error: err => this.toastr.error('Failed to load classes for dropdown.')
    });
  }

  // --- Student Management Logic ---
  loadStudents(): void {
    this.adminService.getAllStudents().subscribe({
      next: data => {
        this.students = data;
        this.filteredStudents = data;
        this.applyStudentSearch();
      },
      error: err => this.toastr.error('Failed to load students.')
    });
  }

  applyStudentSearch(): void {
    if (!this.studentSearchTerm || this.studentSearchTerm.trim() === '') {
      this.filteredStudents = this.students;
      return;
    }

    const searchTerm = this.studentSearchTerm.toLowerCase().trim();
    this.filteredStudents = this.students.filter(student => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
      const parentName = (student.parent?.name || '').toLowerCase();
      const className = (student.classDetails ? `${student.classDetails.className} - Section ${student.classDetails.section}` : '').toLowerCase();
      const gender = (student.gender || '').toLowerCase();
      const id = student.id?.toString() || '';

      return fullName.includes(searchTerm) ||
             parentName.includes(searchTerm) ||
             className.includes(searchTerm) ||
             gender.includes(searchTerm) ||
             id.includes(searchTerm);
    });
  }

  showAddStudentForm(): void {
    this.isStudentEditMode = false;
    this.newStudentWithParent = {
      firstName: '', lastName: '', dob: '', gender: 'Male', classId: null,
      parentName: '', parentEmail: '', parentPhone: '', parentUsername: ''
    };
    this.showStudentForm = true;
  }

  showEditStudentForm(student: any): void {
    this.isStudentEditMode = true;
    // Map student data for editing: firstName, lastName, classId, and parentEmail
    this.selectedStudent = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      classId: student.classDetails?.id || null,
      parentEmail: student.parent?.email || ''
    };
    this.showStudentForm = true;
  }

  onNewStudentSubmit(): void {
    this.adminService.createStudent(this.newStudentWithParent).subscribe({
      next: () => {
        this.toastr.success('Student and Parent created successfully!');
        this.loadStudents(); // Reload data (this will also apply search)
        this.loadDashboardStats(); // Update stats
        this.cancelStudentForm();
        this.studentSearchTerm = ''; // Clear search after adding
      },
      error: err => this.toastr.error(err.error.message || 'Failed to create student.')
    });
  }
  
  onEditStudentSubmit(): void {
    // Prepare the update payload with only the fields that can be edited
    const updatePayload = {
      firstName: this.selectedStudent.firstName,
      lastName: this.selectedStudent.lastName,
      classId: this.selectedStudent.classId,
      parentEmail: this.selectedStudent.parentEmail
    };
    
    this.adminService.updateStudent(this.selectedStudent.id, updatePayload).subscribe({
      next: () => {
        this.toastr.success('Student updated successfully!');
        this.loadStudents(); // Reload data (this will also apply search)
        this.loadDashboardStats(); // Update stats
        this.cancelStudentForm();
      },
      error: err => this.toastr.error(err.error?.message || 'Failed to update student.')
    });
  }

  onStudentDelete(studentId: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.adminService.deleteStudent(studentId).subscribe({
        next: () => {
          this.toastr.success('Student deleted successfully!');
          this.loadStudents(); // Reload data (this will also apply search)
          this.loadDashboardStats(); // Update stats
        },
        error: err => this.toastr.error('Failed to delete student.')
      });
    }
  }

  cancelStudentForm(): void {
    this.showStudentForm = false;
    this.isStudentEditMode = false;
    this.selectedStudent = {};
  }

  // --- Teacher Management Logic ---
  loadTeachers(): void {
    this.adminService.getAllTeachers().subscribe({
      next: data => {
        this.teachers = data;
        this.mapTeachersToClasses(); // <-- Call the new method after teachers are loaded
        this.applyTeacherSearch();
      },
      error: err => this.toastr.error('Failed to load teachers.')
    });
  }

  applyTeacherSearch(): void {
    if (!this.teacherSearchTerm || this.teacherSearchTerm.trim() === '') {
      this.filteredTeachersWithClass = this.teachersWithClass;
      return;
    }

    const searchTerm = this.teacherSearchTerm.toLowerCase().trim();
    this.filteredTeachersWithClass = this.teachersWithClass.filter(teacher => {
      const name = (teacher.name || '').toLowerCase();
      const subject = (teacher.subject || '').toLowerCase();
      const email = (teacher.email || '').toLowerCase();
      const assignedClass = (teacher.assignedClassName || '').toLowerCase();
      const id = teacher.id?.toString() || '';

      return name.includes(searchTerm) ||
             subject.includes(searchTerm) ||
             email.includes(searchTerm) ||
             assignedClass.includes(searchTerm) ||
             id.includes(searchTerm);
    });
  }


  showAddTeacherForm(): void {
    this.isTeacherEditMode = false;
    this.selectedTeacher = { id: null, name: '', email: '', subject: null, username: '', classId: null };
    this.showTeacherForm = true;
  }

  showEditTeacherForm(teacher: any): void {
    this.isTeacherEditMode = true;
    
    // Find the class assigned to this teacher to pre-select it in the dropdown
    const assignedClass = this.availableClasses.find(c => c.teacher?.id === teacher.id);
    
    // --- THIS IS THE FIX ---
    // The 'teacher' object contains a 'user' object. We need to get the username from it.
    this.selectedTeacher = { 
      ...teacher, 
      username: teacher.user.username, // <-- Explicitly add the username from the nested user object
      classId: assignedClass ? assignedClass.id : null 
    };

    this.showTeacherForm = true;
  }

  onTeacherSubmit(): void {
    if (this.isTeacherEditMode) {
      this.adminService.updateTeacher(this.selectedTeacher.id, this.selectedTeacher).subscribe({
        next: () => {
          this.toastr.success('Teacher updated successfully!');
          this.loadTeachers();
          this.loadClassesForDropdown();
          this.cancelTeacherForm();
        },
        error: err => this.toastr.error(err.error.message || 'Failed to update teacher.')
      });
    } else {
      this.adminService.createTeacher(this.selectedTeacher).subscribe({
        next: () => {
          this.toastr.success('Teacher created! Credentials sent to email.', 'Success', { timeOut: 6000 });
          this.loadTeachers();
          this.loadDashboardStats(); // Update stats
          this.loadClassesForDropdown();
          this.cancelTeacherForm();
        },
        error: err => this.toastr.error(err.error.message || 'Failed to create teacher.')
      });
    }
  }

  onTeacherDelete(teacherId: number): void {
    if (confirm('Are you sure you want to delete this teacher? This also deletes their login account.')) {
      this.adminService.deleteTeacher(teacherId).subscribe({
        next: () => {
          this.toastr.success('Teacher deleted successfully!');
          this.loadTeachers();
          this.loadDashboardStats(); // Update stats
          this.loadClassesForDropdown();
        },
        error: err => this.toastr.error('Failed to delete teacher.')
      });
    }
  }

  cancelTeacherForm(): void {
    this.showTeacherForm = false;
  }

  // --- NEW Class Management Logic ---
  showAddClassForm(): void {
    this.isClassEditMode = false;
    this.selectedClass = { id: null, className: '', section: '', teacherId: null };
    this.showClassForm = true;
  }

  showEditClassForm(classItem: any): void {
    this.isClassEditMode = true;
    this.selectedClass = { ...classItem, teacherId: classItem.teacher?.id || null };
    this.showClassForm = true;
  }

  onClassNameInput(event: any): void {
    const value = event.target.value;
    // Remove any decimal point or non-numeric characters except empty string
    if (value && (value.includes('.') || isNaN(Number(value)))) {
      event.target.value = value.replace(/[^0-9]/g, '');
      this.selectedClass.className = event.target.value;
    }
  }

  onSectionInput(event: any): void {
    const value = event.target.value;
    // Remove any numbers, keep only letters
    if (value && /[0-9]/.test(value)) {
      event.target.value = value.replace(/[0-9]/g, '');
      this.selectedClass.section = event.target.value;
    }
  }

  onClassSubmit(): void {
    // Validate class name (must be a whole number)
    if (this.selectedClass.className && (this.selectedClass.className.toString().includes('.') || isNaN(Number(this.selectedClass.className)))) {
      this.toastr.error('Class name must be a whole number (no decimals).');
      return;
    }

    // Validate section (must contain only letters)
    if (this.selectedClass.section && /[0-9]/.test(this.selectedClass.section)) {
      this.toastr.error('Section must contain only letters (no numbers).');
      return;
    }

    if (this.isClassEditMode) {
      // Logic for updating...
      this.adminService.updateClass(this.selectedClass.id, this.selectedClass).subscribe({
        next: () => {
          this.toastr.success('Class updated successfully!');
          this.loadAllClasses();      // <-- Step 1: Reloads the data in the background
          this.cancelClassForm();     // <-- Step 2: Hides the form and shows the list
        },
        error: err => this.toastr.error(err.error.message || 'Failed to update class.')
      });
    } else {
      // Logic for creating a new class
      this.adminService.createClass(this.selectedClass).subscribe({
        next: () => {
          this.toastr.success('Class created successfully!');
          this.loadAllClasses();      // <-- Step 1: Reloads the data in the background
          this.cancelClassForm();     // <-- Step 2: Hides the form and shows the list
        },
        error: err => this.toastr.error(err.error.message || 'Failed to create class.')
      });
    }
}

  onClassDelete(classId: number): void {
    if (confirm('Are you sure you want to delete this class?')) {
      this.adminService.deleteClass(classId).subscribe({
        next: () => {
          this.toastr.success('Class deleted successfully!');
          this.loadAllClasses(); // This will call mapTeachersToClasses() after loading
          this.loadStudents(); // Reload students to update their class display
          this.loadTeachers(); // Reload teachers to ensure mapping is updated
        },
        error: err => this.toastr.error('Failed to delete class.')
      });
    }
  }

  loadAllClasses(): void {
    this.adminService.getAllClasses().subscribe({
      next: data => {
        this.classes = data;
        this.mapTeachersToClasses(); // <-- Also call it after classes are loaded
      },
      error: err => this.toastr.error('Failed to load classes.')
    });
  }

  cancelClassForm(): void {
    this.showClassForm = false;
  }



  mapTeachersToClasses(): void {
    // If teachers exist, map them to classes
    if (this.teachers.length > 0) {
      this.teachersWithClass = this.teachers.map(teacher => {
        // For each teacher, find the class that has this teacher's ID
        const assignedClass = this.classes.find(cls => cls.teacher?.id === teacher.id);
        return {
          ...teacher, // Copy all original teacher properties
          assignedClassName: assignedClass ? `${assignedClass.className} - ${assignedClass.section}` : 'Not Assigned'
        };
      });
      this.filteredTeachersWithClass = this.teachersWithClass;
      this.applyTeacherSearch();
    }
  }
}