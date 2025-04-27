import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Driver, VehicleType } from '../../../models/driver.model';
import { DriverService } from '../../../services/driver.service';

@Component({
  selector: 'app-client-driver-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-list.component.html',
})
export class ClientDriverListComponent implements OnInit {
  drivers: Driver[] = [];
  isLoading = true;
  selectedVehicleType: VehicleType | null = null;

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.driverService.getDrivers().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.isLoading = false;
      },
    });
  }

  filterDrivers(): void {
    this.isLoading = true;

    if (this.selectedVehicleType) {
      this.driverService.filterDriversByVehicleType(this.selectedVehicleType).subscribe({
        next: (drivers) => {
          this.drivers = drivers;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error filtering drivers:', error);
          this.isLoading = false;
        },
      });
    } else {
      this.loadDrivers();
    }
  }

  selectDriver(driver: Driver): void {
    // In a real application, this might store the selected driver or navigate to create a request
    console.log('Selected driver:', driver);
    // Could navigate to request creation with this driver pre-selected
    // this.router.navigate(['/client/requests/new'], { queryParams: { driverId: driver.id } });

    // For now, just alert the user
    alert(
      `Driver ${driver.name} selected. In a complete implementation, this would take you to create a delivery request.`,
    );
  }
}
