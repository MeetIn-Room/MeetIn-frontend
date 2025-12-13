import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';
import { UserServiceService } from '../../../core/services/user-service.service';
import { BookingService } from '../../../core/services/booking.service';
import { RoomServiceService } from '../../../core/services/room.service';
import { Booking } from '../../../core/interfaces/booking';
import { forkJoin } from 'rxjs';

interface Stat {
  title: string;
  value: string;
  icon: string;
  color: string;
  gradient: string[];
}

interface DisplayBooking {
  id: string;
  date: string;
  user: string;
  room: string;
  duration: string;
  total: string;
}

interface WeeklyData {
  day: string;
  bookings: number;
}

@Component({
  selector: 'app-booking-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './booking-dashboard.html',
  styleUrls: ['./booking-dashboard.css'],
})
export class BookingDashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserServiceService,
    private bookingService: BookingService,
    private roomService: RoomServiceService
  ) {}

  // Raw data from API
  private allBookings: Booking[] = [];

  ngOnInit() {
    this.initializeDates();
    this.checkScreenSize();
    this.loadDashboardData();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  // Header filter properties
  startDate: Date = new Date();
  endDate: Date = new Date();
  showDatePicker: boolean = false;
  datePickerType: 'start' | 'end' = 'start';

  quickPeriods = [
    { label: '1W', days: 7, active: false },
    { label: '1M', days: 30, active: true },
    { label: '3M', days: 90, active: false },
    { label: '6M', days: 180, active: false },
    { label: '1Y', days: 365, active: false },
  ];

  // Responsive state
  isMobile = false;

  stats: Stat[] = [];

  recentBookings: DisplayBooking[] = [];

  weeklyData: WeeklyData[] = [
    { day: 'Mon', bookings: 0 },
    { day: 'Tue', bookings: 0 },
    { day: 'Wed', bookings: 0 },
    { day: 'Thu', bookings: 0 },
    { day: 'Fri', bookings: 0 },
    { day: 'Sat', bookings: 0 },
    { day: 'Sun', bookings: 0 },
  ];

  monthlyUtil: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Monthly occupancy data calculated from bookings
  monthlyOccupancy: number[] = new Array(12).fill(0);

  private loadDashboardData(): void {
    forkJoin({
      users: this.userService.getAllUsers(),
      bookings: this.bookingService.getBoookings(),
      rooms: this.roomService.getRooms()
    }).subscribe({
      next: ({ users, bookings, rooms }) => {
        this.allBookings = bookings;
        const activeBookings = bookings.filter(b => b.isActive ?? (b as any).active ?? true);

        // Calculate occupancy rate (active bookings / total possible slots)
        const occupancyRate = this.calculateOccupancyRate(activeBookings, rooms.length);

        this.stats = [
          {
            title: 'Total Bookings',
            value: activeBookings.length.toString(),
            icon: 'calendar',
            color: '#FF6B35',
            gradient: ['#FF6B35', '#FF8C42'],
          },
          {
            title: 'Available Rooms',
            value: rooms.filter(r => r.active).length.toString(),
            icon: 'door-open',
            color: '#FF8C42',
            gradient: ['#FF8C42', '#FFA62E'],
          },
          {
            title: 'Occupancy Rate',
            value: `${occupancyRate}%`,
            icon: 'trending-up',
            color: '#B7410E',
            gradient: ['#B7410E', '#D86F39'],
          },
          {
            title: 'Active Users',
            value: users.filter(u => u.active).length.toString(),
            icon: 'users',
            color: '#E2725B',
            gradient: ['#E2725B', '#FF8C42'],
          },
        ];

        // Process recent bookings for display
        this.recentBookings = this.processRecentBookings(activeBookings);

        // Calculate weekly analytics
        this.calculateWeeklyData(activeBookings);

        // Calculate monthly occupancy
        this.calculateMonthlyOccupancy(activeBookings);
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
      }
    });
  }

  private calculateOccupancyRate(bookings: Booking[], roomCount: number): number {
    if (roomCount === 0) return 0;

    // Calculate based on bookings in the selected date range
    const filteredBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate >= this.startDate && bookingDate <= this.endDate;
    });

    // Assume 8 working hours per day, calculate days in range
    const daysDiff = Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalPossibleSlots = roomCount * daysDiff * 8; // 8 hours per room per day

    // Calculate total booked hours
    let totalBookedHours = 0;
    filteredBookings.forEach(b => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalBookedHours += hours;
    });

    return Math.min(Math.round((totalBookedHours / totalPossibleSlots) * 100), 100);
  }

  private processRecentBookings(bookings: Booking[]): DisplayBooking[] {
    return bookings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(b => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        return {
          id: `#BK${b.id}`,
          date: new Date(b.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          user: b.title || 'Unknown',
          room: b.room?.name || 'Unknown Room',
          duration: `${durationHours.toFixed(1)} hours`,
          total: `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        };
      });
  }

  private calculateWeeklyData(bookings: Booking[]): void {
    // Reset weekly data
    this.weeklyData = [
      { day: 'Mon', bookings: 0 },
      { day: 'Tue', bookings: 0 },
      { day: 'Wed', bookings: 0 },
      { day: 'Thu', bookings: 0 },
      { day: 'Fri', bookings: 0 },
      { day: 'Sat', bookings: 0 },
      { day: 'Sun', bookings: 0 },
    ];

    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Filter bookings within date range and count by day of week
    bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= this.startDate && bookingDate <= this.endDate;
      })
      .forEach(b => {
        const dayOfWeek = new Date(b.date).getDay();
        const dayName = dayMap[dayOfWeek];
        const dayData = this.weeklyData.find(d => d.day === dayName);
        if (dayData) {
          dayData.bookings++;
        }
      });
  }

  private calculateMonthlyOccupancy(bookings: Booking[]): void {
    this.monthlyOccupancy = new Array(12).fill(0);
    const monthCounts = new Array(12).fill(0);

    bookings.forEach(b => {
      const month = new Date(b.date).getMonth();
      monthCounts[month]++;
    });

    // Normalize to percentage (assuming max 100 bookings per month = 100%)
    const maxBookings = Math.max(...monthCounts, 1);
    this.monthlyOccupancy = monthCounts.map(count => Math.round((count / maxBookings) * 100));
  }

  private initializeDates(): void {
    const today = new Date();
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  // Chart calculation methods
  get maxBookings(): number {
    return Math.max(...this.weeklyData.map((d) => d.bookings), 1);
  }

  getBarHeight(bookings: number): string {
    return `${(bookings / this.maxBookings) * 100}%`;
  }

  getUtilBarHeight(index: number, isOccupied: boolean): string {
    if (isOccupied) {
      return `${this.monthlyOccupancy[index] || 0}%`;
    }
    return `${100 - (this.monthlyOccupancy[index] || 0)}%`;
  }

  isMaxBooking(bookings: number): boolean {
    return bookings === this.maxBookings && bookings > 0;
  }

  getIconGradient(gradient: string[]): string {
    return `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;
  }

  getProgressWidth(stat: Stat): number {
    const value = parseInt(stat.value.replace(/[^\d]/g, ''));
    return Math.min(value, 100);
  }

  // Analytics helpers
  get peakDay(): string {
    const max = Math.max(...this.weeklyData.map(d => d.bookings));
    return this.weeklyData.find(d => d.bookings === max)?.day || 'N/A';
  }

  get avgBookings(): number {
    const total = this.weeklyData.reduce((sum, d) => sum + d.bookings, 0);
    return Math.round(total / 7);
  }

  get currentOccupancyRate(): number {
    const currentMonth = new Date().getMonth();
    return this.monthlyOccupancy[currentMonth] || 0;
  }

  // Header filter methods
  openDatePicker(type: 'start' | 'end'): void {
    this.datePickerType = type;
    this.showDatePicker = true;
  }

  closeDatePicker(): void {
    this.showDatePicker = false;
  }

  // ADD THIS MISSING METHOD
  selectToday(): void {
    const today = new Date();
    this.onDateSelect(today);
  }

  // Alternative: Modify the existing method
  onDateSelect(date?: Date): void {
    const selectedDate = date || new Date(); // Use provided date or today
    if (this.datePickerType === 'start') {
      this.startDate = selectedDate;
    } else {
      this.endDate = selectedDate;
    }
    this.closeDatePicker();
    this.updateDataByDateRange();
  }

  selectQuickPeriod(period: any): void {
    // Deactivate all periods
    this.quickPeriods.forEach((p) => (p.active = false));

    // Activate selected period
    period.active = true;

    // Calculate dates based on period
    const today = new Date();
    this.endDate = new Date(today);
    this.startDate = new Date(today);
    this.startDate.setDate(today.getDate() - period.days);

    this.updateDataByDateRange();
  }

  updateDataByDateRange(): void {
    // Recalculate analytics based on the new date range using cached data
    if (this.allBookings.length > 0) {
      const activeBookings = this.allBookings.filter(b => b.isActive ?? (b as any).active ?? true);
      this.calculateWeeklyData(activeBookings);
      this.recentBookings = this.processRecentBookings(activeBookings);

      // Update occupancy rate stat
      this.roomService.getRooms().subscribe(rooms => {
        const occupancyRate = this.calculateOccupancyRate(activeBookings, rooms.length);
        const occupancyStat = this.stats.find(s => s.title === 'Occupancy Rate');
        if (occupancyStat) {
          occupancyStat.value = `${occupancyRate}%`;
        }
      });
    }
  }

  // Responsive helper
  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  // Keyboard navigation
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showDatePicker) {
      this.closeDatePicker();
    }
  }
}
