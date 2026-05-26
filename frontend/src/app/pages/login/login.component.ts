import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: any = { username: '', password: '' };
  isLoginFailed = false;
  errorMessage = '';
  loginRole = '';

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.redirectToDashboard();
      return;
    }
    this.route.queryParams.subscribe(params => {
        this.loginRole = params['role'] || '';
    });
  }

  onSubmit(): void {
    // Get expected role from URL and send it to backend
    const expectedRole = this.getExpectedRole();
    
    this.authService.login(this.form, this.loginRole || undefined).subscribe({
      next: (data) => {
        // Additional frontend validation (backend also validates)
        if (this.loginRole && !this.validateRole(data.roles)) {
          this.errorMessage = `Access denied: This login page is for ${this.loginRole} only. Please use the correct login page.`;
          this.isLoginFailed = true;
          this.toastr.error(this.errorMessage, 'Access Denied!');
          return;
        }

        this.tokenStorage.saveToken(data.token);
        this.tokenStorage.saveUser(data);
        this.isLoginFailed = false;
        this.toastr.success('Logged in successfully!');
        this.redirectToDashboard();
      },
      error: (err) => {
        // Check if it's a 403 Forbidden (role mismatch) or other error
        if (err.status === 403) {
          this.errorMessage = err.error?.message || `Access denied: This login page is for ${this.loginRole} only.`;
        } else {
          // Show consistent error message for authentication failures
          this.errorMessage = 'Wrong username or password';
        }
        this.isLoginFailed = true;
        this.toastr.error(this.errorMessage, 'Login Failed!');
      }
    });
  }

  validateRole(userRoles: string[]): boolean {
    if (!this.loginRole || this.loginRole === '') {
      // If no role specified in URL, allow any role (for direct login access)
      return true;
    }

    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    const expectedRole = this.getExpectedRole();
    return userRoles.includes(expectedRole);
  }

  getExpectedRole(): string {
    switch (this.loginRole.toLowerCase()) {
      case 'admin':
        return 'ROLE_ADMIN';
      case 'teacher':
        return 'ROLE_TEACHER';
      case 'parent':
        return 'ROLE_PARENT';
      default:
        return '';
    }
  }

  redirectToDashboard(): void {
    const user = this.tokenStorage.getUser();
    if (!user || !user.roles || user.roles.length === 0) {
      this.router.navigate(['/login']);
      return;
    }
    const userRole = user.roles[0];
    switch (userRole) {
      case 'ROLE_ADMIN': this.router.navigate(['/admin']); break;
      case 'ROLE_TEACHER': this.router.navigate(['/teacher']); break;
      case 'ROLE_PARENT': this.router.navigate(['/parent']); break;
      default: this.router.navigate(['/home']); break;
    }
  }
}