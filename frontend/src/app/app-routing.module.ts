import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './core/guards/auth.guard'; // <-- Import the guard

const routes: Routes = [
  // Public routes
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // --- PROTECTED ROUTES ---
  {
    path: 'admin',
    canActivate: [AuthGuard], // Apply the guard
    data: { roles: ['ROLE_ADMIN'] }, // Specify required role
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'teacher',
    canActivate: [AuthGuard], // Apply the guard
    data: { roles: ['ROLE_TEACHER'] }, // Specify required role
    loadChildren: () => import('./modules/teacher/teacher.module').then(m => m.TeacherModule)
  },
  {
    path: 'parent',
    canActivate: [AuthGuard], // Apply the guard
    data: { roles: ['ROLE_PARENT'] }, // Specify required role
    loadChildren: () => import('./modules/parent/parent.module').then(m => m.ParentModule)
  },

  // Default and fallback routes
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' } // Redirect any unknown URL to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }