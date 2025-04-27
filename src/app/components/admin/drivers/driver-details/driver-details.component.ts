import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Driver } from '../../../../models/driver.model';
import { DriverService } from '../../../../services/driver.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-driver-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-details.component.html',
})
export class DriverDetailsComponent implements OnInit {
  driver: Driver | null = null;
  editedDriver: Driver | null = null;
  isLoading = true;
  isEditing = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private driverService: DriverService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadDriverDetails();
  }

  loadDriverDetails(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Driver ID not found';
      this.isLoading = false;
      return;
    }

    this.driverService.getDriverById(id).subscribe({
      next: (driver) => {
        if (driver) {
          this.driver = driver;
          // Create a copy for editing
          this.editedDriver = { ...driver };
        } else {
          this.errorMessage = 'Driver not found';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading driver details';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  toggleEditing(): void {
    this.isEditing = true;
    if (this.driver) {
      // Create a fresh copy of the driver data for editing
      this.editedDriver = { ...this.driver };
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  saveChanges(): void {
    if (!this.editedDriver) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.driverService.updateDriver(this.editedDriver).subscribe({
      next: (updatedDriver) => {
        this.driver = updatedDriver;
        this.isEditing = false;
        this.isLoading = false;
        this.notificationService.showSuccess('Driver information updated successfully');
      },
      error: (error) => {
        this.errorMessage = 'Error updating driver';
        this.notificationService.showError('Failed to update driver information');
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  confirmDelete(): void {
    if (!this.driver) return;

    if (confirm(`Are you sure you want to delete driver ${this.driver.name}?`)) {
      this.deleteDriver();
    }
  }

  deleteDriver(): void {
    if (!this.driver) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.driverService.deleteDriver(this.driver.id).subscribe({
      next: (success) => {
        if (success) {
          this.notificationService.showSuccess('Driver deleted successfully');
          this.router.navigate(['/admin/drivers']);
        } else {
          this.errorMessage = 'Failed to delete driver';
          this.notificationService.showError('Failed to delete driver');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error deleting driver';
        this.notificationService.showError('Error deleting driver');
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/drivers']);
  }
}
