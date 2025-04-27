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
      {
        path: 'drivers',
        loadComponent: () =>
          import('./components/admin/drivers/driver-list/driver-list.component').then(
            (c) => c.DriverListComponent,
          ),
      },
      {
        path: 'drivers/add',
        loadComponent: () =>
          import('./components/admin/drivers/add-driver/add-driver.component').then(
            (c) => c.AddDriverComponent,
          ),
      },
      {
        path: 'drivers/:id',
        loadComponent: () =>
          import('./components/admin/drivers/driver-details/driver-details.component').then(
            (c) => c.DriverDetailsComponent,
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./components/admin/clients/client-list/client-list.component').then(
            (c) => c.ClientListComponent,
          ),
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./components/admin/clients/client-details/client-details.component').then(
            (c) => c.ClientDetailsComponent,
          ),
      },
      {
        path: 'clients/edit/:id',
        loadComponent: () =>
          import('./components/admin/clients/client-edit/client-edit.component').then(
            (c) => c.ClientEditComponent,
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./components/admin/customers/customer-list/customer-list.component').then(
            (c) => c.CustomerListComponent,
          ),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./components/admin/customers/customer-details/customer-details.component').then(
            (c) => c.CustomerDetailsComponent,
          ),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./components/admin/requests/request-list/request-list.component').then(
            (c) => c.RequestListComponent,
          ),
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./components/admin/requests/request-details/request-details.component').then(
            (c) => c.RequestDetailsComponent,
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
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/client/profile/client-profile.component').then(
            (c) => c.ClientProfileComponent,
          ),
      },
      {
        path: 'drivers',
        loadComponent: () =>
          import('./components/client/drivers/driver-list.component').then(
            (c) => c.ClientDriverListComponent,
          ),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./components/client/requests/request-list.component').then(
            (c) => c.ClientRequestListComponent,
          ),
      },
      {
        path: 'requests/new',
        loadComponent: () =>
          import('./components/client/requests/create-request.component').then(
            (c) => c.CreateRequestComponent,
          ),
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./components/client/requests/request-details.component').then(
            (c) => c.ClientRequestDetailsComponent,
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./components/client/payments/payment-list.component').then(
            (c) => c.PaymentListComponent,
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
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/customer/profile/customer-profile.component').then(
            (c) => c.CustomerProfileComponent,
          ),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./components/customer/requests/request-list/request-list.component').then(
            (c) => c.CustomerRequestListComponent,
          ),
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./components/customer/requests/request-details/request-details.component').then(
            (c) => c.CustomerRequestDetailsComponent,
          ),
      },
    ],
  },

  // Driver routes
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
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/driver/profile/driver-profile.component').then(
            (c) => c.DriverProfileComponent,
          ),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./components/driver/requests/request-list/request-list.component').then(
            (c) => c.DriverRequestListComponent,
          ),
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./components/driver/requests/request-details/request-details.component').then(
            (c) => c.DriverRequestDetailsComponent,
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./components/driver/payments/payment-list/payment-list.component').then(
            (c) => c.DriverPaymentListComponent,
          ),
      },
    ],
  },

  // Fallback route
  { path: '**', redirectTo: '/login' },
];
