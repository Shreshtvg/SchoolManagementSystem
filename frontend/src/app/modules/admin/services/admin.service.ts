import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

const API_URL = API_CONFIG.ADMIN + '/';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<any> {
    return this.http.get(API_URL + 'dashboard/stats');
  }

  getAllFees(): Observable<any> {
    return this.http.get(API_URL + 'fees');
  }

  sendFeeReminder(studentId: number): Observable<any> {
    return this.http.post(API_URL + `fees/reminder/${studentId}`, {});
  }

  getAllStudents(): Observable<any> {
    return this.http.get(API_URL + 'students');
  }

  createStudent(studentData: any): Observable<any> {
    return this.http.post(API_URL + 'students', studentData);
  }

  updateStudent(id: number, studentData: any): Observable<any> {
    return this.http.put(API_URL + `students/${id}`, studentData);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(API_URL + `students/${id}`, { responseType: 'text' });
  }

  // --- Teacher Management ---
  getAllTeachers(): Observable<any> {
    return this.http.get(API_URL + 'teachers');
  }

  createTeacher(teacherData: any): Observable<any> {
    return this.http.post(API_URL + 'teachers', teacherData);
  }

  updateTeacher(id: number, teacherData: any): Observable<any> {
    return this.http.put(API_URL + `teachers/${id}`, teacherData);
  }

  deleteTeacher(id: number): Observable<any> {
    return this.http.delete(API_URL + `teachers/${id}`, { responseType: 'text' });
  }

  // --- Class Management ---
  getAllClasses(): Observable<any> {
    return this.http.get(API_URL + 'classes');
  }

  createClass(classData: any): Observable<any> {
    return this.http.post(API_URL + 'classes', classData);
  }

  updateClass(id: number, classData: any): Observable<any> {
    return this.http.put(API_URL + `classes/${id}`, classData);
  }

  deleteClass(id: number): Observable<any> {
    return this.http.delete(API_URL + `classes/${id}`, { responseType: 'text' });
  }

  // --- New Fee Management Methods ---
  getFeesByClass(classId: number): Observable<any> {
    return this.http.get(API_URL + `fees/class/${classId}`);
  }

  addOrUpdateFee(feeData: any): Observable<any> {
    return this.http.post(API_URL + 'fees', feeData);
  }

}
