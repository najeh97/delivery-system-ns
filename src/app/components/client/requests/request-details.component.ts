import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Customer } from '../../../models/customer.model';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { Driver } from '../../../models/driver.model';
import { CustomerService } from '../../../services/customer.service';
import { DeliveryService } from '../../../services/delivery.service';
import { DriverService } from '../../../services/driver.service';

@Component({
  selector: 'app-client-request-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './request-details.component.html',
})
export class ClientRequestDetailsComponent implements OnInit {
  requestId = '';
  request: DeliveryRequest | undefined;
  customer: Customer | undefined;
  driver: Driver | undefined;

  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private customerService: CustomerService,
    private driverService: DriverService,
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

  cancelRequest(): void {
    if (!this.request) return;

    if (confirm('Are you sure you want to cancel this delivery request?')) {
      this.request.deliveryStatus = 'cancelled';
      this.request.paymentStatus = 'cancelled';

      this.deliveryService.updateDeliveryRequest(this.request).subscribe({
        next: () => {
          this.router.navigate(['/client/requests']);
        },
        error: (error) => {
          console.error('Error canceling request:', error);
          this.errorMessage = 'Error canceling request.';
        },
      });
    }
  }
}
