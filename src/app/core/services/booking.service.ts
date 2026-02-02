import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../interfaces/booking';
import { tap } from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/api/bookings`;

  private httpClient = inject(HttpClient);
  private _bookings = new BehaviorSubject<Booking[]>([]);

  bookings$ = this._bookings.asObservable();

  constructor() { }

  // Get all bookings
  getBookings(): Observable<Booking[]> {
    return this.httpClient.get<Booking[]>(this.apiUrl);
  }

  getBoookings(): Observable<Booking[]>{
    return this.httpClient.get<Booking[]>(this.apiUrl)
  }

  getBookingsByRoom(roomId: string): Observable<Booking[]> {
    return this.httpClient.get<Booking[]>(
      `${this.apiUrl}/room?roomId=${roomId}`
    );
  }

  create(booking: Booking) {
    console.log('Creating booking:', booking);
    return this.httpClient
      .post<Booking>(`${this.apiUrl}`, booking)
      .pipe(
        tap({
          next: (createdBooking) => {
            console.log('Booking created:', createdBooking);
          },
          error: (error) => {
            console.error('Error creating booking:', error);
          },
        })
      )
      .subscribe();
  }

  // Get booking by ID
  getBookingById(id: number): Observable<Booking> {
    return this.httpClient.get<Booking>(`${this.apiUrl}/${id}`);
  }

  // Create new booking
  createBooking(booking: Partial<Booking>): Observable<Booking> {
    return this.httpClient.post<Booking>(this.apiUrl, booking);
  }

  // Update booking
  updateBooking(id: number, booking: Partial<Booking>): Observable<Booking> {
    return this.httpClient.put<Booking>(`${this.apiUrl}/${id}`, booking);
  }

  // Delete booking (soft delete - sets isActive to false)
  deleteBooking(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Get bookings by user
  getBookingsByUser(userId: number): Observable<Booking[]> {
    return this.httpClient.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Get bookings by date
  getBookingsByDate(date: string): Observable<Booking[]> {
    return this.httpClient.get<Booking[]>(`${this.apiUrl}/date/${date}`);
  }

  // Get active bookings only
  getActiveBookings(): Observable<Booking[]> {
    return this.httpClient.get<Booking[]>(`${this.apiUrl}/active`);
  }

  cancel(id: string){
    return this.httpClient.put(`${this.apiUrl}`+`/cancel/${id}`,{})
  }

  // Cancel booking using backend's cancel endpoint
  cancelBooking(id: number): Observable<any> {
    return this.httpClient.put<any>(`${this.apiUrl}/cancel/${id}`, {});
  }



}
