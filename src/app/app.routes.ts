import { Routes } from '@angular/router';
import { UserType } from './models/user-type.enum';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth routes
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register/register.component').then((c) => c.RegisterComponent),
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: [UserType.Admin] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/admin/dashboard/admin-dashboard.component').then(
            (c) => c.AdminDashboardComponent,
          ),
      },
    ],
  },

  // Client routes
  {
    path: 'client',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: [UserType.Client] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/client/dashboard/client-dashboard.component').then(
            (c) => c.ClientDashboardComponent,
          ),
      },
    ],
  },

  // Customer routes
  {
    path: 'customer',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: [UserType.Customer] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/customer/dashboard/customer-dashboard.component').then(
            (c) => c.CustomerDashboardComponent,
          ),
      },
    ],
  },

  //   // Driver routes
  {
    path: 'driver',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: [UserType.Driver] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/driver/dashboard/driver-dashboard.component').then(
            (c) => c.DriverDashboardComponent,
          ),
      },
    ],
  },

  // Fallback route
  { path: '**', redirectTo: '/login' },
];
