import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Driver, VehicleType } from '../../../../models/driver.model';
import { UserType } from '../../../../models/user-type.enum';
import { AuthService } from '../../../../services/auth.service';
import { DriverService } from '../../../../services/driver.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-add-driver',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-driver.component.html',
})
export class AddDriverComponent {
  driver: Partial<Driver> = {
    id: '',
    name: '',
    modelName: '',
  };

  selectedVehicleType: VehicleType | null = null;
  email = '';
  phone = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private driverService: DriverService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  onSubmit(): void {
    if (!this.selectedVehicleType) {
      this.errorMessage = 'Please select a vehicle type';
      this.notificationService.showError('Please select a vehicle type');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Set the vehicle type from the selected value
    this.driver.vehicleType = this.selectedVehicleType;

    // First register the user account
    const user = {
      email: this.email,
      password: this.password,
      userType: UserType.Driver,
    };

    this.authService.register(user).subscribe({
      next: (registeredUser) => {
        if ('error' in registeredUser) {
          this.isLoading = false;
          this.errorMessage = registeredUser.error as string;
          this.notificationService.showError(registeredUser.error as string);
          return;
        }

        // Now create the driver profile
        this.driver.userId = registeredUser.id;

        // Create a complete Driver object
        const completeDriver: Driver = {
          id: this.driver.id || '',
          name: this.driver.name || '',
          email: this.email,
          phone: this.phone,
          vehicleType: this.selectedVehicleType as VehicleType, // We've checked this is not null above
          modelName: this.driver.modelName || '',
          userId: this.driver.userId,
        };

        this.driverService.createDriver(completeDriver).subscribe({
          next: (createdDriver) => {
            this.isLoading = false;
            this.notificationService.showSuccess(
              `Driver ${createdDriver.name} has been successfully added`,
            );

            // Reset the form
            this.driver = {
              id: '',
              name: '',
              modelName: '',
            };
            this.selectedVehicleType = null;
            this.email = '';
            this.phone = '';
            this.password = '';

            // Redirect after a brief delay
            setTimeout(() => {
              this.router.navigate(['/admin/drivers']);
            }, 1500);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Error creating driver profile';
            this.notificationService.showError('Error creating driver profile');
            console.error(error);
          },
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred during user registration';
        this.notificationService.showError('An error occurred during user registration');
        console.error(error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/drivers']);
  }
}
