import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { BookingItemComponent } from '../../../shared/components/booking-item/booking-item.component';
import { Booking } from '../../../core/interfaces/booking';
import { CommonModule } from '@angular/common';
import { WeeklyCalendarComponent } from '../../../shared/components/weekly-calendar/weekly-calendar.component';
import { BookingService } from '../../../core/services/booking.service';
import { NewBookingComponent } from '../../../shared/components/new-booking/new-booking.component';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../../core/interfaces/auth';
import { Router } from '@angular/router';
import { BookingDetailsComponent } from '../../../shared/components/booking-details/booking-details.component';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    BookingItemComponent,
    CommonModule,
    WeeklyCalendarComponent,
    NewBookingComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  showCalendar = false;
  showNewBookingModal = false;

  currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser') || '{}'));

  router = inject(Router)

  constructor(){
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  // bookings: Booking[] = [
  //   {
  //     id: 'bkg-001',
  //     room: {
  //       name: 'Conference Room A', amenities: [], capacity: 0,
  //       id: '',
  //       openTime: 8,
  //       closeTime: 17,
  //       isActive: true
  //     },
  //     userId: this.currentUserSubject.value.id,
  //     startTime: 9,
  //     endTime: 10.5,
  //     date: new Date(),
  //     title: 'Scrum Meeting',
  //     description: 'Daily team sync-up',
  //   },
  //   {
  //     id: 'bkg-002',
  //     room: {
  //       name: 'Focus Room 2', amenities: [], capacity: 0,
  //       id: '',
  //       openTime: 8,
  //       closeTime: 17,
  //       isActive: true
  //     },
  //     userId: this.currentUserSubject.value.id,
  //     startTime: 11,
  //     endTime: 14,
  //     date: new Date(),
  //     title: 'Project Work',
  //     description: 'Working on project tasks',
  //   }
  // ];

  bookings: Booking[] = [];


  private bookingService = inject(BookingService);

  ngOnInit(): void {
  
    // subscribe to service updates
    this.bookingService.getBoookings().subscribe({
      next: (response) => {
        this.bookings = response.filter((book) => book.userId === this.currentUserSubject.getValue().id.toString())
        console.log("Bookings " + this.bookings.length, this.bookings);

      },
      error: (err) => { alert("Error fetching bookings "+ err); console.error('error', err); }
    })
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
