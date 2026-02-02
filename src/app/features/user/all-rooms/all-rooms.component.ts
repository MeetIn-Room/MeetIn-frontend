import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room, canRoleBookRoom } from '../../../core/interfaces/room';
import { RoomCardComponent } from '../../../shared/components/room-card/room-card.component';
import { RoomDetailsComponent } from '../../../shared/components/room-details/room-details.component';
import { BookingService } from '../../../core/services/booking.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { RoomBookingCalendarComponent } from '../../../shared/components/room-booking-calendar/room-booking-calendar.component';
import { Booking } from '../../../core/interfaces/booking';
import { RoomServiceService } from '../../../core/services/room.service';
import { User, getAuthUserRoleName } from '../../../core/interfaces/auth';

@Component({
  selector: 'app-all-rooms',
  standalone: true,
  imports: [
    CommonModule,
    RoomCardComponent,
    RoomDetailsComponent,
    NavbarComponent,
    RoomBookingCalendarComponent,
  ],
  templateUrl: './all-rooms.component.html',
  styleUrls: ['./all-rooms.component.scss'],
})
export class AllRoomsComponent {
  private readonly roomService = inject(RoomServiceService);

  rooms: Room[] = [];
  _rooms = signal<Room[]>([]);

  selected!: Room;
  showBookModal = false;
  showDetails = false;
  currentDate: Date = new Date();
  currentUser: User = JSON.parse(localStorage.getItem('currentUser') || '{}');

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.roomService.getRooms().subscribe({
      next: (response) => {
        const userRoleName = getAuthUserRoleName(this.currentUser);
        const isAdmin = userRoleName === 'ADMIN';
        this.rooms = response.filter((room) => {
          const isActive = room.isActive ?? room.active ?? true;
          return isActive && canRoleBookRoom(room, userRoleName, isAdmin);
        });
        this._rooms.set(this.rooms);
      },
      error: (err) => alert(err),
    });
  }

  searchRoomName(ev: Event){
    const target = ev.target as HTMLInputElement
    if(target.value === "") {
      this._rooms.set(this.rooms);
      return;
    }
    const query = target.value.toLowerCase();
    this._rooms.set(this.rooms.filter((r) => r.name.toLowerCase().includes(query)));
  }

  searchRoomOpen(ev: Event){
    const target = ev.target as HTMLInputElement
    if(target.value === "") {
      this._rooms.set(this.rooms);
      return;
    }
    const query = target.value.toString();
    console.log(query)
    this._rooms.set(this.rooms.filter((r) => r.openTime.split(':')[0] +":"+ r.openTime.split(':')[1] === query));
  }

  searchRoomClose(ev: Event){
    const target = ev.target as HTMLInputElement
    if(target.value === "") {
      this._rooms.set(this.rooms);
      return;
    }
    const query = target.value.toString();
    console.log(query)
    this._rooms.set(this.rooms.filter((r) => r.closeTime.split(':')[0] +":"+ r.closeTime.split(':')[1] === query));
  }

  searchCapacity(ev: Event){
    const target = ev.target as HTMLInputElement
    if(target.value === "") {
      this._rooms.set(this.rooms);
      return;
    }
    const query = parseInt(target.value);
    console.log(query)
    this._rooms.set(this.rooms.filter((r) => r.capacity >= query));
  }

  openBook(room: Room) {
    this.selected = room;
    this.showBookModal = true;
    console.log('selected ', this.selected);
  }
  closeBook() {
    this.showBookModal = false;
  }

  openDetails(room: Room) {
    this.selected = room;
    this.showDetails = true;
  }
  closeDetails() {
    this.showDetails = false;
  }

  onBookingCreated(booking: Booking) {
    console.log('New booking created:', booking);
    this.bookingService.createBooking(booking).subscribe({
      next: (response) => {
        alert('Booking created successfully!');
        location.reload();
      },
      error: (err) => {
        alert('Error creating booking: ' + err);
        console.error('Booking creation error:', err);
      },
    });
  }
}
