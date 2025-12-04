import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

    if (token) {
       req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Authorization header added to request');

    } else{
      console.log('⚠️ No token found - request will be sent without auth');
    }
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('🚫 401 Unauthorized - Token invalid or expired');
          authService.logout();
          router.navigate(['/auth']);
        } else if (error.status === 403) {
          console.error('🚫 403 Forbidden - Access denied');
        }
        return throwError(() => error);
      })
    );
};

