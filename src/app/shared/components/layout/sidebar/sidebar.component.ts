import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserType } from '../../../../models/user-type.enum';
import { User } from '../../../../models/user.model';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  user: User | null = null;
  userType?: UserType;
  UserType = UserType; // For template access

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.user = user;
      if (user) {
        this.userType = user.userType;
      } else {
        // Reset userType when user is null (logged out)
        this.userType = undefined;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    // Navigate to login page after logout
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.user) return 'U';

    // Since User model doesn't have a name property, use email for initials
    const email = this.user.email;
    if (!email) return 'U';

    // Use first letter of email as initial
    return email.charAt(0).toUpperCase();
  }

  getUserFullName(): string {
    if (!this.user) return 'User';

    // Since User model doesn't have a name property, use email without domain
    const email = this.user.email;
    if (!email) return 'User';

    // Use part before @ as name
    const nameFromEmail = email.split('@')[0];
    return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
  }

  getUserRoleLabel(): string {
    if (!this.userType) return '';

    switch (this.userType) {
      case UserType.Admin:
        return 'Administrator';
      case UserType.Client:
        return 'Client';
      case UserType.Driver:
        return 'Driver';
      case UserType.Customer:
        return 'Customer';
      default:
        return 'User';
    }
  }
}
