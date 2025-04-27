import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Client } from '../../../models/client.model';
import { AuthService } from '../../../services/auth.service';
import { ClientService } from '../../../services/client.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-profile.component.html',
})
export class ClientProfileComponent implements OnInit {
  client: Client | null = null;
  isLoading = true;
  isUpdating = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadClientProfile();
  }

  loadClientProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.clientService.getClientByUserId(currentUser.id!).subscribe({
      next: (client) => {
        if (client) {
          this.client = client;
        } else {
          this.errorMessage = 'Could not load client profile';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading client profile';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  updateProfile(): void {
    if (!this.client) return;

    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clientService.updateClient(this.client).subscribe({
      next: (updatedClient) => {
        if ('error' in updatedClient) {
          this.errorMessage = updatedClient.error as string;
          this.notificationService.showError(updatedClient.error as string);
        } else {
          this.client = updatedClient;
          this.notificationService.showSuccess('Profile updated successfully');
        }
        this.isUpdating = false;
      },
      error: (error) => {
        this.errorMessage = 'Error updating profile';
        this.notificationService.showError('Error updating profile');
        console.error(error);
        this.isUpdating = false;
      },
    });
  }
}
