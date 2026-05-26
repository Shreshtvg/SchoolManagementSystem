import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: any = {
    username: null,
    email: null,
    password: null,
    role: 'admin' // HARD-CODED: This form can only create admin accounts.
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  onSubmit(): void {
    // Call the same register method from the service
    this.authService.register(this.form).subscribe({
      next: (data) => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.toastr.success('Administrator account created! Please log in.', 'Success');
        this.router.navigate(['/login'], { queryParams: { role: 'admin' } }); // Redirect to admin login
      },
      error: (err) => {
        // The backend will send a specific error if an admin already exists.
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
        this.toastr.error(this.errorMessage, 'Registration Failed');
      }
    });
  }
}