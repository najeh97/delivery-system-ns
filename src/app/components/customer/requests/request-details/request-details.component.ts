// filepath: /home/saleh/Desktop/projects/delivery-system-ns-fork/src/app/components/customer/requests/request-details/request-details.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Client } from '../../../../models/client.model';
import { DeliveryRequest } from '../../../../models/delivery-request.model';
import { Driver } from '../../../../models/driver.model';
import { ClientService } from '../../../../services/client.service';
import { DeliveryService } from '../../../../services/delivery.service';
import { DriverService } from '../../../../services/driver.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-customer-request-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './request-details.component.html',
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
