import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private tokenStorageService: TokenStorageService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const user = this.tokenStorageService.getUser();
    
    // 1. Check if user is logged in
    if (user && user.roles) {
      const requiredRoles = route.data['roles'] as Array<string>;

      // 2. Check if the route requires a specific role
      if (requiredRoles) {
        // 3. Check if the user's role matches any of the required roles
        const hasRole = user.roles.some((role: string) => requiredRoles.includes(role));
        if (hasRole) {
          return true; // Access granted
        }
      }

      // If user is logged in but has the wrong role, redirect to their own dashboard
      const userRole = user.roles[0];
      if (userRole === 'ROLE_ADMIN') this.router.navigate(['/admin']);
      else if (userRole === 'ROLE_TEACHER') this.router.navigate(['/teacher']);
      else if (userRole === 'ROLE_PARENT') this.router.navigate(['/parent']);
      else this.router.navigate(['/home']);
      
      return false; // Access denied
    }

    // Not logged in, redirect to login page
    this.router.navigate(['/home']);
    return false; // Access denied
  }
}