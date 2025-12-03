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
    path: 'bookings',
    loadComponent: () => import('./room-booking/room-booking')
      .then(m => m.BookingManagementComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./calendar/calendar')
      .then(m => m.CalendarComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings')
      .then(m => m.SettingsComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];