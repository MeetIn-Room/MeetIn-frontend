import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Booking } from '../interfaces/booking';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl + '/api/bookings';

  private httpClient = inject(HttpClient);
  private _bookings = new BehaviorSubject<Booking[]>([]);

constructor() {
    // initialize with empty or sample data if needed

  }

  getBoookings(): Observable<Booking[]>{
    return this.httpClient.get<Booking[]>(`${this.apiUrl}`)
  }
  // $2a$12$VNRXuazv6HqgUG.OiZy89usWBtVlVIpGCNZwkY9vYJ9zWFffiAoBi

  create(booking: Booking) {
    // this._bookings.next(next);
    // this.saveToStorage(next);
  }
// postgresql://alex:VUbKHdvaSEQaRcUCWCt95qpIP4TBqaTe@dpg-d4gvvs7diees73b7pcvg-a.frankfurt-postgres.render.com/ninjadb
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
