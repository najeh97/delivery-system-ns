import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserType } from '../../../../models/user-type.enum';
import { User } from '../../../../models/user.model';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userType?: UserType;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userType = user.userType;
      }
    });
  }

  getDashboardLink(): string {
    switch (this.userType) {
      case UserType.Admin:
        return '/admin/dashboard';
      case UserType.Client:
        return '/client/dashboard';
      case UserType.Driver:
        return '/driver/dashboard';
      case UserType.Customer:
        return '/customer/dashboard';
      default:
        return '/';
    }
  }

  getProfileLink(): string {
    switch (this.userType) {
      case UserType.Client:
        return '/client/profile';
      case UserType.Driver:
        return '/driver/profile';
      case UserType.Customer:
        return '/customer/profile';
      default:
        return '/';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
