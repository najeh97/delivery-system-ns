import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../../models/customer.model';
import { AuthService } from '../../../services/auth.service';
import { CustomerService } from '../../../services/customer.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-profile.component.html',
})
export class CustomerProfileComponent implements OnInit {
  profile: Customer | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.customerService.getCustomerByUserId(currentUser.id!).subscribe({
        next: (customer) => {
          if (customer) {
            this.profile = customer;
          } else {
            this.errorMessage = 'Customer profile not found.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading customer profile:', error);
          this.errorMessage = 'Error loading customer profile.';
          this.isLoading = false;
        },
      });
    } else {
      this.errorMessage = 'User not authenticated.';
      this.isLoading = false;
    }
  }

  onSubmit(): void {
    if (!this.profile) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.customerService.updateCustomer(this.profile).subscribe({
      next: (updatedCustomer) => {
        if ('error' in updatedCustomer) {
          this.errorMessage = updatedCustomer.error as string;
          this.notificationService.showError(updatedCustomer.error as string);
        } else {
          this.profile = updatedCustomer;
          this.notificationService.showSuccess('Profile updated successfully!');
        }
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = 'Failed to update profile.';
        this.notificationService.showError('Failed to update profile.');
        this.isSaving = false;
      },
    });
  }
}
