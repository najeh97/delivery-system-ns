import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DeliveryRequest, DeliveryStatus, PaymentStatus } from '../models/delivery-request.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  constructor(private storageService: StorageService) {}

  getAllDeliveryRequests(): Observable<DeliveryRequest[]> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    return of(requests);
  }

  getDeliveryRequestById(id: string): Observable<DeliveryRequest | undefined> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    const request = requests.find((r: DeliveryRequest) => r.id === id);
    return of(request);
  }

  getDeliveryRequestsByClientId(clientId: string): Observable<DeliveryRequest[]> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    const clientRequests = requests.filter((r: DeliveryRequest) => r.clientId === clientId);
    return of(clientRequests);
  }

  getDeliveryRequestsByCustomerId(customerId: string): Observable<DeliveryRequest[]> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    const customerRequests = requests.filter((r: DeliveryRequest) => r.customerId === customerId);
    return of(customerRequests);
  }

  getDeliveryRequestsByDriverId(driverId: string): Observable<DeliveryRequest[]> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    const driverRequests = requests.filter((r: DeliveryRequest) => r.driverId === driverId);
    return of(driverRequests);
  }

  createDeliveryRequest(request: DeliveryRequest): Observable<DeliveryRequest> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];

    // Generate a unique ID if not provided
    if (!request.id) {
      request.id = this.generateUniqueId();
    }

    // Set default statuses if not provided
    if (!request.deliveryStatus) {
      request.deliveryStatus = 'pending';
    }

    if (!request.paymentStatus) {
      request.paymentStatus = 'pending';
    }

    requests.push(request);
    this.storageService.set('deliveryRequests', requests);
    return of(request);
  }

  updateDeliveryRequest(request: DeliveryRequest): Observable<DeliveryRequest> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    const index = requests.findIndex((r: DeliveryRequest) => r.id === request.id);

    if (index !== -1) {
      requests[index] = request;
      this.storageService.set('deliveryRequests', requests);
      return of(request);
    }

    // Replace 'any' with a proper type
    return of({ ...request, error: 'Request not found' } as DeliveryRequest & { error: string });
  }

  assignDriverToRequest(
    requestId: string,
    driverId: string,
  ): Observable<DeliveryRequest | undefined> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    const index = requests.findIndex((r: DeliveryRequest) => r.id === requestId);

    if (index !== -1) {
      requests[index].driverId = driverId;
      requests[index].deliveryStatus = 'assigned';
      this.storageService.set('deliveryRequests', requests);
      return of(requests[index]);
    }

    return of(undefined);
  }

  updateDeliveryStatus(
    requestId: string,
    status: DeliveryStatus,
  ): Observable<DeliveryRequest | undefined> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    const index = requests.findIndex((r: DeliveryRequest) => r.id === requestId);

    if (index !== -1) {
      requests[index].deliveryStatus = status;
      this.storageService.set('deliveryRequests', requests);
      return of(requests[index]);
    }

    return of(undefined);
  }

  updatePaymentStatus(
    requestId: string,
    status: PaymentStatus,
  ): Observable<DeliveryRequest | undefined> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    const index = requests.findIndex((r: DeliveryRequest) => r.id === requestId);

    if (index !== -1) {
      requests[index].paymentStatus = status;
      this.storageService.set('deliveryRequests', requests);
      return of(requests[index]);
    }

    return of(undefined);
  }

  deleteDeliveryRequest(id: string): Observable<boolean> {
    const requests = (this.storageService.get('deliveryRequests') as DeliveryRequest[]) || [];
    const updatedRequests = requests.filter((r: DeliveryRequest) => r.id !== id);

    if (updatedRequests.length !== requests.length) {
      this.storageService.set('deliveryRequests', updatedRequests);
      return of(true);
    }

    return of(false);
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
