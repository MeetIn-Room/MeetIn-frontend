import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room } from '../../../core/interfaces/room';
import { Booking } from '../../../core/interfaces/booking';

export interface TimeSlot {
  time: number;
  displayTime: string;
  isBooked: boolean;
  isSelected: boolean;
  booking?: Booking;
}

@Component({
  selector: 'app-room-booking-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-booking-calendar.component.html',
  styleUrls: ['./room-booking-calendar.component.scss']
})
export class RoomBookingCalendarComponent implements OnInit, OnChanges {
  @Input() room!: Room;
  @Input() selectedDate: Date = new Date();
  @Input() bookings: Booking[] = [];
  @Input() isOpen: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() bookingCreated = new EventEmitter<Booking>();

  timeSlots: TimeSlot[] = [];
  selectedSlots: TimeSlot[] = [];
  isSelecting: boolean = false;
  className: string = '';

  // Booking form modal state
  showBookingForm: boolean = false;
  bookingTitle: string = '';
  bookingDescription: string = '';

  ngOnInit(): void {
    if (this.room) this.generateTimeSlots();
  }

  ngOnChanges(): void {
    if (this.room) this.generateTimeSlots();
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    const openTime = this.timeStringToNumber(this.room.openTime);
    const closeTime = this.timeStringToNumber(this.room.closeTime);

    for (let time = openTime; time < closeTime; time += 0.5) {
      const slot: TimeSlot = {
        time: time,
        displayTime: this.formatTime(time),
        isBooked: this.isSlotBooked(time),
        isSelected: false
      };
      this.timeSlots.push(slot);
    }
  }

  formatTime(time: number): string {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  }

  isSlotBooked(time: number): boolean {
    return this.bookings.some(booking =>
      this.isSameDate(booking.date, this.selectedDate) &&
      time >= this.timeStringToNumber(booking.startTime) &&
      time < this.timeStringToNumber(booking.endTime)
    );
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  }

  onSlotMouseDown(slot: TimeSlot): void {
    if (slot.isBooked) return;
    this.isSelecting = true;
    this.selectedSlots = [slot];
    slot.isSelected = true;
  }

  onSlotMouseEnter(slot: TimeSlot): void {
    if (!this.isSelecting || slot.isBooked) return;
    const startSlot = this.selectedSlots[0];
    const startIndex = this.timeSlots.indexOf(startSlot);
    const currentIndex = this.timeSlots.indexOf(slot);

    this.timeSlots.forEach(s => s.isSelected = false);
    this.selectedSlots = [];

    const minIndex = Math.min(startIndex, currentIndex);
    const maxIndex = Math.max(startIndex, currentIndex);

    for (let i = minIndex; i <= maxIndex; i++) {
      if (!this.timeSlots[i].isBooked) {
        this.timeSlots[i].isSelected = true;
        this.selectedSlots.push(this.timeSlots[i]);
      } else break;
    }
  }

  onSlotMouseUp(): void {
    this.isSelecting = false;
    if (this.selectedSlots.length > 0) this.showBookingForm = true;
  }

  confirmBooking(): void {
    if (this.selectedSlots.length === 0 || !this.bookingTitle.trim()) {
      alert('Please provide a title for the booking');
      return;
    }

    const startTimeNum = Math.min(...this.selectedSlots.map(s => s.time));
    const endTimeNum = Math.max(...this.selectedSlots.map(s => s.time)) + 0.5;

    const startDateTime = this.numberToDateTime(this.selectedDate, startTimeNum);
    const endDateTime = this.numberToDateTime(this.selectedDate, endTimeNum);

    const newBooking: Booking = {
      id: Date.now().toString(),
      room: this.room,
      date: new Date(this.selectedDate),
      startTime: startDateTime,
      endTime: endDateTime,
      title: this.bookingTitle,
      description: this.bookingDescription,
      userId: JSON.parse(localStorage.getItem('currentUser')!).id,
      isActive: true
    };

    this.bookingCreated.emit(newBooking);
    this.bookings.push(newBooking);
    this.cancelBookingForm();
    this.generateTimeSlots();
  }

  cancelBookingForm(): void {
    this.showBookingForm = false;
    this.bookingTitle = '';
    this.bookingDescription = '';
    this.selectedSlots.forEach(slot => slot.isSelected = false);
    this.selectedSlots = [];
  }

  timeStringToNumber(t: string | Date): number {
    if (!t) return 0;
    if (typeof t === 'string') {
      const [h, m] = t.split(':').map(Number);
      return h + m / 60;
    } else {
      return t.getHours() + t.getMinutes() / 60;
    }
  }

  numberToTimeString(t: number): string {
    const hours = Math.floor(t).toString().padStart(2, '0');
    const minutes = Math.round((t - Math.floor(t)) * 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  numberToDateTime(date: Date, t: number): string {
    const d = new Date(date);
    d.setHours(Math.floor(t), Math.round((t - Math.floor(t)) * 60), 0, 0);
    return d.toISOString(); // consistent with Booking interface
  }

  isFirstSlotOfBooking(slot: TimeSlot): boolean {
    if (!slot.booking) return false;
    return slot.time === this.timeStringToNumber(slot.booking.startTime);
  }

  changeDate(days: number): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + days);
    this.selectedDate = newDate;
    this.generateTimeSlots();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.generateTimeSlots();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}
