import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthResponse, LoginRequest, User } from '../interfaces/auth';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private readonly API_URL = 'https://meetin-backend.onrender.com/api/auth/login';
  private readonly API_URL = environment.apiUrl + '/api/auth/login';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.loadUserFromStorage();

   }

  login(loginReq: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}`, loginReq).pipe(
      tap(response => this.handleAuthSuccess(response)
    ));
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    this.router.navigate(['/auth']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem('accessToken')
     if (token && this.isTokenExpired(token)) {
      console.log('⚠️ Token expired');
      this.logout();
      return null;
    }
    return token;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      const isExpired = expirationDate < new Date();

      if (isExpired) {
        console.log('⚠️ Token expired at:', expirationDate);
      }

      return isExpired;
    } catch (e) {
      console.error('❌ Error checking token expiration', e);
      return true;
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    // Store token in localStorage (persists across browser sessions)
    console.log('Auth response:', response);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    localStorage.setItem('accessToken', response.token);
  }

   private loadUserFromStorage(): void {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('currentUser');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing stored user', e);
        this.logout(); // Clear invalid data
      }
    }
  }

}
