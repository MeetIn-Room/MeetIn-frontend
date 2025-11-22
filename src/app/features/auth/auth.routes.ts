import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
    {
    path: 'login',
    loadComponent: () => import('./login-register/login-register').then(m => m.LoginRegisterComponent)
    }
  // {
  //   path: 'login',
  //   loadComponent: () => import('./login/login')
  //     .then(m => m.LoginComponent)
  // }
   
];