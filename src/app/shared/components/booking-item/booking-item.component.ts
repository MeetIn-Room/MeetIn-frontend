import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingDetailsComponent } from '../booking-details/booking-details.component';
import { Booking } from '../../../core/interfaces/booking';

export function formatToStandardTime(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}


@Component({
  selector: 'app-booking-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-item.component.html',
  styleUrls: ['./booking-item.component.scss']
})
export class BookingItemComponent implements OnInit {
  @Input() booking!: Booking;
  @Output() cancelBooking = new EventEmitter<string>();
  @Output() updateBooking = new EventEmitter<Booking>();
  @Output() showDetails = new EventEmitter<Booking>()


  startTime: string = '';
  endTime: string = '';


  emitCancel() {
    if (this.booking && this.booking.id) {
      this.cancelBooking.emit(this.booking.id);
    }
  }

  toggleDetails() {
    this.showDetails.emit(this.booking);
  }

  onUpdate(updated: Booking) {
    // propagate updated booking to parent
    this.updateBooking.emit(updated);
  }

  numberToTimeString(time: Date): string {
    return `${time.toString().split('.')[0]}`.padStart(2, '0') + ':' + `${parseFloat('0.' + time.toString().split('.')[1]) * 60}`.padStart(2, '0');
  }

  ngOnInit(): void {
    this.startTime = formatToStandardTime(this.booking.startTime)
    this.endTime = formatToStandardTime(this.booking.endTime)
  }


}
