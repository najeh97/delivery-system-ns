// filepath: /home/saleh/Desktop/projects/delivery-system-ns-fork/src/app/components/admin/drivers/driver-list/driver-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Driver, VehicleType } from '../../../../models/driver.model';
import { DriverService } from '../../../../services/driver.service';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './driver-list.component.html',
})
export class DriverListComponent implements OnInit {
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  filter: 'all' | VehicleType = 'all';
  isLoading = true;

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.driverService.getDrivers().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
        this.filterDrivers(this.filter);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.isLoading = false;
      },
    });
  }

  filterDrivers(type: 'all' | VehicleType): void {
    this.filter = type;
    if (type === 'all') {
      this.filteredDrivers = [...this.drivers];
    } else {
      this.filteredDrivers = this.drivers.filter((driver) => driver.vehicleType === type);
    }
  }

  deleteDriver(driver: Driver): void {
    if (confirm(`Are you sure you want to delete driver ${driver.name}?`)) {
      this.driverService.deleteDriver(driver.id).subscribe({
        next: (success) => {
          if (success) {
            this.drivers = this.drivers.filter((d) => d.id !== driver.id);
            this.filterDrivers(this.filter);
          }
        },
        error: (error) => {
          console.error('Error deleting driver:', error);
        },
      });
    }
  }
}
