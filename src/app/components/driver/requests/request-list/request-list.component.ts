// filepath: /home/saleh/Desktop/projects/delivery-system-ns-fork/src/app/components/driver/requests/request-list/request-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../../models/delivery-request.model';
import { AuthService } from '../../../../services/auth.service';
import { DeliveryService } from '../../../../services/delivery.service';
import { DriverService } from '../../../../services/driver.service';

@Component({
  selector: 'app-driver-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './request-list.component.html',
})
export class DriverRequestListComponent implements OnInit {
  requests: DeliveryRequest[] = [];
  filteredRequests: DeliveryRequest[] = [];
  currentFilter: 'all' | 'active' | 'completed' = 'all';

  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private driverService: DriverService,
    private deliveryService: DeliveryService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to view assignments.';
      this.isLoading = false;
      return;
    }

    this.driverService.getDriverByUserId(currentUser.id!).subscribe({
      next: (driver) => {
        if (driver) {
          this.deliveryService.getDeliveryRequestsByDriverId(driver.id).subscribe({
            next: (requests) => {
              this.requests = this.sortRequestsByDate(requests);
              this.applyFilter();
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading delivery assignments:', error);
              this.errorMessage = 'Failed to load delivery assignments.';
              this.isLoading = false;
            },
          });
        } else {
          this.errorMessage = 'Driver profile not found.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading driver profile:', error);
        this.errorMessage = 'Failed to load driver profile.';
        this.isLoading = false;
      },
    });
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentFilter === 'all') {
      this.filteredRequests = this.requests;
    } else if (this.currentFilter === 'active') {
      this.filteredRequests = this.requests.filter(
        (request) =>
          request.deliveryStatus === 'assigned' || request.deliveryStatus === 'in-progress',
      );
    } else if (this.currentFilter === 'completed') {
      this.filteredRequests = this.requests.filter(
        (request) => request.deliveryStatus === 'completed',
      );
    }
  }

  startDelivery(request: DeliveryRequest): void {
    if (request.deliveryStatus !== 'assigned') return;

    request.deliveryStatus = 'in-progress';
    this.deliveryService.updateDeliveryStatus(request.id, 'in-progress').subscribe({
      next: () => {
        // Refresh the list
        this.loadRequests();
      },
      error: (error) => {
        console.error('Error updating delivery status:', error);
        this.errorMessage = 'Failed to update delivery status.';
      },
    });
  }

  private sortRequestsByDate(requests: DeliveryRequest[]): DeliveryRequest[] {
    return [...requests].sort((a, b) => {
      // Sort by date in descending order (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
}
