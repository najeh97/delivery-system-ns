import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Client } from '../../../models/client.model';
import { Customer } from '../../../models/customer.model';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { Driver } from '../../../models/driver.model';
import { AuthService } from '../../../services/auth.service';
import { ClientService } from '../../../services/client.service';
import { CustomerService } from '../../../services/customer.service';
import { DeliveryService } from '../../../services/delivery.service';
import { DriverService } from '../../../services/driver.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-request.component.html',
})
export class CreateRequestComponent implements OnInit {
  request: DeliveryRequest = {
    id: '',
    deliveryDetails: '',
    date: '',
    clientId: '',
    customerId: '',
    deliveryStatus: 'pending',
    paymentStatus: 'pending',
    paymentAmount: 0,
  };

  deliveryDate = '';
  minDate = '';

  customers: Customer[] = [];
  drivers: Driver[] = [];
  currentClient: Client | undefined;

  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private customerService: CustomerService,
    private driverService: DriverService,
    private deliveryService: DeliveryService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadCustomers();
    this.loadDrivers();
  }

  loadClients(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.clientService.getClientByUserId(currentUser.id!).subscribe({
        next: (client) => {
          if (client) {
            this.currentClient = client;
            this.request.clientId = client.id;
          } else {
            this.errorMessage = 'Client profile not found.';
          }
        },
        error: (error) => {
          console.error('Error loading client:', error);
          this.errorMessage = 'Error loading client profile.';
        },
      });
    }
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.errorMessage = 'Error loading customers.';
      },
    });
  }

  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.errorMessage = 'Error loading drivers.';
      },
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    if (!this.request.clientId) {
      this.errorMessage = 'Client ID not found.';
      this.notificationService.showError('Client ID not found.');
      this.isSubmitting = false;
      return;
    }

    // Format date in readable format (e.g., "2025-04-23")
    this.request.date = this.deliveryDate;

    this.deliveryService.createDeliveryRequest(this.request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notificationService.showSuccess('Delivery request created successfully');
        this.router.navigate(['/client/requests']);
      },
      error: (error) => {
        console.error('Error creating request:', error);
        this.errorMessage = 'Error creating delivery request.';
        this.notificationService.showError('Error creating delivery request.');
        this.isSubmitting = false;
      },
    });
  }
}
