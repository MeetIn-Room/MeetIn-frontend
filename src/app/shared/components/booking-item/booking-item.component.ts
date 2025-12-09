import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingDetailsComponent } from '../booking-details/booking-details.component';
import { Booking } from '../../../core/interfaces/booking';

export function formatTime(t: Date): string{
  let time = t.toString().split("T")[1]
  return time.split(':')[0] +':' + time.split(':')[1]
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
    this.startTime = formatTime(this.booking.startTime)
    this.endTime = formatTime(this.booking.endTime)
  }


}
