import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

const AUTH_API = API_CONFIG.AUTH + '/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  login(credentials: any, expectedRole?: string): Observable<any> {
    const loginData: any = {
      username: credentials.username,
      password: credentials.password,
    };
    
    // Add expected role if provided
    if (expectedRole) {
      loginData.expectedRole = expectedRole;
    }
    
    return this.http.post(
      AUTH_API + 'login',
      loginData,
      httpOptions
    );
  }
  register(user: any): Observable<any> {
    // This method will be used by the Admin-only sign-up page.
    return this.http.post(
      AUTH_API + 'signup',
      {
        username: user.username,
        email: user.email,
        password: user.password,
        role: [user.role], // Send role as an array to match the backend DTO
      },
      httpOptions
    );
  }
}
