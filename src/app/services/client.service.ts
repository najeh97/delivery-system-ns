import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApprovalStatus, Client } from '../models/client.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private storageService: StorageService) {}

  getClients(): Observable<Client[]> {
    const clients = (this.storageService.get('clients') as Client[]) || [];
    return of(clients);
  }

  getClientById(id: string): Observable<Client | undefined> {
    const clients = (this.storageService.get('clients') as Client[]) || [];
    const client = clients.find((c: Client) => c.id === id);
    return of(client);
  }

  getClientByUserId(userId: string): Observable<Client | undefined> {
    const clients = (this.storageService.get('clients') as Client[]) || [];
    const client = clients.find((c: Client) => c.userId === userId);
    return of(client);
  }

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

  updateClient(client: Client): Observable<Client> {
    const clients = (this.storageService.get('clients') as Client[]) || [];
    const index = clients.findIndex((c: Client) => c.id === client.id);

    if (index !== -1) {
      clients[index] = client;
      this.storageService.set('clients', clients);
      return of(client);
    }

    // Use a proper type for the error case instead of 'any'
    return of({ ...client, error: 'Client not found' } as Client & { error: string });
  }

  updateApprovalStatus(clientId: string, status: ApprovalStatus): Observable<Client | undefined> {
    const clients = (this.storageService.get('clients') as Client[]) || [];
    const index = clients.findIndex((c: Client) => c.id === clientId);

    if (index !== -1) {
      clients[index].approvalStatus = status;
      this.storageService.set('clients', clients);
      return of(clients[index]);
    }

    return of(undefined);
  }

  deleteClient(id: string): Observable<boolean> {
    const clients = (this.storageService.get('clients') as Client[]) || [];
    const updatedClients = clients.filter((c: Client) => c.id !== id);

    if (updatedClients.length !== clients.length) {
      this.storageService.set('clients', updatedClients);
      return of(true);
    }

    return of(false);
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
