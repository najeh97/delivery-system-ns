import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Driver, VehicleType } from '../models/driver.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  constructor(private storageService: StorageService) {}

  getDrivers(): Observable<Driver[]> {
    const drivers = (this.storageService.get('drivers') as Driver[]) || [];
    return of(drivers);
  }

  getDriverById(id: string): Observable<Driver | undefined> {
    const drivers = (this.storageService.get('drivers') as Driver[]) || [];
    const driver = drivers.find((d: Driver) => d.id === id);
    return of(driver);
  }

  getDriverByUserId(userId: string): Observable<Driver | undefined> {
    const drivers = (this.storageService.get('drivers') as Driver[]) || [];
    const driver = drivers.find((d: Driver) => d.userId === userId);
    return of(driver);
  }

  createDriver(driver: Driver): Observable<Driver> {
    const drivers = (this.storageService.get('drivers') as Driver[]) || [];

    // Generate a unique ID if not provided
    if (!driver.id) {
      driver.id = this.generateUniqueId();
    }

    drivers.push(driver);
    this.storageService.set('drivers', drivers);
    return of(driver);
  }

  updateDriver(driver: Driver): Observable<Driver> {
    const drivers = (this.storageService.get('drivers') as Driver[]) || [];
    const index = drivers.findIndex((d: Driver) => d.id === driver.id);

    if (index !== -1) {
      drivers[index] = driver;
      this.storageService.set('drivers', drivers);
      return of(driver);
    }

    // Replace 'any' with a proper type
    return of({ ...driver, error: 'Driver not found' } as Driver & { error: string });
  }

  deleteDriver(id: string): Observable<boolean> {
    const drivers = (this.storageService.get('drivers') as Driver[]) || [];
    const updatedDrivers = drivers.filter((d: Driver) => d.id !== id);

    if (updatedDrivers.length !== drivers.length) {
      this.storageService.set('drivers', updatedDrivers);
      return of(true);
    }

    return of(false);
  }

  filterDriversByVehicleType(vehicleType: VehicleType): Observable<Driver[]> {
    const drivers = (this.storageService.get('drivers') as Driver[]) || [];
    const filteredDrivers = drivers.filter((d: Driver) => d.vehicleType === vehicleType);
    return of(filteredDrivers);
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
