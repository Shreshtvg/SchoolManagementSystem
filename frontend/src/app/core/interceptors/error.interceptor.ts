import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Intercept 401 Unauthorized responses
        if (error.status === 401) {
          this.toastr.error('Your session has expired. Please log in again.', 'Session Expired');
          this.tokenStorage.signOut(); // Ensure this method exists and clears session/local storage
          this.router.navigate(['/home']); // Or your login route
        }

        // Re-throw the error to be caught by the service/component
        return throwError(() => error);
      })
    );
  }
}