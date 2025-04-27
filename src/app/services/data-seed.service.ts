import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { Client } from '../models/client.model';
import { Customer } from '../models/customer.model';
import { DeliveryRequest, DeliveryStatus, PaymentStatus } from '../models/delivery-request.model';
import { Driver, VehicleType } from '../models/driver.model';
import { UserType } from '../models/user-type.enum';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class DataSeedService {
  constructor(private storageService: StorageService) {}

  /**
   * Seed the database with fake data
   * @param count Number of entries to generate for each type
   */
  seedDatabase(options?: { minCount?: number; maxCount?: number }): void {
    const { minCount = 30, maxCount = 100 } = options || {};

    // Generate fake data
    const clientIds = this.seedClients(faker.number.int({ min: minCount, max: maxCount }));
    const customerIds = this.seedCustomers(faker.number.int({ min: minCount, max: maxCount }));
    const driverIds = this.seedDrivers(faker.number.int({ min: minCount, max: maxCount }));
    this.seedDeliveryRequests(
      faker.number.int({ min: minCount, max: maxCount }),
      clientIds,
      customerIds,
      driverIds,
    );
  }

  /**
   * Seed clients data
   * @returns Array of generated client IDs
   */
  private seedClients(count: number): string[] {
    const clients = (this.storageService.get('clients') as Client[]) || [];
    const users = (this.storageService.get('users') as User[]) || [];
    const clientIds: string[] = clients.map((client) => client.id);

    for (let i = 0; i < count; i++) {
      const id = 'client-' + faker.string.uuid();
      clientIds.push(id);

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      // Create client
      const client: Client = {
        id,
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({
          firstName: firstName.toLowerCase(),
          lastName: lastName.toLocaleLowerCase(),
        }),
        phone: faker.phone.number({ style: 'international' }),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.zipCode()}, ${faker.location.country()}`,
        bankName: faker.company.name(),
        bankAccount: faker.finance.accountNumber(),
        approvalStatus: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
      };
      clients.push(client);

      // Create user account for the client
      const user = {
        id: 'user-' + faker.string.uuid(),
        email: client.email,
        password: 'password123', // Default password
        userType: UserType.Client,
        linkedId: client.id,
      };
      users.push(user);
    }

    // Save generated data
    this.storageService.set('clients', clients);
    this.storageService.set('users', users);

    return clientIds;
  }

  /**
   * Seed customers data
   * @returns Array of generated customer IDs
   */
  private seedCustomers(count: number): string[] {
    const customers = (this.storageService.get('customers') as Customer[]) || [];
    const users = (this.storageService.get('users') as User[]) || [];
    const customerIds: string[] = customers.map((customer) => customer.id);

    for (let i = 0; i < count; i++) {
      const id = 'customer-' + faker.string.uuid();
      customerIds.push(id);

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      // Create customer
      const customer: Customer = {
        id,
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({
          firstName: firstName.toLowerCase(),
          lastName: lastName.toLocaleLowerCase(),
        }),

        phone: faker.phone.number(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.zipCode()}, ${faker.location.country()}`,
      };
      customers.push(customer);

      // Create user account for some customers
      const user = {
        id: 'user-' + faker.string.uuid(),
        email: customer.email,
        password: 'password123', // Default password
        userType: UserType.Customer,
        linkedId: customer.id,
      };
      users.push(user);
    }

    // Save generated data
    this.storageService.set('customers', customers);
    this.storageService.set('users', users);

    return customerIds;
  }

  /**
   * Seed drivers data
   * @returns Array of generated driver IDs
   */
  private seedDrivers(count: number): string[] {
    const drivers = (this.storageService.get('drivers') as Driver[]) || [];
    const users = (this.storageService.get('users') as User[]) || [];
    const driverIds: string[] = drivers.map((driver) => driver.id);

    for (let i = 0; i < count; i++) {
      const id = 'driver-' + faker.string.uuid();
      driverIds.push(id);

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      const email = faker.internet.email({
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLocaleLowerCase(),
      });

      // Create driver
      const driver: Driver = {
        id,
        name: `${firstName} ${lastName}`,
        email: email,
        phone: faker.phone.number({ style: 'international' }),
        vehicleType: faker.helpers.arrayElement(['Car', 'Motorcycle']) as VehicleType,
        modelName: faker.vehicle.model(),
      };
      drivers.push(driver);

      // Create user account for the driver
      const user = {
        id: 'user-' + faker.string.uuid(),
        email: email,
        password: 'password123', // Default password
        userType: UserType.Driver,
        linkedId: driver.id,
      };
      users.push(user);
    }

    // Save generated data
    this.storageService.set('drivers', drivers);
    this.storageService.set('users', users);

    return driverIds;
  }

  /**
   * Seed delivery requests data
   */
  private seedDeliveryRequests(
    count: number,
    clientIds: string[],
    customerIds: string[],
    driverIds: string[],
  ): void {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];

    for (let i = 0; i < count; i++) {
      const clientId = faker.helpers.arrayElement(clientIds);
      const customerId = faker.helpers.arrayElement(customerIds);
      const assignDriver = faker.datatype.boolean(0.7);
      const driverId = assignDriver ? faker.helpers.arrayElement(driverIds) : undefined;
      const date = faker.date.past().toISOString();

      // Determine status based on driver assignment
      let deliveryStatus: DeliveryStatus;
      if (!driverId) {
        deliveryStatus = 'pending';
      } else {
        deliveryStatus = faker.helpers.arrayElement([
          'assigned',
          'in-progress',
          'completed',
          'cancelled',
        ]) as DeliveryStatus;
      }

      // Create request
      const request: DeliveryRequest = {
        id: 'req-' + faker.string.uuid(),
        clientId,
        customerId,
        driverId,
        date,
        deliveryDetails: `From ${this.getCity()} to ${this.getCity()} - ${faker.commerce.productName()}`,
        deliveryStatus,
        paymentStatus: faker.helpers.arrayElement([
          'pending',
          'paid',
          'cancelled',
        ]) as PaymentStatus,
        paymentAmount: faker.number.float({ min: 2, max: 20, fractionDigits: 2 }),
      };
      requests.push(request);
    }

    // Save generated data
    this.storageService.set('deliveryRequests', requests);
  }

  /**
   * Return a random city name
   */
  private getCity(): string {
    const cities = [
      'Amman',
      'Zarqa',
      'Irbid',
      'Aqaba',
      'Madaba',
      'Jerash',
      'Ajloun',
      'Mafraq',
      'Karak',
      'Tafilah',
      "Ma'an",
      'Salt',
    ];
    return faker.helpers.arrayElement(cities);
  }
}
