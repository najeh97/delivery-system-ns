import { Injectable } from '@angular/core';
import { UserType } from '../models/user-type.enum';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {
    // Initialize storage with default values if empty
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // Create default entities once to ensure consistency
    const defaultEntities = this.createDefaultEntities();

    if (!this.get('users')) {
      this.set('users', defaultEntities.users);
    }

    if (!this.get('clients')) {
      this.set('clients', [defaultEntities.clientProfile]);
    }

    if (!this.get('customers')) {
      this.set('customers', [defaultEntities.customerProfile]);
    }

    if (!this.get('drivers')) {
      this.set('drivers', [defaultEntities.driverProfile]);
    }

    if (!this.get('deliveryRequests')) this.set('deliveryRequests', []);
  }

  /**
   * Reset storage to initial state with default users
   * and empty arrays for other data
   */
  resetStorage(): void {
    const defaultEntities = this.createDefaultEntities();

    // Reset all data with default entities
    this.set('users', defaultEntities.users);
    this.set('clients', [defaultEntities.clientProfile]);
    this.set('customers', [defaultEntities.customerProfile]);
    this.set('drivers', [defaultEntities.driverProfile]);
    this.set('deliveryRequests', []);
  }

  /**
   * Creates default entities for the application
   * @returns Object containing default users and profiles
   */
  private createDefaultEntities() {
    // Create default users
    const adminUser = {
      id: 'admin-' + Date.now().toString(36),
      email: 'admin@delivery.com',
      password: 'admin123',
      userType: UserType.Admin,
    };

    const clientUser = {
      id: 'client-' + Date.now().toString(36),
      email: 'client@example.com',
      password: 'password123',
      userType: UserType.Client,
    };

    const customerUser = {
      id: 'customer-' + Date.now().toString(36),
      email: 'customer@example.com',
      password: 'password123',
      userType: UserType.Customer,
    };

    const driverUser = {
      id: 'driver-' + Date.now().toString(36),
      email: 'driver@example.com',
      password: 'password123',
      userType: UserType.Driver,
    };

    const users = [adminUser, clientUser, customerUser, driverUser];

    // Create default client profile
    const clientId = 'cl-' + Date.now().toString(36);
    const clientProfile = {
      id: clientId,
      userId: clientUser.id,
      name: 'Default Client',
      email: 'client@example.com',
      phone: '+1234567890',
      bankName: 'Example Bank',
      bankAccount: '123456789',
      address: '123 Client Street, Client City',
      approvalStatus: 'approved',
    };

    // Create default customer profile
    const customerId = 'cust-' + Date.now().toString(36);
    const customerProfile = {
      id: customerId,
      userId: customerUser.id,
      name: 'Default Customer',
      address: '456 Customer Avenue, Customer Town',
      phone: '+1987654321',
      email: 'customer@example.com',
    };

    // Create default driver profile
    const driverId = 'dr-' + Date.now().toString(36);
    const driverProfile = {
      id: driverId,
      userId: driverUser.id,
      name: 'Default Driver',
      email: 'driver@example.com',
      phone: '+1122334455',
      vehicleType: 'Car',
      modelName: 'Toyota Camry',
    };

    return {
      users,
      adminUser,
      clientUser,
      customerUser,
      driverUser,
      clientProfile,
      customerProfile,
      driverProfile,
    };
  }

  set(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string): unknown {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
