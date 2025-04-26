import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  NotificationService,
  ToastNotification,
} from '../../../shared/services/notification.service';
import { ToasterNotificationComponent } from './toaster-notification.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToasterNotificationComponent],
  templateUrl: './toast-container.component.html',
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  activeNotifications: ToastNotification[] = [];
  private subscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe((notifications) => {
      this.activeNotifications = notifications;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeNotification(id: string): void {
    this.notificationService.dismiss(id);
  }
}
