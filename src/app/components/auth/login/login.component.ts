import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserType } from '../../../models/user-type.enum';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user) {
          // Redirect based on user type
          switch (user.userType) {
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
              this.errorMessage = 'Unknown user type';
          }
        } else {
          this.errorMessage = 'Invalid email or password';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred during login. Please try again.';
        console.error(error);
      },
    });
  }
}
