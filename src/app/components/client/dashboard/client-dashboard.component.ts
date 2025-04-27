import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Client } from '../../../models/client.model';
import { DeliveryRequest } from '../../../models/delivery-request.model';
import { AuthService } from '../../../services/auth.service';
import { ClientService } from '../../../services/client.service';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html',
})
export class ClientDashboardComponent implements OnInit {
  client: Client | null = null;
  requests: DeliveryRequest[] = [];
  recentRequests: DeliveryRequest[] = [];
  activeRequests: DeliveryRequest[] = [];
  completedRequests: DeliveryRequest[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private deliveryService: DeliveryService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadClientData();
  }

  loadClientData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load client profile
    this.clientService.getClientByUserId(currentUser.id!).subscribe({
      next: (client) => {
        if (client) {
          this.client = client;
          this.loadClientRequests(client.id);
        }
      },
      error: (error) => {
        console.error('Error loading client profile:', error);
      },
    });
  }

  loadClientRequests(clientId: string): void {
    this.deliveryService.getDeliveryRequestsByClientId(clientId).subscribe({
      next: (requests) => {
        this.requests = requests;

        // Get recent requests (last 5)
        this.recentRequests = [...requests]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        // Filter active and completed requests
        this.activeRequests = requests.filter(
          (r) =>
            r.deliveryStatus === 'pending' ||
            r.deliveryStatus === 'assigned' ||
            r.deliveryStatus === 'in-progress',
        );
        this.completedRequests = requests.filter((r) => r.deliveryStatus === 'completed');
      },
      error: (error) => {
        console.error('Error loading client requests:', error);
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
