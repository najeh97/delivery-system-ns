import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Client } from '../../../models/client.model';
import { Customer } from '../../../models/customer.model';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { Driver } from '../../../models/driver.model';
import { AuthService } from '../../../services/auth.service';
import { ClientService } from '../../../services/client.service';
import { CustomerService } from '../../../services/customer.service';
import { DataSeedService } from '../../../services/data-seed.service';
import { DeliveryService } from '../../../services/delivery.service';
import { DriverService } from '../../../services/driver.service';
import { StorageService } from '../../../services/storage.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  clients: Client[] = [];
  pendingClients: Client[] = [];
  customers: Customer[] = [];
  drivers: Driver[] = [];
  requests: DeliveryRequest[] = [];
  recentRequests: DeliveryRequest[] = [];
  activeRequests: DeliveryRequest[] = [];
  completedRequests: DeliveryRequest[] = [];

  // Cache for names
  private clientNames: Record<string, string> = {};
  private customerNames: Record<string, string> = {};

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private customerService: CustomerService,
    private driverService: DriverService,
    private deliveryService: DeliveryService,
    private router: Router,
    private storageService: StorageService,
    private dataSeedService: DataSeedService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load clients
    this.clientService.getClients().subscribe((clients) => {
      this.clients = clients;
      this.pendingClients = clients.filter((client) => client.approvalStatus === 'pending');

      // Cache client names
      clients.forEach((client) => {
        this.clientNames[client.id] = client.name;
      });
    });

    // Load customers
    this.customerService.getCustomers().subscribe((customers) => {
      this.customers = customers;

      // Cache customer names
      customers.forEach((customer) => {
        this.customerNames[customer.id] = customer.name;
      });
    });

    // Load drivers
    this.driverService.getDrivers().subscribe((drivers) => {
      this.drivers = drivers;
    });

    // Load requests
    this.deliveryService.getAllDeliveryRequests().subscribe((requests) => {
      this.requests = requests;

      // Get recent requests (last 5)
      this.recentRequests = [...requests]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      // Filter active and completed requests
      this.activeRequests = requests.filter(
        (r) =>
          r.deliveryStatus === 'pending' ||
          r.deliveryStatus === 'assigned' ||
          r.deliveryStatus === 'in-progress',
      );
      this.completedRequests = requests.filter((r) => r.deliveryStatus === 'completed');
    });
  }

  approveClient(client: Client): void {
    this.clientService.updateApprovalStatus(client.id, 'approved').subscribe({
      next: () => {
        client.approvalStatus = 'approved';
        this.pendingClients = this.pendingClients.filter((c) => c.id !== client.id);
      },
      error: (error) => {
        console.error('Error approving client:', error);
      },
    });
  }

  rejectClient(client: Client): void {
    this.clientService.updateApprovalStatus(client.id, 'rejected').subscribe({
      next: () => {
        client.approvalStatus = 'rejected';
        this.pendingClients = this.pendingClients.filter((c) => c.id !== client.id);
      },
      error: (error) => {
        console.error('Error rejecting client:', error);
      },
    });
  }

  getClientName(clientId: string): string {
    return this.clientNames[clientId] || 'Unknown Client';
  }

  getCustomerName(customerId: string): string {
    return this.customerNames[customerId] || 'Unknown Customer';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  /**
   * Seed storage with fake data
   */
  seedStorage(): void {
    if (confirm('Are you sure you want to seed the database with test data?')) {
      try {
        this.dataSeedService.seedDatabase();
        this.notificationService.showSuccess('Database seeded with 100 entries for each data type');
        this.loadDashboardData(); // Refresh data after seeding
      } catch (error) {
        console.error('Error seeding database:', error);
        this.notificationService.showError('Error seeding database');
      }
    }
  }

  /**
   * Confirm before resetting storage
   */
  confirmResetStorage(): void {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      this.resetStorage();
    }
  }

  /**
   * Reset storage to initial state with only admin user
   */
  resetStorage(): void {
    try {
      this.storageService.resetStorage();
      this.notificationService.showSuccess('Storage has been reset successfully');
      this.loadDashboardData(); // Refresh data after reset
    } catch (error) {
      console.error('Error resetting storage:', error);
      this.notificationService.showError('Error resetting storage');
    }
  }

  /**
   * Reset storage and then seed with new data
   */
  resetAndSeedStorage(): void {
    if (confirm('Are you sure you want to reset all data and add new test data?')) {
      try {
        this.storageService.resetStorage();
        this.dataSeedService.seedDatabase();
        this.notificationService.showSuccess(
          'Storage has been reset and seeded with new test data',
        );
        this.loadDashboardData(); // Refresh data after reset and seed
      } catch (error) {
        console.error('Error resetting and seeding storage:', error);
        this.notificationService.showError('Error resetting and seeding storage');
      }
    }
  }
}
