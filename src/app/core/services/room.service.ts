import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Room } from '../interfaces/room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:8088/api/rooms';

  private httpClient = inject(HttpClient);


  constructor() { }

  getRooms(): Observable<Room[]> {
    return this.httpClient.get<Room[]>(this.apiUrl);
  }

  getRoom(id: string): Observable<Room>{
    return this.httpClient.get<Room>(this.apiUrl+`/${id}`)
  }

  createRoom(room: Partial<Room>): Observable<Room> {
    return this.httpClient.post<Room>(this.apiUrl, room);
  }

  updateRoom(id: number, room: Partial<Room>): Observable<Room> {
    return this.httpClient.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: number): Observable<any> {
    return this.httpClient.put<any>(`${this.apiUrl}/delete/${id}`, {});
  }
}
