import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { Driver } from '../../../models/driver.model';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { DeliveryService } from '../../../services/delivery.service';
import { DriverService } from '../../../services/driver.service';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './driver-dashboard.component.html',
})
export class DriverDashboardComponent implements OnInit {
  driver: Driver | undefined;
  requests: DeliveryRequest[] = [];
  activeDeliveries: DeliveryRequest[] = [];
  completedDeliveries: DeliveryRequest[] = [];
  pendingPayments: DeliveryRequest[] = [];
  recentDeliveries: DeliveryRequest[] = [];
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private driverService: DriverService,
    private deliveryService: DeliveryService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadDriverProfile();
    }
  }

  loadDriverProfile(): void {
    if (!this.currentUser?.id) return;

    this.driverService.getDriverByUserId(this.currentUser.id).subscribe((driver) => {
      if (driver) {
        this.driver = driver;
        this.loadRequests();
      }
    });
  }

  loadRequests(): void {
    if (!this.driver?.id) return;

    this.deliveryService.getDeliveryRequestsByDriverId(this.driver.id).subscribe((requests) => {
      this.requests = requests;

      // Active deliveries (assigned, in-progress)
      this.activeDeliveries = requests.filter(
        (r) => r.deliveryStatus === 'assigned' || r.deliveryStatus === 'in-progress',
      );

      // Completed deliveries
      this.completedDeliveries = requests.filter((r) => r.deliveryStatus === 'completed');

      // Pending payments (completed but payment pending)
      this.pendingPayments = requests.filter(
        (r) => r.deliveryStatus === 'completed' && r.paymentStatus === 'pending',
      );

      // Recent deliveries (completed, sorted by date)
      this.recentDeliveries = [...this.completedDeliveries]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    });
  }
}
