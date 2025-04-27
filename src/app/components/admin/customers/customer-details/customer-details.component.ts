import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../../../models/customer.model';
import { CustomerService } from '../../../../services/customer.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-details.component.html',
})
export class CustomerDetailsComponent implements OnInit {
  customer: Customer | null = null;
  editedCustomer: Customer | null = null;
  isLoading = true;
  isEditing = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadCustomerDetails();
  }

  loadCustomerDetails(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Customer ID not found';
      this.isLoading = false;
      return;
    }

    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        if (customer) {
          this.customer = customer;
          // Create a copy for editing
          this.editedCustomer = { ...customer };
        } else {
          this.errorMessage = 'Customer not found';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading customer details';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  toggleEditing(): void {
    this.isEditing = true;
    if (this.customer) {
      // Create a fresh copy of the customer data for editing
      this.editedCustomer = { ...this.customer };
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  saveChanges(): void {
    if (!this.editedCustomer) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.updateCustomer(this.editedCustomer).subscribe({
      next: (updatedCustomer) => {
        this.customer = updatedCustomer;
        this.isEditing = false;
        this.isLoading = false;
        this.notificationService.showSuccess('Customer information updated successfully');
      },
      error: (error) => {
        this.errorMessage = 'Error updating customer';
        this.notificationService.showError('Failed to update customer information');
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  confirmDelete(): void {
    if (!this.customer) return;

    if (confirm(`Are you sure you want to delete customer ${this.customer.name}?`)) {
      this.deleteCustomer();
    }
  }

  deleteCustomer(): void {
    if (!this.customer) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.deleteCustomer(this.customer.id).subscribe({
      next: (success) => {
        if (success) {
          this.notificationService.showSuccess('Customer deleted successfully');
          this.router.navigate(['/admin/customers']);
        } else {
          this.errorMessage = 'Failed to delete customer';
          this.notificationService.showError('Failed to delete customer');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error deleting customer';
        this.notificationService.showError('Error deleting customer');
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/customers']);
  }
}
