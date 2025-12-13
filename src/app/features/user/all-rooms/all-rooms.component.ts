import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../../core/interfaces/room';
import { RoomCardComponent } from '../../../shared/components/room-card/room-card.component';
import { RoomDetailsComponent } from '../../../shared/components/room-details/room-details.component';
import { BookingService } from '../../../core/services/booking.service';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { RoomBookingCalendarComponent } from '../../../shared/components/room-booking-calendar/room-booking-calendar.component';
import { Booking } from '../../../core/interfaces/booking';
import { RoomServiceService } from '../../../core/services/room.service';
import { User } from '../../../core/interfaces/auth';

@Component({
  selector: 'app-all-rooms',
  standalone: true,
  imports: [CommonModule, RoomCardComponent, RoomDetailsComponent, NavbarComponent, RoomBookingCalendarComponent],
  templateUrl: './all-rooms.component.html',
  styleUrls: ['./all-rooms.component.scss']
})
export class AllRoomsComponent {

  private readonly roomService = inject(RoomServiceService)

  rooms: Room[] = [];

  selectedRoom: Room | null = null;
  showBookModal = false;
  showDetails = false;
  currentDate: Date = new Date();
  currentUser!: User

  constructor(private bookingService: BookingService) {}

  ngOnInit(){
    this.roomService.getRooms().subscribe({
      next: (response) => {
        console.log(response)
        this.rooms = response.filter((room) => room.active)
        console.log(this.rooms)
        this.currentUser = JSON.parse(localStorage.getItem("currentUser")!)
      },
      error: (err) => alert(err)
    })
  }

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
