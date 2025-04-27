// filepath: /home/saleh/Desktop/projects/delivery-system-ns-fork/src/app/components/customer/requests/request-list/request-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../../models/delivery-request.model';
import { AuthService } from '../../../../services/auth.service';
import { CustomerService } from '../../../../services/customer.service';
import { DeliveryService } from '../../../../services/delivery.service';

@Component({
  selector: 'app-customer-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './request-list.component.html',
})
export class CustomerRequestListComponent implements OnInit {
  requests: DeliveryRequest[] = [];
  filteredRequests: DeliveryRequest[] = [];
  currentFilter: 'all' | 'upcoming' | 'completed' = 'all';

  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private deliveryService: DeliveryService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to view requests.';
      this.isLoading = false;
      return;
    }

    this.customerService.getCustomerByUserId(currentUser.id!).subscribe({
      next: (customer) => {
        if (customer) {
          this.deliveryService.getDeliveryRequestsByCustomerId(customer.id).subscribe({
            next: (requests) => {
              this.requests = this.sortRequestsByDate(requests);
              this.applyFilter();
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading delivery requests:', error);
              this.errorMessage = 'Failed to load delivery requests.';
              this.isLoading = false;
            },
          });
        } else {
          this.errorMessage = 'Customer profile not found.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading customer profile:', error);
        this.errorMessage = 'Failed to load customer profile.';
        this.isLoading = false;
      },
    });
  }

  setFilter(filter: 'all' | 'upcoming' | 'completed'): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentFilter === 'all') {
      this.filteredRequests = this.requests;
    } else if (this.currentFilter === 'upcoming') {
      this.filteredRequests = this.requests.filter(
        (request) =>
          request.deliveryStatus !== 'completed' && request.deliveryStatus !== 'cancelled',
      );
    } else if (this.currentFilter === 'completed') {
      this.filteredRequests = this.requests.filter(
        (request) => request.deliveryStatus === 'completed',
      );
    }
  }

  private sortRequestsByDate(requests: DeliveryRequest[]): DeliveryRequest[] {
    return [...requests].sort((a, b) => {
      // Sort by date in descending order (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
}
