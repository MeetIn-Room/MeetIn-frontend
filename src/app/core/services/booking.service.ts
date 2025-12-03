import { BehaviorSubject, Observable } from 'rxjs';
import { Booking } from '../interfaces/booking';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'https://api.example.com/bookings';

  private httpClient = inject(HttpClient);
  private _bookings = new BehaviorSubject<Booking[]>([]);

constructor() {
    // initialize with empty or sample data if needed
    const stored = this.loadFromStorage();
    this._bookings.next(stored ?? []);
  }

  getUserBoookings(userId: number) {
    return this.httpClient.get(`${this.apiUrl}?userId=${userId}`);
  }

  get bookings$(): Observable<Booking[]> {
    return this._bookings.asObservable();
  }

  getSnapshot(): Booking[] {
    return this._bookings.getValue();
  }

  create(booking: Booking) {
    const next = [booking, ...this.getSnapshot()];
    this._bookings.next(next);
    this.saveToStorage(next);
  }

  update(updated: Booking) {
    const list = this.getSnapshot().map(b => (b.id === updated.id ? updated : b));
    this._bookings.next(list);
    this.saveToStorage(list);
  }

  remove(id: string) {
    const list = this.getSnapshot().filter(b => b.id !== id);
    this._bookings.next(list);
    this.saveToStorage(list);
  }

  private storageKey = 'meetin.bookings.v1';

  private saveToStorage(list: Booking[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch { }
  }

  private loadFromStorage(): Booking[] | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

}
