// filepath: /home/saleh/Desktop/projects/delivery-system-ns-fork/src/app/components/driver/requests/request-details/request-details.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Client } from '../../../../models/client.model';
import { Customer } from '../../../../models/customer.model';
import { DeliveryRequest } from '../../../../models/delivery-request.model';
import { ClientService } from '../../../../services/client.service';
import { CustomerService } from '../../../../services/customer.service';
import { DeliveryService } from '../../../../services/delivery.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-driver-request-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './request-details.component.html',
})
export class DriverRequestDetailsComponent implements OnInit {
  requestId = '';
  request: DeliveryRequest | undefined;
  customer: Customer | undefined;
  client: Client | undefined;

  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private customerService: CustomerService,
    private clientService: ClientService,
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
          this.loadCustomer(request.customerId);
          this.loadClient(request.clientId);
        } else {
          this.errorMessage = 'Delivery request not found.';
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

  loadCustomer(customerId: string): void {
    this.customerService.getCustomerById(customerId).subscribe({
      next: (customer) => {
        this.customer = customer;
      },
      error: (error) => {
        console.error('Error loading customer details:', error);
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

  updateDeliveryStatus(status: 'in-progress' | 'completed'): void {
    if (!this.request) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.updateDeliveryStatus(this.request.id, status).subscribe({
      next: (updatedRequest) => {
        if (updatedRequest) {
          if (status === 'completed') {
            // If delivery is completed, also update payment status to 'paid'
            this.deliveryService.updatePaymentStatus(this.request!.id, 'paid').subscribe({
              next: () => {
                this.notificationService.showSuccess(
                  'Delivery marked as completed and payment processed',
                );
                this.router.navigate(['/driver/requests']);
              },
              error: (error) => {
                console.error('Error updating payment status:', error);
                this.errorMessage = 'Error updating payment status.';
                this.notificationService.showError('Error updating payment status');
                this.isLoading = false;
              },
            });
          } else {
            this.notificationService.showSuccess('Delivery status updated to in-progress');
            this.router.navigate(['/driver/requests']);
          }
        } else {
          this.errorMessage = 'Failed to update delivery status.';
          this.notificationService.showError('Failed to update delivery status');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error updating delivery status:', error);
        this.errorMessage = 'Error updating delivery status.';
        this.notificationService.showError('Error updating delivery status');
        this.isLoading = false;
      },
    });
  }

  cancelDelivery(): void {
    if (!this.request) return;

    if (confirm('Are you sure you want to cancel this delivery?')) {
      this.isLoading = true;
      this.errorMessage = '';

      this.deliveryService.updateDeliveryStatus(this.request.id, 'pending').subscribe({
        next: (updatedRequest) => {
          if (updatedRequest) {
            // Update driver ID to null (performed on server in a real app)
            this.request!.driverId = undefined;
            this.deliveryService.updateDeliveryRequest(this.request!).subscribe({
              next: () => {
                this.notificationService.showSuccess('Delivery cancelled successfully');
                this.router.navigate(['/driver/requests']);
              },
              error: (error) => {
                console.error('Error removing driver assignment:', error);
                this.errorMessage = 'Error removing driver assignment.';
                this.notificationService.showError('Error removing driver assignment');
                this.isLoading = false;
              },
            });
          } else {
            this.errorMessage = 'Failed to cancel delivery.';
            this.notificationService.showError('Failed to cancel delivery');
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error canceling delivery:', error);
          this.errorMessage = 'Error canceling delivery.';
          this.notificationService.showError('Error canceling delivery');
          this.isLoading = false;
        },
      });
    }
  }
}
