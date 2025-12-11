import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
export class RoomBookingCalendarComponent implements OnInit {
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
    if (this.room) {
      this.generateTimeSlots();
    }
  }

  ngOnChanges(): void {
    if (this.room) {
      this.generateTimeSlots();
    }
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    const openTime = this.room.openTime.getHours() + this.room.openTime.getMinutes()/60;
    const closeTime = this.room.closeTime.getHours() + this.room.closeTime.getMinutes()/60;

    for (let time = openTime; time < closeTime; time += 0.5) {
      const slot: TimeSlot = {
        time: time,
        displayTime: this.formatTime(time),
        isBooked: this.isSlotBooked(time),
        isSelected: false,
        booking: this.getBookingForSlot(time)
      };
      this.timeSlots.push(slot);
    }
  }

  formatTime(time: number): string {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    
    const displayHours = hours > 12 ? hours : (hours === 0 ? 12 : hours);
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  }

  isSlotBooked(time: number): boolean {
    return this.bookings.some(booking =>
      this.isSameDate(booking.date, this.selectedDate) &&
      time >= booking.startTime.getHours() + booking.startTime.getMinutes()/60 &&
      time < booking.endTime.getHours() + booking.endTime.getMinutes()/60
    );
  }

  getBookingForSlot(time: number): Booking | undefined {
    return this.bookings.find(booking =>
      this.isSameDate(booking.date, this.selectedDate) &&
      time >= booking.startTime.getHours() + booking.startTime.getMinutes()/60 &&
      time < booking.endTime.getHours() + booking.endTime.getMinutes()/60
    );
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
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

    const minIndex = Math.min(startIndex, currentIndex);
    const maxIndex = Math.max(startIndex, currentIndex);

    this.selectedSlots = [];
    for (let i = minIndex; i <= maxIndex; i++) {
      if (!this.timeSlots[i].isBooked) {
        this.timeSlots[i].isSelected = true;
        this.selectedSlots.push(this.timeSlots[i]);
      } else {
        break;
      }
    }
  }

  onSlotMouseUp(): void {
    this.isSelecting = false;

    if (this.selectedSlots.length > 0) {
      this.showBookingForm = true;
    }
  }

  confirmBooking(): void {
    if (this.selectedSlots.length === 0 || !this.bookingTitle.trim()) {
      alert('Please provide a title for the booking');
      return;
    }

    const startTime = Math.min(...this.selectedSlots.map(s => s.time));
    const endTime = Math.max(...this.selectedSlots.map(s => s.time)) + 1;

    const newBooking: Booking = {
      id: Date.now().toString(),
      room: this.room,
      date: new Date(this.selectedDate),
      startTime: new Date(this.selectedDate.setHours(Math.floor(startTime), (startTime % 1) * 60)),
      endTime: new Date(this.selectedDate.setHours(Math.floor(endTime), (endTime % 1) * 60)),
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

  getRandomColor(): string {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  isFirstSlotOfBooking(slot: TimeSlot): boolean {
    if (!slot.booking) return false;
    return slot.time === slot.booking.startTime.getHours() + slot.booking.startTime.getMinutes()/60;
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  timeStringtoNumber(t: string): number{
    if (!t) return 0;
    const splitted = t.split(':') //e.g 10:30 -> 10 + 30/60 = 10.5
    return parseFloat(splitted[0]) + (parseFloat(splitted[1])/60)
  }

  numberToTimeString(t: number): string {
    return t.toString().split('.')[0].padStart(2, '0') + ':' + `${parseFloat('0.' + t.toString().split('.')[1]) * 60}`.padStart(2, '0');
  }

  
}
