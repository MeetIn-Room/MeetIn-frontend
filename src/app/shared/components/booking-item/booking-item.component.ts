import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingDetailsComponent } from '../booking-details/booking-details.component';
import { Booking } from '../../../core/interfaces/booking';

@Component({
  selector: 'app-booking-item',
  standalone: true,
  imports: [CommonModule, BookingDetailsComponent],
  templateUrl: './booking-item.component.html',
  styleUrls: ['./booking-item.component.scss']
})
export class BookingItemComponent {
  @Input() booking!: Booking;
  @Output() cancelBooking = new EventEmitter<string>();
  @Output() updateBooking = new EventEmitter<Booking>();

  showDetails = false;

  emitCancel() {
    if (this.booking && this.booking.id) {
      this.cancelBooking.emit(this.booking.id);
    }
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  onUpdate(updated: Booking) {
    // propagate updated booking to parent
    this.updateBooking.emit(updated);
    this.showDetails = false;
  }

  numberToTimeString(time: Date): string {
    return `${time.toString().split('.')[0]}`.padStart(2, '0') + ':' + `${parseFloat('0.' + time.toString().split('.')[1]) * 60}`.padStart(2, '0');
  }
}
