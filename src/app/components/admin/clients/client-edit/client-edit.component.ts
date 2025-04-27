import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Client } from '../../../../models/client.model';
import { ClientService } from '../../../../services/client.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './client-edit.component.html',
})
export class ClientEditComponent implements OnInit {
  client?: Client;
  clientForm?: FormGroup;
  isLoading = true;
  isSaving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
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
          this.initForm();
        } else {
          this.notificationService.showError('Client not found');
          this.router.navigate(['/admin/clients']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.notificationService.showError('Failed to load client details');
        this.isLoading = false;
        this.router.navigate(['/admin/clients']);
      },
    });
  }

  initForm(): void {
    if (!this.client) return;

    this.clientForm = this.fb.group({
      name: [this.client.name, Validators.required],
      email: [this.client.email, [Validators.required, Validators.email]],
      phone: [this.client.phone, Validators.required],
      address: [this.client.address, Validators.required],
      bankName: [this.client.bankName, Validators.required],
      bankAccount: [this.client.bankAccount, Validators.required],
      approvalStatus: [this.client.approvalStatus, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.clientForm?.invalid || !this.client) return;

    this.isSaving = true;
    const updatedClient: Client = {
      ...this.client,
      ...this.clientForm?.value,
    };

    this.clientService.updateClient(updatedClient).subscribe({
      next: (client) => {
        if ('error' in client) {
          this.notificationService.showError('Failed to update client');
        } else {
          this.notificationService.showSuccess('Client updated successfully');
          this.router.navigate(['/admin/clients', client.id]);
        }
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error updating client:', error);
        this.notificationService.showError('Failed to update client');
        this.isSaving = false;
      },
    });
  }
}
