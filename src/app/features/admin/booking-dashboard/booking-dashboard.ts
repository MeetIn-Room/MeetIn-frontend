import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';
import { UserServiceService } from '../../../core/services/user-service.service';
import { User } from '../../../core/interfaces/auth';

interface Stat {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  lastMonth: string;
  icon: string;
  trend: number[];
  color: string;
  gradient: string[];
}

interface Booking {
  id: string;
  date: string;
  user: string;
  room: string;
  status: string;
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
    private userService: UserServiceService
  ) {}

  ngOnInit() {
    this.initUsersData();
    this.initializeDates();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  // activeNav: string = 'dashboard';

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

  stats: Stat[] = [
    {
      title: 'Total Bookings',
      value: '1,247',
      icon: 'calendar',
      isPositive: true,
      change: '+12.5%',
      lastMonth: '1,108',
      trend: [12, 18, 15, 22, 25, 28, 24],
      color: '#FF6B35', // Vibrant Orange
      gradient: ['#FF6B35', '#FF8C42'],
    },
    {
      title: 'Available Rooms',
      value: '24',
      icon: 'door-open',
      isPositive: false,
      change: '-2.3%',
      lastMonth: '26',
      trend: [30, 28, 26, 25, 24, 23, 24],
      color: '#FF8C42', // Sunset Orange
      gradient: ['#FF8C42', '#FFA62E'],
    },
    {
      title: 'Occupancy Rate',
      value: '78%',
      icon: 'trending-up',
      isPositive: true,
      change: '+5.2%',
      lastMonth: '72%',
      trend: [65, 68, 72, 75, 76, 77, 78],
      color: '#B7410E', // Rust Orange
      gradient: ['#B7410E', '#D86F39'],
    },
  ];

  recentBookings: Booking[] = [
    {
      id: '#BK8901',
      date: '2 Dec 2026',
      user: 'Alex Nelson Ryan',
      room: 'Conference Room A',
      status: 'Confirmed',
      duration: '2 hours',
      total: '2:00 PM - 4:00 PM',
    },
    {
      id: '#BK8902',
      date: '1 Dec 2026',
      user: 'Weber Kengne',
      room: 'Meeting Room B',
      status: 'Completed',
      duration: '1 hour',
      total: '10:00 AM - 11:00 AM',
    },
    {
      id: '#BK8903',
      date: '1 Dec 2026',
      user: 'Marie Louise',
      room: 'Board Room',
      status: 'Confirmed',
      duration: '3 hours',
      total: '1:00 PM - 4:00 PM',
    },
    {
      id: '#BK8904',
      date: '30 Nov 2026',
      user: 'Ismael Takam',
      room: 'Small Meeting Room',
      status: 'Cancelled',
      duration: '1.5 hours',
      total: '3:00 PM - 4:30 PM',
    },
  ];

  weeklyData: WeeklyData[] = [
    { day: 'Mon', bookings: 12 },
    { day: 'Tue', bookings: 15 },
    { day: 'Wed', bookings: 18 },
    { day: 'Thu', bookings: 14 },
    { day: 'Fri', bookings: 22 },
    { day: 'Sat', bookings: 8 },
    { day: 'Sun', bookings: 5 },
  ];

  monthlyUtil: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
  ];

  private initUsersData(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.stats.push({
          title: 'Active Users',
          value: users.length.toString(),
          icon: 'users',
          isPositive: true,
          change: '+8.1%',
          lastMonth: '826',
          trend: [65, 70, 75, 80, 82, 85, 89],
          color: '#E2725B', // Terracotta Orange
          gradient: ['#E2725B', '#FF8C42'],
        });
      },

      error: (err) => {
        console.log("Error loading users", err);
      }
    });

    this.stats = [...this.stats];
  }

  private initializeDates(): void {
    const today = new Date();
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1); // First day of current month
    this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
  }

  // Chart calculation methods
  get maxBookings(): number {
    return Math.max(...this.weeklyData.map((d) => d.bookings));
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      Confirmed: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
      Pending: 'bg-yellow-100 text-yellow-800',
    };
    return classes[status] || '';
  }

  getBarHeight(bookings: number): string {
    return `${(bookings / this.maxBookings) * 100}%`;
  }

  getUtilBarHeight(index: number, isOccupied: boolean): string {
    const base = isOccupied ? 60 : 30;
    return `${base + Math.random() * 20}%`;
  }

  isMaxBooking(bookings: number): boolean {
    return bookings === this.maxBookings;
  }

  generateSparkline(trend: number[]): string {
    const points = trend.map((value, index) => {
      const x = (index / (trend.length - 1)) * 60;
      const y = 20 - (value / Math.max(...trend)) * 18;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  getIconGradient(gradient: string[]): string {
    return `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;
  }

  getProgressWidth(stat: Stat): number {
    // Calculate progress based on current vs last month
    const current = parseInt(stat.value.replace(/[^\d]/g, ''));
    const last = parseInt(stat.lastMonth.replace(/[^\d]/g, ''));
    return Math.min((current / (last * 1.5)) * 100, 100);
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
    // This method would typically call your API to get data for the selected date range
    console.log(
      'Fetching data for period:',
      this.startDate,
      'to',
      this.endDate
    );

    // In a real application, you would make an API call here
    // For now, we'll just log the action
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
