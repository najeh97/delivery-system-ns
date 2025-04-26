import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserType } from '../../../models/user-type.enum';
import { AuthService } from '../../../services/auth.service';
import { ClientService } from '../../../services/client.service';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  userTypes = UserType;
  userType: UserType | null = null;
  email = '';
  password = '';
  name = '';
  address = '';
  phone = '';
  bankName = '';
  bankAccount = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private customerService: CustomerService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (!this.userType) {
      this.errorMessage = 'Please select an account type';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Register the user first
    const user = {
      email: this.email,
      password: this.password,
      userType: this.userType,
    };

    this.authService.register(user).subscribe({
      next: (registeredUser) => {
        if ('error' in registeredUser) {
          this.isLoading = false;
          this.errorMessage = String(registeredUser.error);
          return;
        }

        // Now create the profile based on user type
        if (registeredUser.userType === UserType.Client) {
          this.createClientProfile(registeredUser.id!);
        } else if (registeredUser.userType === UserType.Customer) {
          this.createCustomerProfile(registeredUser.id!);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred during registration';
        console.error(error);
      },
    });
  }

  private createClientProfile(userId: string): void {
    const client = {
      id: '',
      userId: userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      bankName: this.bankName,
      bankAccount: this.bankAccount,
      approvalStatus: 'pending' as const,
    };

    this.clientService.createClient(client).subscribe({
      next: () => {
        this.isLoading = false;
        // Login the user after successful registration
        this.loginAfterRegistration();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error creating client profile';
        console.error(error);
      },
    });
  }

  private createCustomerProfile(userId: string): void {
    const customer = {
      id: '',
      userId: userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
    };

    this.customerService.createCustomer(customer).subscribe({
      next: () => {
        this.isLoading = false;
        // Login the user after successful registration
        this.loginAfterRegistration();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error creating customer profile';
        console.error(error);
      },
    });
  }

  private loginAfterRegistration(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        if (user) {
          if (user.userType === UserType.Client) {
            this.router.navigate(['/client/dashboard']);
          } else if (user.userType === UserType.Customer) {
            this.router.navigate(['/customer/dashboard']);
          }
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
