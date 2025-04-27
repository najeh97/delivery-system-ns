import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApprovalStatus, Client } from '../../../../models/client.model';
import { ClientService } from '../../../../services/client.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  filter: 'all' | ApprovalStatus = 'all';
  isLoading = true;

  constructor(
    private clientService: ClientService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filterClients(this.filter);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
      },
    });
  }

  filterClients(status: 'all' | ApprovalStatus): void {
    this.filter = status;
    if (status === 'all') {
      this.filteredClients = [...this.clients];
    } else {
      this.filteredClients = this.clients.filter((client) => client.approvalStatus === status);
    }
  }

  approveClient(client: Client): void {
    this.clientService.updateApprovalStatus(client.id, 'approved').subscribe({
      next: () => {
        client.approvalStatus = 'approved';
        this.notificationService.showSuccess(`Client ${client.name} has been approved`);
      },
      error: (error) => {
        console.error('Error approving client:', error);
        this.notificationService.showError('Failed to approve client');
      },
    });
  }

  rejectClient(client: Client): void {
    this.clientService.updateApprovalStatus(client.id, 'rejected').subscribe({
      next: () => {
        client.approvalStatus = 'rejected';
        this.notificationService.showSuccess(`Client ${client.name} has been rejected`);
      },
      error: (error) => {
        console.error('Error rejecting client:', error);
        this.notificationService.showError('Failed to reject client');
      },
    });
  }

  deleteClient(client: Client): void {
    if (confirm(`Are you sure you want to delete client ${client.name}?`)) {
      this.clientService.deleteClient(client.id).subscribe({
        next: (success) => {
          if (success) {
            this.clients = this.clients.filter((c) => c.id !== client.id);
            this.filterClients(this.filter);
            this.notificationService.showSuccess(`Client ${client.name} has been deleted`);
          }
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          this.notificationService.showError('Failed to delete client');
        },
      });
    }
  }
}
