import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Room } from '../interfaces/room';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomServiceService {
  private apiUrl = `${environment.apiUrl}/api/rooms`;
  private httpClient = inject(HttpClient);

  getRooms(filters?: { minCapacity?: number; startTime?: string; endTime?: string }): Observable<Room[]> {
    let params = new HttpParams();
    if (filters?.minCapacity) params = params.set('minCapacity', filters.minCapacity);
    if (filters?.startTime) params = params.set('startTime', filters.startTime);
    if (filters?.endTime) params = params.set('endTime', filters.endTime);
    return this.httpClient.get<Room[]>(this.apiUrl, { params });
  }

  getRoomById(id: number): Observable<Room> {
    return this.httpClient.get<Room>(`${this.apiUrl}/${id}`);
  }

  searchRooms(keyword: string): Observable<Room[]> {
    return this.httpClient.get<Room[]>(`${this.apiUrl}/search`, { params: { keyword } });
  }

  createRoom(room: Partial<Room>): Observable<Room> {
    return this.httpClient.post<Room>(this.apiUrl, room);
  }

  updateRoom(id: number, room: Partial<Room>): Observable<Room> {
    return this.httpClient.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: number): Observable<string> {
    return this.httpClient.put<string>(`${this.apiUrl}/delete/${id}`, {});
  }

  setAvailability(id: number, openTime: string, closeTime: string): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(`${this.apiUrl}/${id}/availability`, { openTime, closeTime });
  }
}
