import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../core/interfaces/booking';
import { BookingDetailsComponent } from '../booking-details/booking-details.component';

export function timeToHours(time: string | Date): number {
  if (typeof time === 'string') {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  } else {
    return time.getHours() + time.getMinutes() / 60;
  }
}

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [
    CommonModule,
    BookingDetailsComponent,
  ],
  templateUrl: './weekly-calendar.component.html',
  styleUrls: ['./weekly-calendar.component.scss']
})
export class WeeklyCalendarComponent implements OnInit {
  currentWeek: Date = new Date();
  weekDays: Date[] = [];
  dayNames: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  timeSlots: string[] = [
    '06:00','07:00','08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00','18:00','19:00','20:00'
  ];

  @Input({required: true}) bookings: Booking[] = [];
  @Output() bookingUpdate = new EventEmitter<Booking>();

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  showBookingDetails = false;
  selectedBooking!: Booking;
  colorValue = 400;

  onBookingUpdate(b: Booking){
    this.bookingUpdate.emit(b);
  }

  ngOnInit(): void {
    this.updateWeekDays();
  }

  toggleDetails(b: Booking){
    this.selectedBooking = b;
    this.showBookingDetails = !this.showBookingDetails;
  }

  updateWeekDays(): void {
    this.weekDays = this.getWeekDays(this.currentWeek);
  }

  getWeekDays(date: Date): Date[] {
    const week: Date[] = [];
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);

    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(current);
      weekDay.setDate(diff + i);
      week.push(weekDay);
    }
    return week;
  }

  randomColor(): string {
    if(this.colorValue === 1000) this.colorValue = 400;
    const color = `var(--primary-${this.colorValue})`;
    this.colorValue += 100;
    return color;
  }

  navigateWeek(direction: 'next' | 'prev'): void {
    const newDate = new Date(this.currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    this.currentWeek = newDate;
    this.updateWeekDays();
  }

  goToToday(): void {
    this.currentWeek = new Date();
    this.updateWeekDays();
  }

  getBookingsForDay(day: Date): Booking[] {
    return this.bookings.filter(booking =>
      this.isSameDay(booking.date, day)
    );
  }

  isSameDay(date1: string | Date, date2: Date): boolean {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    return d1.getFullYear() === date2.getFullYear() &&
      d1.getMonth() === date2.getMonth() &&
      d1.getDate() === date2.getDate();
  }

  isToday(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  }

  calculatePosition(startTime: string | Date, endTime: string | Date): { top: string; height: string } {
    const startOfDay = 6; // 6 AM
    const endOfDay = 20; // 8 PM

    const top = (timeToHours(startTime) - startOfDay) * 80;
    const height = (timeToHours(endTime) - timeToHours(startTime)) * 80;

    return { top: `${top}px`, height: `${height}px` };
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getMonthYear(): string {
    return this.weekDays[0]?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || '';
  }

  onTimeSlotClick(day: Date, timeSlot: string): void {
    console.log('Time slot clicked:', day, timeSlot);
  }

  numberToTimeString(time: number): string {
    const hours = Math.floor(time).toString().padStart(2, '0');
    const minutes = Math.round((time - Math.floor(time)) * 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  timeStringtoNumber(t: string | Date): number {
    if (!t) return 0;
    if (typeof t === 'string') {
      const [h, m] = t.split(':').map(Number);
      return h + m / 60;
    } else {
      return t.getHours() + t.getMinutes() / 60;
    }
  }
}
