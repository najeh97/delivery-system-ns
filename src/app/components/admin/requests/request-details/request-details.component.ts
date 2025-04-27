import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../../models/delivery-request.model';
import { Driver } from '../../../../models/driver.model';
import { ClientService } from '../../../../services/client.service';
import { CustomerService } from '../../../../services/customer.service';
import { DeliveryService } from '../../../../services/delivery.service';
import { DriverService } from '../../../../services/driver.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './request-details.component.html',
})
export class RequestDetailsComponent implements OnInit {
  request: DeliveryRequest | null = null;
  isLoading = true;
  errorMessage = '';
  availableDrivers: Driver[] = [];
  selectedDriverId: string | null = null;
  showDriverAssignment = false;

  // Related data
  clientName = '';
  clientEmail = '';
  clientPhone = '';
  customerName = '';
  customerEmail = '';
  customerPhone = '';
  customerAddress = '';
  driverName = '';
  driverVehicleType = '';
  driverVehicleModel = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private clientService: ClientService,
    private customerService: CustomerService,
    private driverService: DriverService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const requestId = params.get('id');
      if (requestId) {
        this.loadRequestDetails(requestId);
        this.loadAvailableDrivers();
      } else {
        this.errorMessage = 'No request ID provided';
        this.isLoading = false;
      }
    });
  }

  loadRequestDetails(requestId: string): void {
    this.isLoading = true;
    this.deliveryService.getDeliveryRequestById(requestId).subscribe({
      next: (request) => {
        if (request) {
          this.request = request;
          this.loadRelatedData();
        } else {
          this.errorMessage = 'Request not found';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading request details';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  loadRelatedData(): void {
    if (!this.request) return;

    // Load client data
    this.clientService.getClientById(this.request.clientId).subscribe({
      next: (client) => {
        if (client) {
          this.clientName = client.name;
          this.clientEmail = client.email;
          this.clientPhone = client.phone;
        }
      },
    });

    // Load customer data
    this.customerService.getCustomerById(this.request.customerId).subscribe({
      next: (customer) => {
        if (customer) {
          this.customerName = customer.name;
          this.customerEmail = customer.email;
          this.customerPhone = customer.phone;
          this.customerAddress = customer.address;
        }
      },
    });

    // Load driver data if assigned
    if (this.request.driverId) {
      this.driverService.getDriverById(this.request.driverId).subscribe({
        next: (driver) => {
          if (driver) {
            this.driverName = driver.name;
            this.driverVehicleType = driver.vehicleType;
            this.driverVehicleModel = driver.modelName;
          }
        },
      });
    }
  }

  loadAvailableDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (drivers) => {
        this.availableDrivers = drivers;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
      },
    });
  }

  assignDriver(): void {
    if (!this.request || !this.selectedDriverId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.assignDriverToRequest(this.request.id, this.selectedDriverId).subscribe({
      next: (updatedRequest) => {
        if (updatedRequest) {
          this.request = updatedRequest;
          this.showDriverAssignment = false;
          this.loadRelatedData(); // Reload driver data
          this.notificationService.showSuccess('Driver successfully assigned to the request');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error assigning driver';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  updateRequest(): void {
    if (!this.request) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.updateDeliveryRequest(this.request).subscribe({
      next: (updatedRequest) => {
        if (updatedRequest) {
          this.request = updatedRequest;
          this.notificationService.showSuccess('Request updated successfully');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error updating request';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
