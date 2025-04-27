import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Client } from '../../../../models/client.model';
import { ClientService } from '../../../../services/client.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-details.component.html',
})
export class ClientDetailsComponent implements OnInit {
  client?: Client;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadClient();
  }

  loadClient(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notificationService.showError('Client ID is missing');
      this.router.navigate(['/admin/clients']);
      return;
    }

    this.isLoading = true;
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        if (client) {
          this.client = client;
        } else {
          this.notificationService.showError('Client not found');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.notificationService.showError('Failed to load client details');
        this.isLoading = false;
      },
    });
  }

  approveClient(): void {
    if (!this.client) return;

    this.clientService.updateApprovalStatus(this.client.id, 'approved').subscribe({
      next: () => {
        this.client!.approvalStatus = 'approved';
        this.notificationService.showSuccess(`Client ${this.client?.name} has been approved`);
      },
      error: (error) => {
        console.error('Error approving client:', error);
        this.notificationService.showError('Failed to approve client');
      },
    });
  }

  rejectClient(): void {
    if (!this.client) return;

    this.clientService.updateApprovalStatus(this.client.id, 'rejected').subscribe({
      next: () => {
        this.client!.approvalStatus = 'rejected';
        this.notificationService.showSuccess(`Client ${this.client?.name} has been rejected`);
      },
      error: (error) => {
        console.error('Error rejecting client:', error);
        this.notificationService.showError('Failed to reject client');
      },
    });
  }

  deleteClient(): void {
    if (!this.client) return;

    if (confirm(`Are you sure you want to delete client ${this.client.name}?`)) {
      this.clientService.deleteClient(this.client.id).subscribe({
        next: (success) => {
          if (success) {
            this.notificationService.showSuccess(`Client ${this.client?.name} has been deleted`);
            this.router.navigate(['/admin/clients']);
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
