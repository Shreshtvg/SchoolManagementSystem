import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

const API_URL = API_CONFIG.TEACHER + '/';
const ADMIN_API_URL = API_CONFIG.ADMIN + '/'; // For updating profile

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(private http: HttpClient) { }

  getTeacherDashboard(): Observable<any> {
    return this.http.get(API_URL + 'dashboard');
  }

  getTeacherProfile(): Observable<any> {
    return this.http.get(API_URL + 'profile');
  }

  // A teacher can edit their own profile (we use the admin endpoint for this)
  updateProfile(teacherId: number, teacherData: any): Observable<any> {
    return this.http.put(ADMIN_API_URL + `teachers/${teacherId}`, teacherData);
  }

  addOrUpdateAttendance(attendanceData: any): Observable<any> {
    return this.http.post(API_URL + 'attendance', attendanceData);
  }

  addOrUpdateMarks(marksData: any): Observable<any> {
    return this.http.post(API_URL + 'marks', marksData);
  }

  generateReport(studentId: number): Observable<Blob> {
    // We expect a PDF file (Blob) as the response
    return this.http.get(API_URL + `reports/student/${studentId}`, { responseType: 'blob' });
  }

  getStudentAttendance(studentId: number): Observable<any> {
    return this.http.get(API_URL + `attendance/student/${studentId}`);
  }

  getStudentMarks(studentId: number): Observable<any> {
    return this.http.get(API_URL + `marks/student/${studentId}`);
  }

  getAllStudentsAttendance(): Observable<any> {
    return this.http.get(API_URL + 'attendance/all');
  }

  getAllStudentsMarks(): Observable<any> {
    return this.http.get(API_URL + 'marks/all');
  }

  getAllSubjects(): Observable<any> {
    return this.http.get(API_URL + 'subjects');
  }

  deleteAttendance(attendanceId: number): Observable<any> {
    return this.http.delete(API_URL + `attendance/${attendanceId}`, { responseType: 'text' });
  }

  deleteMarks(marksId: number): Observable<any> {
    return this.http.delete(API_URL + `marks/${marksId}`, { responseType: 'text' });
  }
}