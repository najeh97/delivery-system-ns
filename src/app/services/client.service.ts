import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Client } from '../models/client.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private storageService: StorageService) {}

  createClient(client: Client): Observable<Client> {
    const clients = (this.storageService.get('clients') as Client[]) || [];

    // Generate a unique ID if not provided
    if (!client.id) {
      client.id = this.generateUniqueId();
    }

    // Set default approval status if not provided
    if (!client.approvalStatus) {
      client.approvalStatus = 'pending';
    }

    clients.push(client);
    this.storageService.set('clients', clients);
    return of(client);
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
