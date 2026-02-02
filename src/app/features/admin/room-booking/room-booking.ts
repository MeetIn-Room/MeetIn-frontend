import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';
import { BookingService } from '../../../core/services/booking.service';
import { FrontendBooking, BookingMapper } from '../../../core/services/booking-mapper';
import { Booking } from '../../../core/interfaces/booking';

interface BookingStat {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  lastWeek: string;
  icon: string;
  trend: number[];
  color: string;
  gradient: string[];
}

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './room-booking.html',
  styleUrls: ['./room-booking.css']
})
export class BookingManagementComponent implements OnInit {

  searchQuery: string = '';
  currentFilter: string = 'all';
  sortField: string = 'date';
  sortDirection: string = 'desc';
  currentPage: number = 1;
  pageSize: number = 10;
  totalBookings: number = 0;
  allSelected: boolean = false;
  selectedBookingsCount: number = 0;
  isLoading: boolean = false;

  // Modal states
  showBookingDetailsModal: boolean = false;
  selectedBooking: FrontendBooking | null = null;

  // Stats based on what backend actually supports:
  // Backend has isActive (true/false) - no Pending/Confirmed/Completed statuses
  // We calculate: Total Bookings, Active Today, Bookings This Week
  bookingStats: BookingStat[] = [
    {
      title: 'Total Bookings',
      value: '0',
      icon: 'calendar',
      isPositive: true,
      change: '+0%',
      lastWeek: '0',
      trend: [65, 70, 75, 80, 82, 85, 89],
      color: '#FF6B35',
      gradient: ['#FF6B35', '#FF8C42']
    },
    {
      title: 'Active Today',
      value: '0',
      icon: 'check-circle',
      isPositive: true,
      change: '+0%',
      lastWeek: '0',
      trend: [35, 38, 40, 42, 44, 46, 47],
      color: '#FF8C42',
      gradient: ['#FF8C42', '#FFA62E']
    },
    {
      title: 'This Week',
      value: '0',
      icon: 'clock',
      isPositive: false,
      change: '0%',
      lastWeek: '0',
      trend: [16, 15, 14, 13, 13, 12, 12],
      color: '#E2725B',
      gradient: ['#E2725B', '#FF8C42']
    }
    // Avg. Duration stat commented out - requires accurate time data from backend
    // {
    //   title: 'Avg. Duration',
    //   value: '0h',
    //   icon: 'trending-up',
    //   isPositive: true,
    //   change: '0%',
    //   lastWeek: '0h',
    //   trend: [8, 7, 6, 5, 5, 4.5, 4.2],
    //   color: '#B7410E',
    //   gradient: ['#B7410E', '#D86F39']
    // }
  ];

  bookings: FrontendBooking[] = [];
  allBookings: FrontendBooking[] = []; // Keep a copy for filtering
  filteredBookings: FrontendBooking[] = [];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookingService.getBookings().subscribe({
      next: (backendBookings: Booking[]) => {
        this.bookings = BookingMapper.toFrontendArray(backendBookings);
        this.allBookings = [...this.bookings];
        this.totalBookings = this.bookings.length;
        this.updateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading bookings:', error);
        this.showNotification('Error loading bookings. Please try again.');
        this.isLoading = false;
      }
    });
  }

  updateStats(): void {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // Convert to Monday-based: Monday = 0, Sunday = 6
    const dayOfWeek = today.getDay();
    const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Calculate start of current week (Monday)
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - mondayBasedDay);
    startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfThisWeekStr = startOfThisWeek.toISOString().split('T')[0];

    // Calculate start of last week (Monday of previous week)
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
    const startOfLastWeekStr = startOfLastWeek.toISOString().split('T')[0];

    // Calculate end of last week (Sunday of previous week - 6 days after Monday)
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
    const endOfLastWeekStr = endOfLastWeek.toISOString().split('T')[0];

    // Filter only active bookings (backend uses isActive for soft delete)
    const activeBookings = this.bookings.filter(b => b.status === 'Confirmed');

    // Total Active Bookings (all time)
    const totalBookings = activeBookings.length;

    // Bookings this week (from Monday to today)
    const bookingsThisWeek = activeBookings.filter(b =>
      b.date >= startOfThisWeekStr && b.date <= todayStr
    ).length;

    // Bookings last week (Monday to Sunday - 7 days)
    const bookingsLastWeek = activeBookings.filter(b =>
      b.date >= startOfLastWeekStr && b.date <= endOfLastWeekStr
    ).length;

    // Active bookings today
    const bookingsToday = activeBookings.filter(b => b.date === todayStr).length;

    // Same day last week for comparison
    const sameDayLastWeek = new Date(today);
    sameDayLastWeek.setDate(today.getDate() - 7);
    const sameDayLastWeekStr = sameDayLastWeek.toISOString().split('T')[0];
    const bookingsSameDayLastWeek = activeBookings.filter(b => b.date === sameDayLastWeekStr).length;

    // Average duration calculation commented out - not properly integrated with backend data
    // let totalDurationHours = 0;
    // let lastWeekTotalDuration = 0;
    // let thisWeekCount = 0;
    // let lastWeekCount = 0;

    // activeBookings.forEach(b => {
    //   // Parse duration string like "1.5 hours", "2 hours", or "30 minutes"
    //   const durationMatch = b.duration.match(/(\d+\.?\d*)/);
    //   let duration = durationMatch ? parseFloat(durationMatch[1]) : 1;

    //   // If duration is in minutes, convert to hours
    //   if (b.duration.toLowerCase().includes('minute')) {
    //     duration = duration / 60;
    //   }

    //   // Skip if duration is NaN or invalid
    //   if (isNaN(duration)) {
    //     duration = 1; // Default to 1 hour
    //   }

    //   if (b.date >= startOfThisWeekStr && b.date <= todayStr) {
    //     totalDurationHours += duration;
    //     thisWeekCount++;
    //   }
    //   if (b.date >= startOfLastWeekStr && b.date <= endOfLastWeekStr) {
    //     lastWeekTotalDuration += duration;
    //     lastWeekCount++;
    //   }
    // });

    // const avgDurationThisWeek = thisWeekCount > 0 ? totalDurationHours / thisWeekCount : 0;
    // const avgDurationLastWeek = lastWeekCount > 0 ? lastWeekTotalDuration / lastWeekCount : 0;

    // Update Total Bookings stat
    this.bookingStats[0].value = totalBookings.toString();
    this.bookingStats[0].lastWeek = bookingsLastWeek.toString();
    this.bookingStats[0].change = this.calculateChangePercent(bookingsLastWeek, bookingsThisWeek);
    this.bookingStats[0].isPositive = bookingsThisWeek >= bookingsLastWeek;
    this.bookingStats[0].trend = this.generateTrend(bookingsLastWeek, bookingsThisWeek);

    // Update Active Today stat
    this.bookingStats[1].value = bookingsToday.toString();
    this.bookingStats[1].lastWeek = bookingsSameDayLastWeek.toString();
    this.bookingStats[1].change = this.calculateChangePercent(bookingsSameDayLastWeek, bookingsToday);
    this.bookingStats[1].isPositive = bookingsToday >= bookingsSameDayLastWeek;
    this.bookingStats[1].trend = this.generateTrend(bookingsSameDayLastWeek, bookingsToday);

    // Update This Week stat
    this.bookingStats[2].value = bookingsThisWeek.toString();
    this.bookingStats[2].lastWeek = bookingsLastWeek.toString();
    this.bookingStats[2].change = this.calculateChangePercent(bookingsLastWeek, bookingsThisWeek);
    this.bookingStats[2].isPositive = bookingsThisWeek >= bookingsLastWeek;
    this.bookingStats[2].trend = this.generateTrend(bookingsLastWeek, bookingsThisWeek);

    // Average Duration stat commented out - not properly integrated with backend data
    // this.bookingStats[3].value = `${avgDurationThisWeek.toFixed(1)}h`;
    // this.bookingStats[3].lastWeek = `${avgDurationLastWeek.toFixed(1)}h`;
    // this.bookingStats[3].change = this.calculateChangePercent(avgDurationLastWeek, avgDurationThisWeek);
    // this.bookingStats[3].isPositive = true; // Duration is neutral
    // this.bookingStats[3].trend = this.generateTrend(avgDurationLastWeek, avgDurationThisWeek);
  }

  // Calculate percentage change and format it
  calculateChangePercent(oldValue: number, newValue: number): string {
    if (oldValue === 0) {
      return newValue > 0 ? '+100%' : '0%';
    }
    const change = ((newValue - oldValue) / oldValue) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  // Generate a simple trend line from old to new value
  generateTrend(oldValue: number, newValue: number): number[] {
    const trend: number[] = [];
    const steps = 7;
    const increment = (newValue - oldValue) / (steps - 1);

    for (let i = 0; i < steps; i++) {
      trend.push(Math.round(oldValue + (increment * i)));
    }

    return trend;
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Filter functionality
  filterBookings(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allBookings];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.userName.toLowerCase().includes(query) ||
        booking.roomName.toLowerCase().includes(query) ||
        booking.purpose.toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    // Note: Backend only supports isActive (true/false), mapped to Confirmed/Cancelled
    // No Pending/Completed status support from backend
    const today = new Date().toISOString().split('T')[0];
    switch (this.currentFilter) {
      case 'today':
        filtered = filtered.filter(booking => booking.date === today);
        break;
      case 'upcoming':
        // Show future active bookings
        filtered = filtered.filter(booking => booking.date >= today && booking.status === 'Confirmed');
        break;
      // Pending filter removed - backend doesn't support approval workflow
      // case 'pending':
      //   filtered = filtered.filter(booking => booking.status === 'Pending');
      //   break;
      // Completed filter removed - backend doesn't track completion
      // case 'completed':
      //   filtered = filtered.filter(booking => booking.status === 'Completed');
      //   break;
      case 'cancelled':
        filtered = filtered.filter(booking => booking.status === 'Cancelled');
        break;
    }

    // Update total before pagination
    this.totalBookings = filtered.length;

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[this.sortField as keyof FrontendBooking];
      let bValue = b[this.sortField as keyof FrontendBooking];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (this.sortField === 'date') {
          return this.sortDirection === 'asc'
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        } else if (this.sortField === 'startTime') {
          return this.sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return this.sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      }
      return 0;
    });

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredBookings = filtered.slice(startIndex, endIndex);
    this.updateSelectedCount();
  }

  // Sorting functionality
  sortBookings(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  // Selection functionality
  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.allSelected = checked;
    this.filteredBookings.forEach(booking => booking.selected = checked);
    this.updateSelectedCount();
  }

  toggleBookingSelection(booking: FrontendBooking): void {
    booking.selected = !booking.selected;
    this.allSelected = this.filteredBookings.every(b => b.selected);
    this.updateSelectedCount();
  }

  updateSelectedCount(): void {
    this.selectedBookingsCount = this.filteredBookings.filter(booking => booking.selected).length;
  }

  // Booking actions
  viewBookingDetails(booking: FrontendBooking): void {
    this.selectedBooking = booking;
    this.showBookingDetailsModal = true;
  }

  closeBookingDetailsModal(): void {
    this.showBookingDetailsModal = false;
    this.selectedBooking = null;
  }

  editBooking(booking: FrontendBooking): void {
    this.showNotification(`Editing booking: ${booking.id}`);
  }

  // Note: Backend only supports isActive (true/false), no status workflow
  // toggleBookingStatus commented out - not supported by backend
  /*
  toggleBookingStatus(booking: FrontendBooking): void {
    const statusFlow: { [key: string]: string } = {
      'Pending': 'Confirmed',
      'Confirmed': 'Completed',
      'Completed': 'Cancelled',
      'Cancelled': 'Pending'
    };

    booking.status = statusFlow[booking.status] || 'Pending';
    booking.updatedAt = new Date().toLocaleString();

    const backendData = BookingMapper.toBackend(booking, '', '');

    this.bookingService.updateBooking(parseInt(booking.id, 10), backendData as any).subscribe({
      next: () => {
        this.showNotification(`Booking ${booking.id} status updated to ${booking.status}`);
        this.updateStats();
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('Error updating booking:', error);
        this.showNotification('Error updating booking status.');
      }
    });
  }

  getStatusToggleTitle(booking: FrontendBooking): string {
    const titles: { [key: string]: string } = {
      'Pending': 'Confirm Booking',
      'Confirmed': 'Mark as Completed',
      'Completed': 'Cancel Booking',
      'Cancelled': 'Reopen Booking'
    };
    return titles[booking.status] || 'Change Status';
  }
  */

  cancelBooking(booking: FrontendBooking): void {
    if (confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
      const bookingId = parseInt(booking.id, 10);

      // Use backend's cancel endpoint (PUT /api/bookings/cancel/{id})
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          booking.status = 'Cancelled';
          this.showNotification(`Booking ${booking.id} has been cancelled`);
          this.closeBookingDetailsModal();
          this.loadBookings(); // Reload to get fresh data
        },
        error: (error: any) => {
          console.error('Error cancelling booking:', error);
          this.showNotification('Error cancelling booking.');
        }
      });
    }
  }

  deleteBooking(booking: FrontendBooking): void {
    if (confirm(`Are you sure you want to delete booking ${booking.id}? This action cannot be undone.`)) {
      const bookingId = parseInt(booking.id, 10);

      this.bookingService.deleteBooking(bookingId).subscribe({
        next: () => {
          const index = this.bookings.findIndex(b => b.id === booking.id);
          if (index > -1) {
            this.bookings.splice(index, 1);
            this.allBookings = [...this.bookings];
            this.updateStats();
            this.applyFilters();
            this.showNotification(`Booking ${booking.id} has been deleted`);
          }
        },
        error: (error: any) => {
          console.error('Error deleting booking:', error);
          this.showNotification('Error deleting booking.');
        }
      });
    }
  }

  // Quick Actions
  createNewBooking(): void {
    this.showNotification('Opening new booking form...');
  }

  viewCalendar(): void {
    this.showNotification('Opening calendar view...');
  }

  exportBookings(): void {
    this.showNotification('Exporting booking data...');
  }

  manageRecurring(): void {
    this.showNotification('Opening recurring bookings manager...');
  }

  openAdvancedFilter(): void {
    this.showNotification('Opening advanced filters...');
  }

  openSortModal(): void {
    this.showNotification('Opening sort options...');
  }

  openBulkActions(): void {
    if (this.selectedBookingsCount > 0) {
      this.showNotification(`Opening bulk actions for ${this.selectedBookingsCount} selected bookings`);
    } else {
      this.showNotification('Please select bookings to perform bulk actions');
    }
  }

  // Utility functions
  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Confirmed': 'bg-green-100',
      'Pending': 'bg-yellow-100',
      'Completed': 'bg-blue-100',
      'Cancelled': 'bg-red-100'
    };
    return classes[status] || 'bg-gray-100';
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Confirmed': 'confirmed-badge',
      'Pending': 'pending-badge',
      'Completed': 'completed-badge',
      'Cancelled': 'cancelled-badge'
    };
    return classes[status] || 'default-badge';
  }

  getUserInitials(userName: string): string {
    return userName.split(' ').map(name => name[0]).join('').toUpperCase();
  }

  getUserAvatarColor(userName: string): string {
    const colors = [
      'linear-gradient(135deg, #FF6B35, #FF8C42)',
      'linear-gradient(135deg, #FF8C42, #FFA62E)',
      'linear-gradient(135deg, #E2725B, #FF8C42)',
      'linear-gradient(135deg, #B7410E, #D86F39)',
      'linear-gradient(135deg, #FF6B6B, #FF8C42)'
    ];
    const index = userName.length % colors.length;
    return colors[index];
  }

  getRoomInitials(roomName: string): string {
    return roomName.split(' ').map(word => word[0]).join('').toUpperCase();
  }

  getRoomColor(roomName: string): string {
    const colors = [
      'linear-gradient(135deg, #4F46E5, #7C73E6)',
      'linear-gradient(135deg, #059669, #10B981)',
      'linear-gradient(135deg, #DC2626, #EF4444)',
      'linear-gradient(135deg, #7C3AED, #8B5CF6)',
      'linear-gradient(135deg, #EA580C, #F97316)'
    ];
    const index = roomName.length % colors.length;
    return colors[index];
  }

  getAttendeeInitials(attendee: string): string {
    return attendee.split(' ').map(name => name[0]).join('').toUpperCase();
  }

  getAttendeeColor(attendee: string): string {
    const colors = ['#FF6B35', '#FF8C42', '#E2725B', '#B7410E', '#4F46E5', '#059669', '#7C3AED'];
    const index = attendee.length % colors.length;
    return colors[index];
  }

  getDayOfWeek(dateString: string): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  }

  // Pagination utilities
  get totalPages(): number {
    return Math.ceil(this.totalBookings / this.pageSize);
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const totalPages = this.totalPages;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (this.currentPage >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.currentPage + 2);
      }
    }

    return pages;
  }

  get showPaginationDots(): boolean {
    return this.totalPages > 5;
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalBookings);
    return `${start}-${end}`;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  // Chart utilities
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

  getProgressWidth(stat: BookingStat): number {
    const current = parseFloat(stat.value.replace(/[^\d.]/g, ''));
    const last = parseFloat(stat.lastWeek.replace(/[^\d.]/g, ''));
    return Math.min((current / (last * 1.5)) * 100, 100);
  }

  // Notification system
  showNotification(message: string): void {
    alert(message);
  }

  // Keyboard shortcuts
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showBookingDetailsModal) {
      this.closeBookingDetailsModal();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }
}
