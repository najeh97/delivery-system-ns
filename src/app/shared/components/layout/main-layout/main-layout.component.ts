import { CommonModule, Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  @Input() showSidebar = true;
  @Input() showBackButton = false;

  constructor(
    private location: Location,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Automatically determine if back button should be shown based on route
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const currentUrl = this.router.url;
      // Show back button on edit/detail pages but not on main dashboard/list pages
      this.showBackButton =
        currentUrl.includes('/profile/edit') ||
        currentUrl.includes('/details') ||
        currentUrl.includes('/edit') ||
        (currentUrl.includes('/requests/') && !currentUrl.endsWith('/requests/'));
    });
  }

  goBack(): void {
    this.location.back();
  }
}
