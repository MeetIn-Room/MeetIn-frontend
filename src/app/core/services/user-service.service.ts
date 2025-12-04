import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserCreateDTO, UserUpdateDTO } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserServiceService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/users`;

  constructor() {}

  /**
   * Get all users (Admin only)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new user (Admin only)
   */
  createUser(dto: UserCreateDTO): Observable<User> {
    return this.http.post<User>(this.API_URL, dto).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing user
   */
  updateUser(id: number, dto: UserUpdateDTO): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, {...dto, isActive: dto.active}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deactivate a user (Admin only)
   */
  deactivateUser(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.API_URL}/${id}/deactivate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Activate a user (Admin only)
   */
  activateUser(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.API_URL}/${id}/activate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'User not found.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status} ${error.message}`;
      }
    }

    console.error('UserService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
