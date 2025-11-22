import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./booking-dashboard/booking-dashboard')
      .then(m => m.BookingDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./user-management/user-management')
      .then(m => m.UserManagementComponent)
  },
  {
    path: 'rooms',
    loadComponent: () => import('./room-management/room-management')
      .then(m => m.RoomManagementComponent)
  },
  
    {
    path: '',
    redirectTo: 'rooms',
    pathMatch: 'full'
  }
];