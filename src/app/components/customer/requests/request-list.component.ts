import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { AuthService } from '../../../services/auth.service';
import { CustomerService } from '../../../services/customer.service';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-customer-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="mb-6 text-2xl font-bold">My Delivery Requests</h1>

      <div *ngIf="isLoading" class="py-4 text-center text-gray-600">
        <p>Loading requests...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 rounded-md bg-red-100 p-4 text-red-700">
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && requests.length === 0" class="rounded-md bg-yellow-50 p-4">
        <p class="text-yellow-700">You don't have any delivery requests yet.</p>
      </div>

      <!-- Filter tabs -->
      <div *ngIf="!isLoading && requests.length > 0" class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              (click)="setFilter('all')"
              (keydown.enter)="setFilter('all')"
              (keydown.space)="setFilter('all')"
              [class.border-blue-500]="currentFilter === 'all'"
              [class.text-blue-600]="currentFilter === 'all'"
              class="cursor-pointer border-b-2 border-transparent px-1 py-4 text-sm font-medium focus:outline-none"
              tabindex="0"
              role="tab"
              [attr.aria-selected]="currentFilter === 'all'"
            >
              All Requests
            </button>
            <button
              (click)="setFilter('upcoming')"
              (keydown.enter)="setFilter('upcoming')"
              (keydown.space)="setFilter('upcoming')"
              [class.border-blue-500]="currentFilter === 'upcoming'"
              [class.text-blue-600]="currentFilter === 'upcoming'"
              class="cursor-pointer border-b-2 border-transparent px-1 py-4 text-sm font-medium focus:outline-none"
              tabindex="0"
              role="tab"
              [attr.aria-selected]="currentFilter === 'upcoming'"
            >
              Upcoming
            </button>
            <button
              (click)="setFilter('completed')"
              (keydown.enter)="setFilter('completed')"
              (keydown.space)="setFilter('completed')"
              [class.border-blue-500]="currentFilter === 'completed'"
              [class.text-blue-600]="currentFilter === 'completed'"
              class="cursor-pointer border-b-2 border-transparent px-1 py-4 text-sm font-medium focus:outline-none"
              tabindex="0"
              role="tab"
              [attr.aria-selected]="currentFilter === 'completed'"
            >
              Completed
            </button>
          </nav>
        </div>
      </div>

      <!-- Request cards -->
      <div
        *ngIf="!isLoading && filteredRequests.length > 0"
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          *ngFor="let request of filteredRequests"
          class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div
            class="border-b border-gray-200 px-4 py-5 sm:px-6"
            [ngClass]="{
              'bg-yellow-50': request.deliveryStatus === 'pending',
              'bg-blue-50': request.deliveryStatus === 'assigned',
              'bg-purple-50': request.deliveryStatus === 'in-progress',
              'bg-green-50': request.deliveryStatus === 'completed',
              'bg-red-50': request.deliveryStatus === 'cancelled',
            }"
          >
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Delivery #{{ request.id.substring(0, 8) }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">{{ request.date }}</p>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <div class="mb-4">
              <span
                class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                [ngClass]="{
                  'bg-yellow-100 text-yellow-800': request.deliveryStatus === 'pending',
                  'bg-blue-100 text-blue-800': request.deliveryStatus === 'assigned',
                  'bg-purple-100 text-purple-800': request.deliveryStatus === 'in-progress',
                  'bg-green-100 text-green-800': request.deliveryStatus === 'completed',
                  'bg-red-100 text-red-800': request.deliveryStatus === 'cancelled',
                }"
              >
                {{ request.deliveryStatus | titlecase }}
              </span>
            </div>
            <p class="mb-4 line-clamp-2 text-sm text-gray-500">
              {{ request.deliveryDetails }}
            </p>
            <a
              [routerLink]="['/customer/requests', request.id]"
              class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-900"
            >
              View Details
              <span class="ml-1">&rarr;</span>
            </a>
          </div>
        </div>
      </div>

      <div
        *ngIf="!isLoading && requests.length > 0 && filteredRequests.length === 0"
        class="rounded-md bg-yellow-50 p-4"
      >
        <p class="text-yellow-700">No {{ currentFilter }} requests found.</p>
      </div>
    </div>
  `,
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
