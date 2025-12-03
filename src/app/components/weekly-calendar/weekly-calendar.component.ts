import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../interfaces/booking';

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [CommonModule],
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

  bookings: Booking[] = []; // Will be populated from your API

  ngOnInit(): void {
    this.updateWeekDays();
    this.loadBookings();
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
    return date1.toDateString() === date2.toDateString();
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  calculatePosition(startTime: number, endTime: number): { top: string; height: string } {
    const startOfDay = 6; // 6 AM
    const endOfDay = 20; // 8 PM
    const totalMinutes = (20 - 6);

    const top = ((startTime - startOfDay) *60) *(80/60);
    const height = ((endTime - startTime)*60 ) * (80/60);
    console.log(top, height);
    return { top: `${top}px`, height: `${height}px` };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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

  loadBookings(): void {
    // Replace with your actual API call
    // this.bookingService.getUserBookings().subscribe(bookings => {
    //   this.bookings = bookings;
    // });

    // Sample data for testing
    this.bookings = [
      {
        id: '1',
        room: {
          name: 'Conference Room A', amenities: ['Projector', 'Whiteboard'], capacity: 10,
          id: '',
          openTime: 8,
          closeTime: 17
        },
        date: new Date(2025, 11, 2),
        startTime: 9,
        endTime: 10.5,
        title: 'Team Standup',
        color: 'booking-blue',
        description: ''
      },
      {
        id: '2',
        room: {
          name: 'Meeting Room', amenities: ['Projector'], capacity: 15,
          id: '',
          openTime: 8,
          closeTime: 17
        },
        date: new Date(2025, 11, 2),
        startTime: 14,
        endTime: 15,
        title: 'Client Call',
        color: 'booking-purple',
        description: ''
      }
    ];
  }

  onBookingClick(booking: Booking): void {
    // Handle booking click (e.g., show details modal)
    console.log('Booking clicked:', booking);
  }

  onTimeSlotClick(day: Date, timeSlot: string): void {
    // Handle time slot click (e.g., create new booking)
    console.log('Time slot clicked:', day, timeSlot);
  }

  numberToTimeString(time: number): string {
    return `${time.toString().split('.')[0]}`.padStart(2, '0') + ':' + `${parseFloat('0.' + time.toString().split('.')[1]) * 60}`.padStart(2, '0');   
  }
}