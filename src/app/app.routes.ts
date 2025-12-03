import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AllRoomsComponent } from './pages/all-rooms/all-rooms.component';

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
    }

];
