import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './driver-dashboard.component.html',
})
export class DriverDashboardComponent implements OnInit {
  ngOnInit(): void {
    console.log('Driver Dashboard Component Initialized');
  }
}
