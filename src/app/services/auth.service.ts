import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthResponse, LoginRequest } from '../interfaces/auth';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private readonly API_URL = 'https://meetin-backend.onrender.com/api/auth/login';
  private readonly API_URL = 'https://localhost:8088/api/auth/login';
  private http = inject(HttpClient);
  private router = inject(Router);
    
  constructor() {
  
   }

  login(loginReq: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}`, loginReq).pipe(
      tap(response => this.handleAuthSuccess(response)
    ));
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/auth']);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private handleAuthSuccess(response: AuthResponse): void {
    // Store token in localStorage (persists across browser sessions)
    localStorage.setItem('accessToken', response.accesstoken);    
  }


}
