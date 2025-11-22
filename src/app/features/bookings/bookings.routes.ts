import { Routes } from '@angular/router';

export const BOOKINGS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./booking-list/booking-list')
      .then(m => m.BookingListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./booking-form/booking-form')
      .then(m => m.BookingFormComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./booking-calendar/booking-calendar')
      .then(m => m.BookingCalendarComponent)
  }
];