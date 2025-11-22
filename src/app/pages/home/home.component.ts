import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BookingItemComponent, Booking } from '../../components/booking-item/booking-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, BookingItemComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  bookings: Booking[] = [
    {
      id: 'bkg-001',
      roomName: 'Conference Room A',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600 * 1000).toISOString(),
      organizer: 'Alice'
    },
    {
      id: 'bkg-002',
      roomName: 'Focus Room 2',
      startTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      endTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      organizer: 'Bob'
    }
  ];

  onCancelBooking(id: string) {
    this.bookings = this.bookings.filter(b => b.id !== id);
    // In a real app you'd call a service to cancel on the server
  }
}
