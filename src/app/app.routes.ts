import { Routes } from '@angular/router';
import { ADMIN_ROUTES } from './features/admin/admin.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    children: ADMIN_ROUTES
  },
  {
    path: 'rooms',
    loadChildren: () => import('./features/rooms/rooms.routes')
      .then(m => m.ROOMS_ROUTES)
  },
  {
    path: 'bookings',
    loadChildren: () => import('./features/bookings/bookings.routes')
      .then(m => m.BOOKINGS_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'admin'
  }
];