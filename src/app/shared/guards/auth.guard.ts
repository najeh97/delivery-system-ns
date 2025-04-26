import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserType } from '../../models/user-type.enum';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(childRoute);
  }

  private checkAuth(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles = route.data['roles'] as UserType[];

    if (!this.authService.isLoggedIn()) {
      // Store the attempted URL for redirecting after login
      this.router.navigate(['/login']);
      return false;
    }

    const currentUser = this.authService.getCurrentUser();
    if (currentUser && allowedRoles && allowedRoles.includes(currentUser.userType)) {
      return true;
    }

    // User doesn't have the required role, redirect to appropriate dashboard
    if (currentUser) {
      switch (currentUser.userType) {
        case UserType.Admin:
          this.router.navigate(['/admin/dashboard']);
          break;
        case UserType.Client:
          this.router.navigate(['/client/dashboard']);
          break;
        case UserType.Customer:
          this.router.navigate(['/customer/dashboard']);
          break;
        case UserType.Driver:
          this.router.navigate(['/driver/dashboard']);
          break;
        default:
          this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }

    return false;
  }
}
