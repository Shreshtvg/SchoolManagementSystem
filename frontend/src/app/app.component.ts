import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from './core/services/token-storage.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  isLoggedIn = false;
  username?: string;
  currentRoute: string = '';

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to all router events
    this.router.events.subscribe(event => {
      // Inside the subscription, check if the event is a NavigationEnd event
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        // Update login state on every route change
        this.updateLoginState();
      }
    });

    // Initial check
    this.updateLoginState();
  }

  updateLoginState(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.username = user?.username || '';
    } else {
      this.username = '';
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
  }
}