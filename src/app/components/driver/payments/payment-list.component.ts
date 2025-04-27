import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { AuthService } from '../../../services/auth.service';
import { DeliveryService } from '../../../services/delivery.service';
import { DriverService } from '../../../services/driver.service';

@Component({
  selector: 'app-driver-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="mb-6 text-2xl font-bold">My Payments</h1>

      <div *ngIf="isLoading" class="py-4 text-center text-gray-600">
        <p>Loading payment history...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 rounded-md bg-red-100 p-4 text-red-700">
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && deliveries.length === 0" class="rounded-md bg-yellow-50 p-4">
        <p class="text-yellow-700">No payment records found.</p>
      </div>

      <!-- Payment Summary -->
      <div
        *ngIf="!isLoading && deliveries.length > 0"
        class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 class="mb-2 text-sm font-medium text-blue-700">Total Earnings</h3>
          <p class="text-2xl font-bold text-blue-900">\${{ totalEarnings.toFixed(2) }}</p>
        </div>
        <div class="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 class="mb-2 text-sm font-medium text-green-700">Received</h3>
          <p class="text-2xl font-bold text-green-900">\${{ receivedAmount.toFixed(2) }}</p>
        </div>
        <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 class="mb-2 text-sm font-medium text-yellow-700">Pending</h3>
          <p class="text-2xl font-bold text-yellow-900">\${{ pendingAmount.toFixed(2) }}</p>
        </div>
      </div>

      <div class="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Delivery ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Date
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Amount
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr *ngFor="let delivery of deliveries">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ delivery.id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ delivery.date }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  \${{ delivery.paymentAmount.toFixed(2) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold"
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800': delivery.paymentStatus === 'pending',
                    'bg-green-100 text-green-800': delivery.paymentStatus === 'paid',
                    'bg-red-100 text-red-800': delivery.paymentStatus === 'cancelled',
                  }"
                >
                  {{ delivery.paymentStatus }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                <a
                  [routerLink]="['/driver/requests', delivery.id]"
                  class="text-blue-600 hover:text-blue-900"
                  >View</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DriverPaymentListComponent implements OnInit {
  deliveries: DeliveryRequest[] = [];
  isLoading = true;
  errorMessage = '';

  // Payment statistics
  totalEarnings = 0;
  receivedAmount = 0;
  pendingAmount = 0;

  constructor(
    private authService: AuthService,
    private driverService: DriverService,
    private deliveryService: DeliveryService,
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to view payments.';
      this.isLoading = false;
      return;
    }

    this.driverService.getDriverByUserId(currentUser.id!).subscribe({
      next: (driver) => {
        if (driver) {
          this.deliveryService.getDeliveryRequestsByDriverId(driver.id).subscribe({
            next: (deliveries) => {
              // Show only completed or in-progress deliveries
              this.deliveries = deliveries.filter(
                (delivery) =>
                  delivery.deliveryStatus === 'completed' ||
                  delivery.deliveryStatus === 'in-progress',
              );
              this.calculatePaymentStatistics();
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading deliveries:', error);
              this.errorMessage = 'Failed to load payment history.';
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

  calculatePaymentStatistics(): void {
    this.totalEarnings = 0;
    this.receivedAmount = 0;
    this.pendingAmount = 0;

    for (const delivery of this.deliveries) {
      // Skip cancelled payments in statistics
      if (delivery.paymentStatus === 'cancelled') continue;

      // Add to total earnings
      this.totalEarnings += delivery.paymentAmount;

      // Categorize by payment status
      if (delivery.paymentStatus === 'paid') {
        this.receivedAmount += delivery.paymentAmount;
      } else if (delivery.paymentStatus === 'pending') {
        this.pendingAmount += delivery.paymentAmount;
      }
    }
  }
}
