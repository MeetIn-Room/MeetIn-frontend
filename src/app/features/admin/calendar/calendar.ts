import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';
import { BookingService } from '../../../core/services/booking.service';
import { RoomServiceService } from '../../../core/services/room.service';
import { FrontendBooking, BookingMapper } from '../../../core/services/booking-mapper';
import { FrontendRoom, RoomMapper } from '../../../core/services/room-mapper';
import { Booking } from '../../../core/interfaces/booking';
import { Room } from '../../../core/interfaces/room';

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  bookings: FrontendBooking[];
}

interface WeekDay {
  date: Date;
  dayName: string;
  bookings: FrontendBooking[];
}

@Component({
  selector: 'app-room-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit {
  // Calendar state
  currentDate: Date = new Date();
  currentView: 'month' | 'week' | 'day' = 'month';
  selectedDate: Date = new Date();
  
  // Data
  bookings: FrontendBooking[] = [];
  rooms: FrontendRoom[] = [];
  filteredBookings: FrontendBooking[] = [];
  
  // Filter
  selectedRoom: string = 'all';
  
  // Modal
  showBookingModal: boolean = false;
  selectedBooking: FrontendBooking | null = null;
  
  // Constants
  weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  hours: number[] = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
  
  // Computed properties
  get currentMonthName(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }
  
  get currentYear(): number {
    return this.currentDate.getFullYear();
  }
  
  get selectedDayName(): string {
    return this.selectedDate.toLocaleString('default', { weekday: 'long' });
  }
  
  get selectedDayDate(): string {
    return this.selectedDate.toLocaleDateString('default', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  get monthDays(): CalendarDay[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday of the week containing first day
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // End on Saturday of the week containing last day
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const date = new Date(currentDate);
      const inCurrentMonth = date.getMonth() === month;
      
      // Get bookings for this day
      const dateStr = date.toISOString().split('T')[0];
      const dayBookings = this.filteredBookings.filter(booking => 
        booking.date === dateStr
      );
      
      days.push({
        date: new Date(date),
        inCurrentMonth,
        bookings: dayBookings.slice(0, 3) // Show only first 3 in month view
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }
  
  get weekDays(): WeekDay[] {
    const days: WeekDay[] = [];
    const startOfWeek = new Date(this.selectedDate);
    
    // Adjust to start on Sunday
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayBookings = this.filteredBookings.filter(booking => 
        booking.date === dateStr
      );
      
      days.push({
        date: new Date(date),
        dayName: date.toLocaleString('default', { weekday: 'short' }),
        bookings: dayBookings
      });
    }
    
    return days;
  }

  constructor(
    private bookingService: BookingService,
    private roomService: RoomServiceService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    // Load rooms
    this.roomService.getRooms().subscribe({
      next: (backendRooms: Room[]) => {
        this.rooms = RoomMapper.toFrontendArray(backendRooms);
        this.loadBookings();
      },
      error: (error: any) => {
        console.error('Error loading rooms:', error);
      }
    });
  }

  loadBookings(): void {
    this.bookingService.getBookings().subscribe({
      next: (backendBookings: Booking[]) => {
        this.bookings = BookingMapper.toFrontendArray(backendBookings);
        this.filteredBookings = [...this.bookings];
        
        // Update room names in bookings
        this.bookings.forEach(booking => {
          const room = this.rooms.find(r => r.name === booking.roomName);
          if (room) {
            booking.roomName = room.name;
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading bookings:', error);
      }
    });
  }

  // Navigation
  previousMonth(): void {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate = newDate;
  }

  nextMonth(): void {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate = newDate;
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
  }

  changeView(): void {
    // Reset to current date when switching views
    if (this.currentView === 'day') {
      this.selectedDate = new Date();
    }
  }

  // Filtering
  filterByRoom(): void {
    if (this.selectedRoom === 'all') {
      this.filteredBookings = [...this.bookings];
    } else {
      const room = this.rooms.find(r => r.id === this.selectedRoom);
      if (room) {
        this.filteredBookings = this.bookings.filter(booking => 
          booking.roomName === room.name
        );
      }
    }
  }

  // Day selection
  selectDay(day: CalendarDay): void {
    this.selectedDate = day.date;
    if (this.currentView === 'month') {
      this.currentView = 'day';
    }
  }

  // Booking utilities
  getBookingsForDay(date: Date): FrontendBooking[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.filteredBookings.filter(booking => booking.date === dateStr);
  }

  getBookingsForHour(date: Date, hour: number): FrontendBooking[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.filteredBookings.filter(booking => {
      if (booking.date !== dateStr) return false;
      
      const startHour = this.getHourFromTime(booking.startTime);
      const endHour = this.getHourFromTime(booking.endTime);
      
      return startHour <= hour && endHour > hour;
    });
  }

  getHourFromTime(timeStr: string): number {
    const [hours] = timeStr.split(':').map(Number);
    return hours;
  }

  getEventHeight(booking: FrontendBooking): number {
    const startHour = this.getHourFromTime(booking.startTime);
    const endHour = this.getHourFromTime(booking.endTime);
    const duration = endHour - startHour;
    return Math.min(duration * 100, 100); // Each hour = 100% height
  }

  getEventTop(booking: FrontendBooking): number {
    const startHour = this.getHourFromTime(booking.startTime);
    const startMinutes = this.getMinutesFromTime(booking.startTime);
    return (startHour - 8) * 60 + startMinutes; // 8 AM is start
  }

  getMinutesFromTime(timeStr: string): number {
    const [, minutes] = timeStr.split(':').map(Number);
    return minutes || 0;
  }

  // Styling helpers
  getBookingColor(booking: FrontendBooking): string {
    const room = this.rooms.find(r => r.name === booking.roomName);
    if (!room) return this.getRoomColor('default');
    
    const color = this.getRoomColor(room.id);
    return color.replace(')', ', 0.8)').replace('rgb', 'rgba');
  }

  getRoomColor(roomId: string): string {
    const colors = [
      '#FF6B35', '#FF8C42', '#E2725B', '#B7410E',
      '#4F46E5', '#059669', '#7C3AED', '#DC2626',
      '#EA580C', '#3B82F6', '#10B981', '#8B5CF6'
    ];
    
    if (roomId === 'default') return '#64748b';
    
    const index = roomId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Confirmed': 'confirmed-badge',
      'Pending': 'pending-badge',
      'Completed': 'completed-badge',
      'Cancelled': 'cancelled-badge'
    };
    return classes[status] || 'default-badge';
  }

  // Date/time formatting
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Modal actions
  openBookingDetails(booking: FrontendBooking, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedBooking = booking;
    this.showBookingModal = true;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedBooking = null;
  }

  createBooking(date: Date, hour: number): void {
    console.log(`Create booking for ${date.toDateString()} at ${hour}:00`);
    // Navigate to booking creation page or open modal
    alert(`Create booking for ${date.toLocaleDateString()} at ${hour}:00`);
  }

  cancelBooking(booking: FrontendBooking): void {
    if (confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
      this.bookingService.cancel(booking.id).subscribe({
        next: () => {
          booking.status = 'Cancelled';
          this.closeBookingModal();
          this.showNotification(`Booking ${booking.id} has been cancelled`);
        },
        error: (error: any) => {
          console.error('Error cancelling booking:', error);
          this.showNotification('Error cancelling booking.');
        }
      });
    }
  }

  // Utility
  showNotification(message: string): void {
    // You can implement a proper notification service
    console.log(message);
    alert(message);
  }

  // Keyboard shortcuts
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showBookingModal) {
      this.closeBookingModal();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (this.currentView === 'month') this.previousMonth();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (this.currentView === 'month') this.nextMonth();
    } else if (event.key === 't') {
      event.preventDefault();
      this.goToToday();
    }
  }
}