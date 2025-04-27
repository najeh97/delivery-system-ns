import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../../models/delivery-request.model';
import { ClientService } from '../../../../services/client.service';
import { CustomerService } from '../../../../services/customer.service';
import { DeliveryService } from '../../../../services/delivery.service';
import { DriverService } from '../../../../services/driver.service';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './request-list.component.html',
})
export class RequestListComponent implements OnInit {
  requests: DeliveryRequest[] = [];
  filteredRequests: DeliveryRequest[] = [];
  statusFilter = 'all';
  paymentFilter = 'all';
  isLoading = true;

  // Cache for names to avoid repeated lookups
  private clientNames: Record<string, string> = {};
  private customerNames: Record<string, string> = {};
  private driverNames: Record<string, string> = {};

  constructor(
    private deliveryService: DeliveryService,
    private clientService: ClientService,
    private customerService: CustomerService,
    private driverService: DriverService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.deliveryService.getAllDeliveryRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.loadRelatedData();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading delivery requests:', error);
        this.isLoading = false;
      },
    });
  }

  loadRelatedData(): void {
    // Load client names
    this.clientService.getClients().subscribe({
      next: (clients) => {
        clients.forEach((client) => {
          this.clientNames[client.id] = client.name;
        });
      },
    });

    // Load customer names
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        customers.forEach((customer) => {
          this.customerNames[customer.id] = customer.name;
        });
      },
    });

    // Load driver names
    this.driverService.getDrivers().subscribe({
      next: (drivers) => {
        drivers.forEach((driver) => {
          this.driverNames[driver.id] = driver.name;
        });
      },
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter((request) => {
      const statusMatch =
        this.statusFilter === 'all' || request.deliveryStatus === this.statusFilter;
      const paymentMatch =
        this.paymentFilter === 'all' || request.paymentStatus === this.paymentFilter;
      return statusMatch && paymentMatch;
    });
  }

  getClientName(clientId: string): string {
    return this.clientNames[clientId] || 'Unknown Client';
  }

  getCustomerName(customerId: string): string {
    return this.customerNames[customerId] || 'Unknown Customer';
  }

  getDriverName(driverId: string): string {
    return this.driverNames[driverId] || 'Unknown Driver';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
