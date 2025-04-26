import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html',
})
export class ClientDashboardComponent implements OnInit {
  constructor() {
    console.log('Client Dashboard Component constructor');
  }

  ngOnInit(): void {
    console.log('Client Dashboard Component Initialized');
  }
}
