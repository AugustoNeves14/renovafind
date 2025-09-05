import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      // Check if route requires admin role
      if (route.data['requiresAdmin'] && !this.authService.isAdmin()) {
        // Redirect to home if user is not admin
        return this.router.createUrlTree(['/']);
      }
      
      // Check if profile selection is required
      if (route.data['requiresProfile'] && !this.authService.currentProfileValue) {
        // Redirect to profile selection
        return this.router.createUrlTree(['/profile/select']);
      }
      
      return true;
    }

    // Not logged in, redirect to login page with return url
    return this.router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }
}