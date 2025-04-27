import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { AuthService } from '../../../services/auth.service';
import { ClientService } from '../../../services/client.service';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-list.component.html',
})
export class PaymentListComponent implements OnInit {
  requests: DeliveryRequest[] = [];
  isLoading = true;
  errorMessage = '';

  // Payment statistics
  totalRevenue = 0;
  paidAmount = 0;
  pendingAmount = 0;

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private deliveryService: DeliveryService,
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to view payments.';
      this.isLoading = false;
      return;
    }

    this.clientService.getClientByUserId(currentUser.id!).subscribe({
      next: (client) => {
        if (client) {
          this.deliveryService.getDeliveryRequestsByClientId(client.id).subscribe({
            next: (requests) => {
              this.requests = requests;
              this.calculatePaymentStatistics();
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading payment data:', error);
              this.errorMessage = 'Failed to load payment data.';
              this.isLoading = false;
            },
          });
        } else {
          this.errorMessage = 'Client profile not found.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading client profile:', error);
        this.errorMessage = 'Failed to load client profile.';
        this.isLoading = false;
      },
    });
  }

  calculatePaymentStatistics(): void {
    this.totalRevenue = 0;
    this.paidAmount = 0;
    this.pendingAmount = 0;

    for (const request of this.requests) {
      // Skip cancelled requests in statistics
      if (request.paymentStatus === 'cancelled') continue;

      // Add to total revenue
      this.totalRevenue += request.paymentAmount;

      // Categorize by payment status
      if (request.paymentStatus === 'paid') {
        this.paidAmount += request.paymentAmount;
      } else if (request.paymentStatus === 'pending') {
        this.pendingAmount += request.paymentAmount;
      }
    }
  }
}
