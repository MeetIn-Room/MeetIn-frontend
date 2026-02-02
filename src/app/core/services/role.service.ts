import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, RoleCreateDTO, RoleUpdateDTO } from '../interfaces/role';

/**
 * Service for managing roles via backend API
 * All methods require ADMIN role
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/api/roles`;

  constructor(private http: HttpClient) {}

  /**
   * Get all roles in the system
   * @returns Observable of Role array
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  /**
   * Get a role by its ID
   * @param id Role ID
   * @returns Observable of Role
   */
  getRoleById(id: string | number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new custom role
   * @param roleData Role creation data
   * @returns Observable of created Role
   */
  createRole(roleData: RoleCreateDTO): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, roleData);
  }

  /**
   * Update an existing role
   * @param id Role ID
   * @param roleData Role update data
   * @returns Observable of updated Role
   */
  updateRole(id: string | number, roleData: RoleUpdateDTO): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, roleData);
  }

  /**
   * Delete a role
   * Cannot delete system roles or roles with assigned users
   * @param id Role ID
   * @returns Observable of void
   */
  deleteRole(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all system roles (protected from deletion)
   * @returns Observable of Role array
   */
  getSystemRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/system`);
  }

  /**
   * Get all custom roles (non-system)
   * @returns Observable of Role array
   */
  getCustomRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/custom`);
  }

  /**
   * Search roles by keyword
   * @param keyword Search term
   * @returns Observable of matching Role array
   */
  searchRoles(keyword: string): Observable<Role[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Role[]>(`${this.apiUrl}/search`, { params });
  }
}
