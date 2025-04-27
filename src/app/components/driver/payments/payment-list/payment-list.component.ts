// filepath: /home/saleh/Desktop/projects/delivery-system-ns-fork/src/app/components/driver/payments/payment-list/payment-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../../models/delivery-request.model';
import { AuthService } from '../../../../services/auth.service';
import { DeliveryService } from '../../../../services/delivery.service';
import { DriverService } from '../../../../services/driver.service';

@Component({
  selector: 'app-driver-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-list.component.html',
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
