import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toaster-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toaster-notification.component.html',
})
export class ToasterNotificationComponent implements OnInit, OnDestroy {
  @Input() message = '';
  @Input() type: NotificationType = 'success';
  @Input() duration = 5000; // milliseconds
  @Input() visible = true;

  @Output() closed = new EventEmitter<void>();

  private timeoutId: number | null = null;

  ngOnInit(): void {
    this.startCloseTimer();
  }

  ngOnDestroy(): void {
    this.clearCloseTimer();
  }

  close(): void {
    this.visible = false;
    this.clearCloseTimer();
    this.closed.emit();
  }

  private startCloseTimer(): void {
    if (this.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  private clearCloseTimer(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  getNotificationClass(): string {
    switch (this.type) {
      case 'success':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200';
    }
  }
}
