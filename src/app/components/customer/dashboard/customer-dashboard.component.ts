import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Customer } from '../../../models/customer.model';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { CustomerService } from '../../../services/customer.service';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-dashboard.component.html',
})
export class CustomerDashboardComponent implements OnInit {
  customer: Customer | undefined;
  requests: DeliveryRequest[] = [];
  recentRequests: DeliveryRequest[] = [];
  upcomingRequests: DeliveryRequest[] = [];
  completedRequests: DeliveryRequest[] = [];
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private deliveryService: DeliveryService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadCustomerProfile();
    }
  }

  loadCustomerProfile(): void {
    if (!this.currentUser?.id) return;

    this.customerService.getCustomerByUserId(this.currentUser.id).subscribe((customer) => {
      if (customer) {
        this.customer = customer;
        this.loadRequests();
      }
    });
  }

  loadRequests(): void {
    if (!this.customer?.id) return;

    this.deliveryService.getDeliveryRequestsByCustomerId(this.customer.id).subscribe((requests) => {
      this.requests = requests;

      // Sort by date (newest first)
      this.recentRequests = [...requests]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10); // Show only the 10 most recent

      // Upcoming deliveries (pending, assigned, in-progress)
      this.upcomingRequests = requests.filter(
        (r) =>
          r.deliveryStatus === 'pending' ||
          r.deliveryStatus === 'assigned' ||
          r.deliveryStatus === 'in-progress',
      );

      // Completed deliveries
      this.completedRequests = requests.filter((r) => r.deliveryStatus === 'completed');
    });
  }
}
