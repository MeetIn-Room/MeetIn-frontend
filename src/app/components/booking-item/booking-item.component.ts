import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

export interface Booking {
  id: string;
  roomName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  [key: string]: any;
}

@Component({
  selector: 'app-booking-item',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './booking-item.component.html',
  styleUrls: ['./booking-item.component.scss']
})
export class BookingItemComponent {
  @Input() booking!: Booking;
  @Output() cancelBooking = new EventEmitter<string>();

  showDetails = false;

  emitCancel() {
    if (this.booking && this.booking.id) {
      this.cancelBooking.emit(this.booking.id);
    }
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}
