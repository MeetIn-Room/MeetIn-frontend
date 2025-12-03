import { Routes } from '@angular/router';
import { LoginComponent } from './features/user/login/login.component';
import { HomeComponent } from './features/user/home/home.component';
import { AllRoomsComponent } from './features/user/all-rooms/all-rooms.component';
import { ADMIN_ROUTES } from './features/admin/admin.routes';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        title: 'User Authentication',
        component: LoginComponent
    },
    {
        path: 'all-rooms',
        title: 'All Rooms',
        component: AllRoomsComponent
    },
    {
        path: 'home',
        title: 'Home',
        component: HomeComponent
    },
  {
    path: 'admin',
    title: 'Admin Panel',
    children: ADMIN_ROUTES
  },
  {
    path: '**',
    redirectTo: '404'
  },
//   {
//     path: '404',
//     title: 'Page Not Found',
    
//   }

];
