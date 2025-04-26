import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationType } from '../components/notifications/toaster-notification.component';

export interface ToastNotification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = new BehaviorSubject<ToastNotification[]>([]);

  getNotifications(): Observable<ToastNotification[]> {
    return this.notifications.asObservable();
  }

  showSuccess(message: string, duration = 5000): string {
    return this.show(message, 'success', duration);
  }

  showError(message: string, duration = 5000): string {
    return this.show(message, 'error', duration);
  }

  showWarning(message: string, duration = 5000): string {
    return this.show(message, 'warning', duration);
  }

  showInfo(message: string, duration = 5000): string {
    return this.show(message, 'info', duration);
  }

  private show(message: string, type: NotificationType, duration: number): string {
    const id = this.generateId();
    const notification: ToastNotification = {
      id,
      message,
      type,
      duration,
    };

    this.notifications.next([...this.notifications.value, notification]);
    return id;
  }

  dismiss(id: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.filter((n) => n.id !== id);
    this.notifications.next(updatedNotifications);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
