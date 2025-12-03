import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbar/navbar';


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

interface Booking {
  id: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  purpose: string;
  description?: string;
  attendees: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  specialRequirements?: string;
  selected: boolean;
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
  
  // Modal states
  showBookingDetailsModal: boolean = false;
  selectedBooking: Booking | null = null;

  bookingStats: BookingStat[] = [
    {
      title: 'Total Bookings',
      value: '1,247',
      icon: 'calendar',
      isPositive: true,
      change: '+12.5%',
      lastWeek: '1,108',
      trend: [65, 70, 75, 80, 82, 85, 89],
      color: '#FF6B35',
      gradient: ['#FF6B35', '#FF8C42']
    },
    {
      title: 'Confirmed Today',
      value: '47',
      icon: 'check-circle',
      isPositive: true,
      change: '+8.1%',
      lastWeek: '43',
      trend: [35, 38, 40, 42, 44, 46, 47],
      color: '#FF8C42',
      gradient: ['#FF8C42', '#FFA62E']
    },
    {
      title: 'Pending Approval',
      value: '12',
      icon: 'clock',
      isPositive: false,
      change: '-2.3%',
      lastWeek: '14',
      trend: [16, 15, 14, 13, 13, 12, 12],
      color: '#E2725B',
      gradient: ['#E2725B', '#FF8C42']
    },
    {
      title: 'Cancellation Rate',
      value: '4.2%',
      icon: 'alert-circle',
      isPositive: true,
      change: '-1.8%',
      lastWeek: '6.0%',
      trend: [8, 7, 6, 5, 5, 4.5, 4.2],
      color: '#B7410E',
      gradient: ['#B7410E', '#D86F39']
    }
  ];

  bookings: Booking[] = [
    {
      id: 'BK001',
      userName: 'Alex Nelson Ryan',
      userEmail: 'alex.nelson@company.com',
      userDepartment: 'IT',
      roomName: 'Conference Room A',
      date: '2024-12-15',
      startTime: '09:00',
      endTime: '11:00',
      duration: '2 hours',
      purpose: 'Project Kickoff Meeting',
      description: 'Quarterly project planning and team alignment session',
      attendees: ['Sarah Johnson', 'Mike Chen', 'Lisa Wang', 'David Brown'],
      status: 'Confirmed',
      createdAt: '2024-12-10 14:30',
      updatedAt: '2024-12-10 14:30',
      specialRequirements: 'Projector and video conferencing setup required',
      selected: false
    },
    {
      id: 'BK002',
      userName: 'Weber Kengne',
      userEmail: 'weber.kengne@company.com',
      userDepartment: 'Engineering',
      roomName: 'Meeting Room B',
      date: '2024-12-15',
      startTime: '14:00',
      endTime: '15:30',
      duration: '1.5 hours',
      purpose: 'Sprint Planning',
      description: 'Weekly sprint planning and task allocation',
      attendees: ['Emma Davis', 'Tom Wilson', 'Rachel Green'],
      status: 'Confirmed',
      createdAt: '2024-12-11 09:15',
      updatedAt: '2024-12-11 09:15',
      selected: false
    },
    {
      id: 'BK003',
      userName: 'Marie Louise',
      userEmail: 'marie.louise@company.com',
      userDepartment: 'HR',
      roomName: 'Board Room',
      date: '2024-12-16',
      startTime: '10:00',
      endTime: '12:00',
      duration: '2 hours',
      purpose: 'Candidate Interviews',
      description: 'Final round interviews for senior positions',
      attendees: ['John Smith', 'Patricia Lee'],
      status: 'Pending',
      createdAt: '2024-12-12 11:45',
      updatedAt: '2024-12-12 11:45',
      selected: false
    },
    {
      id: 'BK004',
      userName: 'Ismael Takam',
      userEmail: 'ismael.takam@company.com',
      userDepartment: 'Marketing',
      roomName: 'Creative Space',
      date: '2024-12-16',
      startTime: '13:00',
      endTime: '14:00',
      duration: '1 hour',
      purpose: 'Campaign Brainstorming',
      description: 'New product launch campaign ideation session',
      attendees: ['Sophia Martinez', 'James Wilson', 'Olivia Chen'],
      status: 'Confirmed',
      createdAt: '2024-12-13 16:20',
      updatedAt: '2024-12-13 16:20',
      selected: false
    },
    {
      id: 'BK005',
      userName: 'Gift Anderson',
      userEmail: 'gift.anderson@company.com',
      userDepartment: 'Finance',
      roomName: 'Executive Suite A',
      date: '2024-12-17',
      startTime: '11:00',
      endTime: '12:30',
      duration: '1.5 hours',
      purpose: 'Budget Review',
      description: 'Q4 budget performance review and planning',
      attendees: ['Robert Taylor', 'Jennifer Kim'],
      status: 'Confirmed',
      createdAt: '2024-12-14 10:30',
      updatedAt: '2024-12-14 10:30',
      selected: false
    },
    {
      id: 'BK006',
      userName: 'Prince Raoul',
      userEmail: 'prince.raoul@company.com',
      userDepartment: 'Operations',
      roomName: 'Training Room 1',
      date: '2024-12-17',
      startTime: '15:00',
      endTime: '17:00',
      duration: '2 hours',
      purpose: 'Team Training',
      description: 'New software system training session',
      attendees: ['Daniel White', 'Amanda Scott', 'Kevin Lee', 'Michelle Garcia'],
      status: 'Completed',
      createdAt: '2024-12-10 15:45',
      updatedAt: '2024-12-17 17:00',
      selected: false
    },
    {
      id: 'BK007',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@company.com',
      userDepartment: 'Sales',
      roomName: 'Conference Room B',
      date: '2024-12-18',
      startTime: '09:30',
      endTime: '10:30',
      duration: '1 hour',
      purpose: 'Client Presentation',
      description: 'Quarterly business review with key client',
      attendees: ['Client Team'],
      status: 'Pending',
      createdAt: '2024-12-15 08:20',
      updatedAt: '2024-12-15 08:20',
      selected: false
    },
    {
      id: 'BK008',
      userName: 'Michael Chen',
      userEmail: 'michael.chen@company.com',
      userDepartment: 'Engineering',
      roomName: 'Huddle Room A',
      date: '2024-12-18',
      startTime: '14:00',
      endTime: '14:30',
      duration: '30 minutes',
      purpose: 'Quick Sync',
      description: 'Daily team standup and progress update',
      attendees: ['Team Members'],
      status: 'Confirmed',
      createdAt: '2024-12-17 14:10',
      updatedAt: '2024-12-17 14:10',
      selected: false
    },
    {
      id: 'BK009',
      userName: 'Emma Davis',
      userEmail: 'emma.davis@company.com',
      userDepartment: 'Product',
      roomName: 'Meeting Room B',
      date: '2024-12-19',
      startTime: '11:00',
      endTime: '12:00',
      duration: '1 hour',
      purpose: 'Product Review',
      description: 'New feature specification and requirements gathering',
      attendees: ['Design Team', 'Engineering Leads'],
      status: 'Cancelled',
      createdAt: '2024-12-16 16:45',
      updatedAt: '2024-12-18 09:30',
      selected: false
    },
    {
      id: 'BK010',
      userName: 'Tom Wilson',
      userEmail: 'tom.wilson@company.com',
      userDepartment: 'Customer Support',
      roomName: 'Training Room 2',
      date: '2024-12-19',
      startTime: '13:00',
      endTime: '16:00',
      duration: '3 hours',
      purpose: 'Workshop',
      description: 'Customer service excellence training workshop',
      attendees: ['Support Team', 'Trainers'],
      status: 'Confirmed',
      createdAt: '2024-12-12 11:20',
      updatedAt: '2024-12-12 11:20',
      selected: false
    }
  ];

  filteredBookings: Booking[] = [];

  constructor(private fb: FormBuilder,) {}

  ngOnInit() {
    this.filteredBookings = [...this.bookings];
    this.totalBookings = this.bookings.length;
    this.updateSelectedCount();
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
    let filtered = this.bookings;

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
    const today = new Date().toISOString().split('T')[0];
    switch (this.currentFilter) {
      case 'today':
        filtered = filtered.filter(booking => booking.date === today);
        break;
      case 'upcoming':
        filtered = filtered.filter(booking => booking.date >= today && (booking.status === 'Confirmed' || booking.status === 'Pending'));
        break;
      case 'pending':
        filtered = filtered.filter(booking => booking.status === 'Pending');
        break;
      case 'completed':
        filtered = filtered.filter(booking => booking.status === 'Completed');
        break;
      case 'cancelled':
        filtered = filtered.filter(booking => booking.status === 'Cancelled');
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[this.sortField as keyof Booking];
      let bValue = b[this.sortField as keyof Booking];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (this.sortField === 'date') {
          // Special handling for date sorting
          return this.sortDirection === 'asc' 
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        } else if (this.sortField === 'startTime') {
          // Special handling for time sorting
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
    this.totalBookings = filtered.length;
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

  toggleBookingSelection(booking: Booking): void {
    booking.selected = !booking.selected;
    this.allSelected = this.filteredBookings.every(b => b.selected);
    this.updateSelectedCount();
  }

  updateSelectedCount(): void {
    this.selectedBookingsCount = this.filteredBookings.filter(booking => booking.selected).length;
  }

  // Booking actions
  viewBookingDetails(booking: Booking): void {
    this.selectedBooking = booking;
    this.showBookingDetailsModal = true;
  }

  closeBookingDetailsModal(): void {
    this.showBookingDetailsModal = false;
    this.selectedBooking = null;
  }

  editBooking(booking: Booking): void {
    this.showNotification(`Editing booking: ${booking.id}`);
    // Implement edit functionality
  }

  toggleBookingStatus(booking: Booking): void {
    const statusFlow: { [key: string]: string } = {
      'Pending': 'Confirmed',
      'Confirmed': 'Completed',
      'Completed': 'Cancelled',
      'Cancelled': 'Pending'
    };
    
    booking.status = statusFlow[booking.status] || 'Pending';
    booking.updatedAt = new Date().toLocaleString();
    this.showNotification(`Booking ${booking.id} status updated to ${booking.status}`);
    this.applyFilters();
  }

  getStatusToggleTitle(booking: Booking): string {
    const titles: { [key: string]: string } = {
      'Pending': 'Confirm Booking',
      'Confirmed': 'Mark as Completed',
      'Completed': 'Cancel Booking',
      'Cancelled': 'Reopen Booking'
    };
    return titles[booking.status] || 'Change Status';
  }

  cancelBooking(booking: Booking): void {
    if (confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
      booking.status = 'Cancelled';
      booking.updatedAt = new Date().toLocaleString();
      this.showNotification(`Booking ${booking.id} has been cancelled`);
      this.closeBookingDetailsModal();
      this.applyFilters();
    }
  }

  deleteBooking(booking: Booking): void {
    if (confirm(`Are you sure you want to delete booking ${booking.id}? This action cannot be undone.`)) {
      const index = this.bookings.findIndex(b => b.id === booking.id);
      if (index > -1) {
        this.bookings.splice(index, 1);
        this.applyFilters();
        this.showNotification(`Booking ${booking.id} has been deleted`);
      }
    }
  }

  // Quick Actions
  createNewBooking(): void {
    this.showNotification('Opening new booking form...');
    // Implement new booking creation
  }

  viewCalendar(): void {
    this.showNotification('Opening calendar view...');
    // Implement calendar view
  }

  exportBookings(): void {
    this.showNotification('Exporting booking data...');
    // Implement export functionality
  }

  manageRecurring(): void {
    this.showNotification('Opening recurring bookings manager...');
    // Implement recurring bookings management
  }

  openAdvancedFilter(): void {
    this.showNotification('Opening advanced filters...');
    // Implement advanced filtering
  }

  openSortModal(): void {
    this.showNotification('Opening sort options...');
    // Implement sort modal
  }

  openBulkActions(): void {
    if (this.selectedBookingsCount > 0) {
      this.showNotification(`Opening bulk actions for ${this.selectedBookingsCount} selected bookings`);
      // Implement bulk actions
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

  // User and Room utilities
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
    // Calculate progress based on current vs last week
    const current = parseInt(stat.value.replace(/[^\d.]/g, ''));
    const last = parseInt(stat.lastWeek.replace(/[^\d.]/g, ''));
    return Math.min((current / (last * 1.5)) * 100, 100);
  }

  // Notification system
  showNotification(message: string): void {
    // In a real application, you would use a proper notification service
    console.log('Notification:', message);
    // You can implement a toast notification here
    alert(message); // Temporary implementation
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
    // Ctrl/Cmd + F for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }

  // logout(): void {
  //   // Clear any auth tokens/data here
  //   this.router.navigate(['/login']);
  // }

}