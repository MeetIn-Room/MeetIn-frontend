import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BookingItemComponent } from '../../components/booking-item/booking-item.component';
import { Booking } from '../../interfaces/booking';
import { CommonModule } from '@angular/common';
import { WeeklyCalendarComponent } from '../../components/weekly-calendar/weekly-calendar.component';
import { BookingService } from '../../services/booking.service';
import { NewBookingComponent } from '../../components/new-booking/new-booking.component';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, BookingItemComponent, CommonModule, WeeklyCalendarComponent, NewBookingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  showCalendar = false;

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  bookings: Booking[] = [
    {
      id: 'bkg-001',
      room: {
        name: 'Conference Room A', amenities: [], capacity: 0,
        id: '',
        openTime: 8,
        closeTime: 17
      },
      startTime: 9,
      endTime: 10.5,
      date: new Date(),
      title: 'Scrum Meeting',
      description: 'Daily team sync-up',
    },
    {
      id: 'bkg-002',
      room: {
        name: 'Focus Room 2', amenities: [], capacity: 0,
        id: '',
        openTime: 8,
        closeTime: 17
      },
      startTime: 11,
      endTime: 14,
      date: new Date(),
      title: 'Project Work',
      description: 'Working on project tasks',
    }
  ];

  showNewBookingModal = false;

  private bookingService = inject(BookingService);

  ngOnInit(): void {
    // If service has no bookings, seed with existing sample set
    const snap = this.bookingService.getSnapshot();
    if (!snap || snap.length === 0) {
      this.bookingService.create(this.bookings[0]);
      this.bookingService.create(this.bookings[1]);
    }

    // subscribe to service updates
    this.bookingService.bookings$.subscribe(list => this.bookings = list);
  }

  onCancelBooking(id: string) {
    this.bookingService.remove(id);
  }

  onUpdateBooking(updated: Booking) {
    this.bookingService.update(updated);
  }

  openNewBookingModal() { this.showNewBookingModal = true; }
  closeNewBookingModal() { this.showNewBookingModal = false; }

  onNewCreated(b: Booking) {
    this.showNewBookingModal = false;
    // booking already added by service; if you need extra handling, do it here
  }

  onNewCancelled() { this.showNewBookingModal = false; }
}
