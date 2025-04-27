import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Client } from '../../../models/client.model';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { Driver } from '../../../models/driver.model';
import { ClientService } from '../../../services/client.service';
import { DeliveryService } from '../../../services/delivery.service';
import { DriverService } from '../../../services/driver.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-customer-request-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-4 flex items-center">
        <button
          routerLink="/customer/requests"
          class="mr-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <span class="text-xl">&larr;</span>
          <span class="ml-1">Back to Requests</span>
        </button>
        <h1 class="text-2xl font-bold">Delivery Details</h1>
      </div>

      <div *ngIf="isLoading" class="py-8 text-center text-gray-600">
        <p>Loading request details...</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 rounded-md bg-red-100 p-4 text-red-700">
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && request" class="space-y-6">
        <!-- Status Banner -->
        <div
          class="rounded-md p-4"
          [ngClass]="{
            'bg-yellow-100 text-yellow-800': request.deliveryStatus === 'pending',
            'bg-blue-100 text-blue-800': request.deliveryStatus === 'assigned',
            'bg-purple-100 text-purple-800': request.deliveryStatus === 'in-progress',
            'bg-green-100 text-green-800': request.deliveryStatus === 'completed',
            'bg-red-100 text-red-800': request.deliveryStatus === 'cancelled',
          }"
        >
          <div class="flex items-center">
            <span class="text-lg font-medium"
              >Status: {{ request.deliveryStatus | titlecase }}</span
            >
          </div>
        </div>

        <!-- Request Info -->
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-medium">Request Information</h2>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-gray-500">Request ID</p>
              <p class="text-gray-900">{{ request.id }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Delivery Date</p>
              <p class="text-gray-900">{{ request.date }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-sm font-medium text-gray-500">Delivery Details</p>
              <p class="whitespace-pre-wrap text-gray-900">{{ request.deliveryDetails }}</p>
            </div>
          </div>
        </div>

        <!-- Client Info -->
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-medium">Client Information</h2>
          <div *ngIf="client" class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-gray-500">Client Name</p>
              <p class="text-gray-900">{{ client.name }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Contact</p>
              <p class="text-gray-900">{{ client.phone }}</p>
            </div>
          </div>
          <div *ngIf="!client" class="rounded-md bg-yellow-50 p-3">
            <p class="text-sm text-yellow-700">Client information not available</p>
          </div>
        </div>

        <!-- Driver Info -->
        <div
          *ngIf="request.driverId"
          class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 class="mb-4 text-lg font-medium">Driver Information</h2>
          <div *ngIf="driver" class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-gray-500">Driver Name</p>
              <p class="text-gray-900">{{ driver.name }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Vehicle</p>
              <p class="text-gray-900">{{ driver.vehicleType }} - {{ driver.modelName }}</p>
            </div>
          </div>
          <div *ngIf="!driver" class="rounded-md bg-yellow-50 p-3">
            <p class="text-sm text-yellow-700">Driver information not available</p>
          </div>
        </div>

        <div
          *ngIf="!request.driverId"
          class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div class="rounded-md bg-yellow-50 p-3">
            <p class="text-sm text-yellow-700">No driver has been assigned to this request yet.</p>
          </div>
        </div>

        <!-- Update Location Section -->
        <div
          *ngIf="request.deliveryStatus !== 'completed' && request.deliveryStatus !== 'cancelled'"
          class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 class="mb-4 text-lg font-medium">Update My Delivery Location</h2>
          <form (ngSubmit)="updateLocation()" class="space-y-4">
            <div>
              <label for="newAddress" class="mb-2 block text-sm font-medium text-gray-700">
                New Delivery Address
              </label>
              <textarea
                id="newAddress"
                name="newAddress"
                [(ngModel)]="newAddress"
                required
                rows="3"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Enter your new address"
              ></textarea>
            </div>
            <button
              type="submit"
              [disabled]="!newAddress || isSaving"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
            >
              {{ isSaving ? 'Updating...' : 'Update Location' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class CustomerRequestDetailsComponent implements OnInit {
  requestId = '';
  request: DeliveryRequest | undefined;
  client: Client | undefined;
  driver: Driver | undefined;

  newAddress = '';

  isLoading = true;
  isSaving = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private clientService: ClientService,
    private driverService: DriverService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.requestId = params['id'];
      this.loadRequestDetails();
    });
  }

  loadRequestDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveryRequestById(this.requestId).subscribe({
      next: (request) => {
        if (request) {
          this.request = request;
          this.loadClient(request.clientId);
          if (request.driverId) {
            this.loadDriver(request.driverId);
          }
        } else {
          this.errorMessage = 'Request not found.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading request details:', error);
        this.errorMessage = 'Error loading request details.';
        this.isLoading = false;
      },
    });
  }

  loadClient(clientId: string): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;
      },
      error: (error) => {
        console.error('Error loading client details:', error);
      },
    });
  }

  loadDriver(driverId: string): void {
    this.driverService.getDriverById(driverId).subscribe({
      next: (driver) => {
        this.driver = driver;
      },
      error: (error) => {
        console.error('Error loading driver details:', error);
      },
    });
  }

  updateLocation(): void {
    if (!this.request || !this.newAddress || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';

    // This is a simplified implementation. In a real application, you would:
    // 1. Update the customer's address in the database
    // 2. Add a note to the delivery request about the address change
    // 3. Notify the client and driver about the change

    // Replace alert with toast notification
    this.notificationService.showSuccess(`Location updated to: ${this.newAddress}`);
    this.isSaving = false;
    this.newAddress = '';

    // Refresh the page to show the changes
    this.loadRequestDetails();
  }
}
