import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { AllRoomsComponent } from './features/all-rooms/all-rooms.component';

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
