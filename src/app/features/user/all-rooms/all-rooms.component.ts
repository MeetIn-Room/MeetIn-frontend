import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../../core/interfaces/room';
import { RoomCardComponent } from '../../../shared/components/room-card/room-card.component';
import { RoomDetailsComponent } from '../../../shared/components/room-details/room-details.component';
import { BookingService } from '../../../core/services/booking.service';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { RoomBookingCalendarComponent } from '../../../shared/components/room-booking-calendar/room-booking-calendar.component';
import { Booking } from '../../../core/interfaces/booking';

@Component({
  selector: 'app-all-rooms',
  standalone: true,
  imports: [CommonModule, RoomCardComponent, RoomDetailsComponent, NavbarComponent, RoomBookingCalendarComponent],
  templateUrl: './all-rooms.component.html',
  styleUrls: ['./all-rooms.component.scss']
})
export class AllRoomsComponent {
  rooms: Room[] = [
    // {
    //   id: 'r-1', name: 'Conference Room A', capacity: 8, openTime: 8, closeTime: 18, amenities: ['Projector', 'Whiteboard'], description: 'Big room',
    //   isActive: false
    // },
    // {
    //   id: 'r-2', name: 'Focus Room 2', capacity: 4, openTime: 9, closeTime: 17, amenities: ['Monitor'], description: 'Small focus room',
    //   isActive: false
    // }
  ];

  selectedRoom: Room | null = null;
  showBookModal = false;
  showDetails = false;
  currentDate: Date = new Date();

  constructor(private bookingService: BookingService) {}

  openBook(room: Room) { this.selectedRoom = room; this.showBookModal = true;
    console.log('Opening booking modal for room:', room);
   }
  closeBook() { this.showBookModal = false; this.selectedRoom = null; }

  openDetails(room: Room) { this.selectedRoom = room; this.showDetails = true; }
  closeDetails() { this.showDetails = false; this.selectedRoom = null; }

   onBookingCreated(booking: Booking) {
    console.log('New booking created:', booking);
    // Handle the booking (e.g., send to backend)
  }
}
