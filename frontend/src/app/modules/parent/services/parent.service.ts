import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

const API_URL = API_CONFIG.PARENT + '/';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  constructor(private http: HttpClient) { }

  getParentDashboard(): Observable<any> {
    return this.http.get(API_URL + 'dashboard');
  }

  updateStudentDetails(updateData: any): Observable<any> {
    return this.http.put(API_URL + 'student/update', updateData);
  }

  downloadReport(studentId: number): Observable<Blob> {
    return this.http.get(API_URL + `reports/download/${studentId}`, { responseType: 'blob' });
  }
}

