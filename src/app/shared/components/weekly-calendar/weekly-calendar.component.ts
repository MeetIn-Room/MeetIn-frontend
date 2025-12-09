import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../core/interfaces/booking';
import { BookingDetailsComponent } from '../booking-details/booking-details.component';

export function timeToHours(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours+ minutes/60;
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
  @Output() bookingUpdate = new EventEmitter<Booking>()

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  showBookingDetails = false
  selectedBooking!: Booking;
  colorValue = 400;

  onBookingUpdate(b: Booking){
    this.bookingUpdate.emit(b);
  }


  ngOnInit(): void {
    this.updateWeekDays();
    console.log(this.bookings)
  }

  toggleDetails(b: Booking){
    console.log('toggling details: ', b)
    this.selectedBooking = b;
    this.showBookingDetails = !this.showBookingDetails
    // this.dialog.nativeElement.showPopover()
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

  randomColor(): string{
    if(this.colorValue === 1000){
      this.colorValue = 400;
    }
    let color =  `var(--primary-${this.colorValue})`
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

  isSameDay(date1: Date, date2: Date): boolean {
    const [year, month, date] = date1.toString().split('-')
    console.log(Number(year) === date2.getFullYear()  && Number(month) === date2.getMonth()+1 && Number(date) === date2.getDate())
    return Number(year) === date2.getFullYear()  && Number(month) === date2.getMonth()+1 && Number(date) === date2.getDate();
    // return date1.toLocaleDateString() === date2.toLocaleDateString()
  }

  isToday(date: Date): boolean {
    console.log(date, new Date(), this.isSameDay(date, new Date()))
    return date.toDateString() === new Date().toDateString();
    // return this.isSameDay(date, new Date());
  }

  calculatePosition(startTime: Date, endTime: Date): { top: string; height: string } {
    const startOfDay = 6; // 6 AM
    const endOfDay = 20; // 8 PM
    const totalMinutes = (endOfDay - startOfDay);

    const top = ((timeToHours(startTime.toString().split('T')[1]) - startOfDay) *60) *(80/60);
    const height = ((timeToHours(endTime.toString().split('T')[1]) - timeToHours(startTime.toString().split('T')[1]))*60 ) * (80/60);
    console.log(top, height);
    return { top: `${top}px`, height: `${height}px` };
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getMonthYear(): string {
    return this.weekDays[0]?.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }) || '';
  }

  onTimeSlotClick(day: Date, timeSlot: string): void {
    // Handle time slot click (e.g., create new booking)
    console.log('Time slot clicked:', day, timeSlot);
  }

  numberToTimeString(time: number): string {
    return `${time.toString().split('.')[0]}`.padStart(2, '0') + ':' + `${parseFloat('0.' + time.toString().split('.')[1]) * 60}`.padStart(2, '0');
  }

  timeStringtoNumber(t: string): number{
    if (!t) return 0;
    const splitted = t.split(':') //e.g 10:30 -> 10 + 30/60 = 10.5
    return parseFloat(splitted[0]) + (parseFloat(splitted[1])/60)
  }


}
