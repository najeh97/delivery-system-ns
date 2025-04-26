import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Customer } from '../models/customer.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private storageService: StorageService) {}

  createCustomer(customer: Customer): Observable<Customer> {
    const customers = (this.storageService.get('customers') as Customer[]) || [];

    // Generate a unique ID if not provided
    if (!customer.id) {
      customer.id = this.generateUniqueId();
    }

    customers.push(customer);
    this.storageService.set('customers', customers);
    return of(customer);
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
