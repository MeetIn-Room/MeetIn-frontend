import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Booking } from '../interfaces/booking';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl + '/api/bookings'

  private httpClient = inject(HttpClient);

constructor() {
    // initialize with empty or sample data if needed

  }

  getBoookings(): Observable<Booking[]>{
    return this.httpClient.get<Booking[]>(`${this.apiUrl}`)
  }

  getBookingsByRoom(roomId: string): Observable<Booking[]>{
    return this.httpClient.get<Booking[]>(`${this.apiUrl}/room?roomId=${roomId}`)
  }




  create(booking: Booking) {
    console.log('Creating booking:', booking);
    return this.httpClient.post<Booking>(`${this.apiUrl}`, booking).pipe(
      tap({
        next: (createdBooking) => { 
          console.log('Booking created:', createdBooking);
        },
        error: (error) => {
          console.error('Error creating booking:', error);
        }
      })
    ).subscribe();
  }

  update(updated: Booking) {
    // const list = this.getSnapshot().map(b => (b.id === updated.id ? updated : b));
    // this._bookings.next(list);
    // this.saveToStorage(list);
  }

  remove(id: string) {
    // const list = this.getSnapshot().filter(b => b.id !== id);
    // this._bookings.next(list);
    // this.saveToStorage(list);
  }



}
