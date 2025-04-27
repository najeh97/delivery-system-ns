import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Driver } from '../../../models/driver.model';
import { AuthService } from '../../../services/auth.service';
import { DriverService } from '../../../services/driver.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-driver-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-profile.component.html',
})
export class DriverProfileComponent implements OnInit {
  profile: Driver | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private driverService: DriverService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.driverService.getDriverByUserId(currentUser.id!).subscribe({
        next: (driver) => {
          if (driver) {
            this.profile = driver;
          } else {
            this.errorMessage = 'Driver profile not found.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading driver profile:', error);
          this.errorMessage = 'Error loading driver profile.';
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

    this.driverService.updateDriver(this.profile).subscribe({
      next: (updatedDriver) => {
        if ('error' in updatedDriver) {
          this.errorMessage = updatedDriver.error as string;
          this.notificationService.showError(updatedDriver.error as string);
        } else {
          this.profile = updatedDriver;
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
