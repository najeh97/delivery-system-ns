import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { AuthService } from '../../../services/auth.service';
import { ClientService } from '../../../services/client.service';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-client-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './request-list.component.html',
})
export class ClientRequestListComponent implements OnInit {
  requests: DeliveryRequest[] = [];
  filteredRequests: DeliveryRequest[] = [];
  currentFilter: 'all' | 'pending' | 'active' | 'completed' = 'all';

  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private deliveryService: DeliveryService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to view requests.';
      this.isLoading = false;
      return;
    }

    this.clientService.getClientByUserId(currentUser.id!).subscribe({
      next: (client) => {
        if (client) {
          this.deliveryService.getDeliveryRequestsByClientId(client.id).subscribe({
            next: (requests) => {
              this.requests = this.sortRequestsByDate(requests);
              this.applyFilter();
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading delivery requests:', error);
              this.errorMessage = 'Failed to load delivery requests.';
              this.isLoading = false;
            },
          });
        } else {
          this.errorMessage = 'Client profile not found.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading client profile:', error);
        this.errorMessage = 'Failed to load client profile.';
        this.isLoading = false;
      },
    });
  }

  setFilter(filter: 'all' | 'pending' | 'active' | 'completed'): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentFilter === 'all') {
      this.filteredRequests = this.requests;
    } else if (this.currentFilter === 'pending') {
      this.filteredRequests = this.requests.filter(
        (request) => request.deliveryStatus === 'pending',
      );
    } else if (this.currentFilter === 'active') {
      this.filteredRequests = this.requests.filter(
        (request) =>
          request.deliveryStatus === 'assigned' || request.deliveryStatus === 'in-progress',
      );
    } else if (this.currentFilter === 'completed') {
      this.filteredRequests = this.requests.filter(
        (request) => request.deliveryStatus === 'completed',
      );
    }
  }

  private sortRequestsByDate(requests: DeliveryRequest[]): DeliveryRequest[] {
    return [...requests].sort((a, b) => {
      // Sort by date in descending order (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
}
