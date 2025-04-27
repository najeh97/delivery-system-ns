import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Customer } from '../models/customer.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private storageService: StorageService) {}

  getCustomers(): Observable<Customer[]> {
    const customers = (this.storageService.get('customers') as Customer[]) || [];
    return of(customers);
  }

  getCustomerById(id: string): Observable<Customer | undefined> {
    const customers = (this.storageService.get('customers') as Customer[]) || [];
    const customer = customers.find((c: Customer) => c.id === id);
    return of(customer);
  }

  getCustomerByUserId(userId: string): Observable<Customer | undefined> {
    const customers = (this.storageService.get('customers') as Customer[]) || [];
    const customer = customers.find((c: Customer) => c.userId === userId);
    return of(customer);
  }

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

  updateCustomer(customer: Customer): Observable<Customer> {
    const customers = (this.storageService.get('customers') as Customer[]) || [];
    const index = customers.findIndex((c: Customer) => c.id === customer.id);

    if (index !== -1) {
      customers[index] = customer;
      this.storageService.set('customers', customers);
      return of(customer);
    }

    // Replace 'any' with a proper type
    return of({ ...customer, error: 'Customer not found' } as Customer & { error: string });
  }

  updateCustomerLocation(id: string, address: string): Observable<Customer | undefined> {
    const customers = (this.storageService.get('customers') as Customer[]) || [];
    const index = customers.findIndex((c: Customer) => c.id === id);

    if (index !== -1) {
      customers[index].address = address;
      this.storageService.set('customers', customers);
      return of(customers[index]);
    }

    return of(undefined);
  }

  deleteCustomer(id: string): Observable<boolean> {
    const customers = (this.storageService.get('customers') as Customer[]) || [];
    const updatedCustomers = customers.filter((c: Customer) => c.id !== id);

    if (updatedCustomers.length !== customers.length) {
      this.storageService.set('customers', updatedCustomers);
      return of(true);
    }

    return of(false);
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
