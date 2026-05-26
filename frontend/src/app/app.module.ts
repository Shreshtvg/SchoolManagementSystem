import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // 1. IMPORT HTTP_INTERCEPTORS
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

import { ToastrModule } from 'ngx-toastr';
import { authInterceptorProviders } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor'; // 2. IMPORT THE NEW ERROR INTERCEPTOR

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  // 3. ADD THE NEW INTERCEPTOR TO THE PROVIDERS ARRAY
  providers: [
    authInterceptorProviders, // Your existing interceptor for adding auth tokens
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true } // The new interceptor for handling errors
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }