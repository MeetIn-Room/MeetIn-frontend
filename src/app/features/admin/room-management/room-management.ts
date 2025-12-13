import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';
import { RoomServiceService } from '../../../core/services/room.service';
import { FrontendRoom, RoomMapper } from '../../../core/services/room-mapper';
import { Room } from '../../../core/interfaces/room';

interface RoomStat {
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

interface RoomType {
  value: string;
  name: string;
  description: string;
}

interface Equipment {
  value: string;
  name: string;
}

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './room-management.html',
  styleUrls: ['./room-management.css']
})
export class RoomManagementComponent implements OnInit {
  searchQuery: string = '';
  currentFilter: string = 'all';
  sortField: string = 'name';
  sortDirection: string = 'asc';
  currentPage: number = 1;
  pageSize: number = 8;
  totalRooms: number = 0;

  // Modal states
  showAddRoomModal: boolean = false;
  isEditing: boolean = false;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  editingRoom: FrontendRoom | null = null;

  roomForm: FormGroup;
  selectedEquipment: string[] = [];

  roomTypes: RoomType[] = [
    { value: 'conference', name: 'Conference Room', description: 'Large room for formal meetings and presentations' },
    { value: 'meeting', name: 'Meeting Room', description: 'Standard room for team meetings and discussions' },
    { value: 'training', name: 'Training Room', description: 'Room equipped for workshops and training sessions' },
    { value: 'huddle', name: 'Huddle Room', description: 'Small room for quick meetings and collaborations' },
    { value: 'executive', name: 'Executive Suite', description: 'Premium room for executive meetings' }
  ];

  availableEquipment: Equipment[] = [
    { value: 'projector', name: 'Projector' },
    { value: 'whiteboard', name: 'Whiteboard' },
    { value: 'video_conference', name: 'Video Conference' },
    { value: 'audio_system', name: 'Audio System' },
    { value: 'telephone', name: 'Telephone' },
    { value: 'computer', name: 'Computer' },
    { value: 'monitor', name: 'Large Monitor' },
    { value: 'webcam', name: 'Webcam' },
    { value: 'microphone', name: 'Microphone' },
    { value: 'speakers', name: 'Speakers' }
  ];

  roomStats: RoomStat[] = [
    {
      title: 'Total Rooms',
      value: '0',
      icon: 'building',
      isPositive: true,
      change: '+0%',
      lastMonth: '0',
      trend: [18, 19, 20, 21, 22, 23, 24],
      color: '#FF6B35',
      gradient: ['#FF6B35', '#FF8C42']
    },
    {
      title: 'Available Now',
      value: '0',
      icon: 'users',
      isPositive: true,
      change: '+0%',
      lastMonth: '0',
      trend: [14, 15, 16, 17, 16, 17, 18],
      color: '#FF8C42',
      gradient: ['#FF8C42', '#FFA62E']
    },
    {
      title: 'Avg Utilization',
      value: '0%',
      icon: 'trending-up',
      isPositive: true,
      change: '+0%',
      lastMonth: '0%',
      trend: [65, 67, 68, 70, 71, 72, 72],
      color: '#E2725B',
      gradient: ['#E2725B', '#FF8C42']
    },
    {
      title: 'Bookings Today',
      value: '0',
      icon: 'calendar',
      isPositive: true,
      change: '+0%',
      lastMonth: '0',
      trend: [35, 38, 40, 42, 44, 46, 47],
      color: '#B7410E',
      gradient: ['#B7410E', '#D86F39']
    }
  ];

  rooms: FrontendRoom[] = [];
  filteredRooms: FrontendRoom[] = [];
  filteredRoomsTable: FrontendRoom[] = [];

  constructor(
    private fb: FormBuilder,
    private roomService: RoomServiceService
  ) {
    this.roomForm = this.createRoomForm();
  }

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getRooms().subscribe({
      next: (backendRooms: Room[]) => {
        // Convert backend rooms to frontend format
        this.rooms = RoomMapper.toFrontendArray(backendRooms);
        this.filteredRooms = [...this.rooms];
        this.filteredRoomsTable = [...this.rooms];
        this.totalRooms = this.rooms.length;
        this.updateStats();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading rooms:', error);
        this.showNotification('Error loading rooms. Please try again.');
        this.isLoading = false;
      }
    });
  }

  updateStats(): void {
    const totalRooms = this.rooms.length;
    const availableRooms = this.rooms.filter(r => r.status === 'Available').length;
    const avgUtilization = totalRooms > 0
      ? Math.round(this.rooms.reduce((sum, r) => sum + (r.utilization || 0), 0) / totalRooms)
      : 0;

    // Update stats
    this.roomStats[0].value = totalRooms.toString();
    this.roomStats[1].value = availableRooms.toString();
    this.roomStats[2].value = `${avgUtilization}%`;
  }

  createRoomForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      location: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      description: [''],
      type: ['meeting'],
      availableFrom: ['08:00'],
      availableTo: ['18:00'],
      status: ['Available'],
      requiresApproval: [false]
    });
  }

  // Modal Management
  openAddRoomModal(): void {
    this.isEditing = false;
    this.showAddRoomModal = true;
    this.selectedEquipment = [];
    this.roomForm.reset({
      type: 'meeting',
      availableFrom: '08:00',
      availableTo: '18:00',
      status: 'Available',
      requiresApproval: false
    });
  }

  closeAddRoomModal(): void {
    this.showAddRoomModal = false;
    this.editingRoom = null;
    this.roomForm.reset();
    this.selectedEquipment = [];
  }

  openEditRoomModal(room: FrontendRoom): void {
    this.isEditing = true;
    this.showAddRoomModal = true;
    this.editingRoom = room;
    this.selectedEquipment = [...(room.equipment || [])];

    const [availableFrom, availableTo] = this.parseAvailabilityHours(room.availabilityHours || '08:00 - 18:00');

    this.roomForm.patchValue({
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      description: room.description,
      type: room.type,
      availableFrom: availableFrom,
      availableTo: availableTo,
      status: room.status,
      requiresApproval: room.requiresApproval || false
    });
  }

  // Form Actions
  saveRoom(): void {
    if (this.roomForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.roomForm.value;
    const availabilityHours = `${formValue.availableFrom} - ${formValue.availableTo}`;

    const frontendRoomData: Partial<FrontendRoom> = {
      name: formValue.name,
      location: formValue.location,
      capacity: formValue.capacity,
      description: formValue.description,
      type: formValue.type,
      equipment: this.selectedEquipment,
      availabilityHours: availabilityHours,
      status: formValue.status,
      requiresApproval: formValue.requiresApproval,
      utilization: this.isEditing ? this.editingRoom?.utilization : Math.floor(Math.random() * 30) + 40
    };

    // Convert to backend format
    const backendRoomData = RoomMapper.toBackend(frontendRoomData);

    console.log('Frontend data:', frontendRoomData);
    console.log('Backend payload:', backendRoomData);

    if (this.isEditing && this.editingRoom?.id) {
      const roomId = parseInt(this.editingRoom.id, 10);
      this.roomService.updateRoom(roomId, backendRoomData as any).subscribe({
        next: (updatedBackendRoom: Room) => {
          const updatedFrontendRoom = RoomMapper.toFrontend(updatedBackendRoom);
          const index = this.rooms.findIndex(r => r.id === this.editingRoom!.id);
          if (index > -1) {
            this.rooms[index] = updatedFrontendRoom;
          }
          this.applyFilters();
          this.applyTableFilters();
          this.updateStats();
          this.isSubmitting = false;
          this.closeAddRoomModal();
          this.showNotification('Room updated successfully!');
        },
        error: (error: any) => {
          console.error('Error updating room:', error);
          this.showNotification('Error updating room. Please try again.');
          this.isSubmitting = false;
        }
      });
    } else {
      this.roomService.createRoom(backendRoomData as any).subscribe({
        next: (newBackendRoom: Room) => {
          const newFrontendRoom = RoomMapper.toFrontend(newBackendRoom);
          this.rooms.unshift(newFrontendRoom);
          this.applyFilters();
          this.applyTableFilters();
          this.updateStats();
          this.isSubmitting = false;
          this.closeAddRoomModal();
          this.showNotification('Room created successfully!');
        },
        error: (error: any) => {
          console.error('Error creating room:', error);
          this.showNotification('Error creating room. Please try again.');
          this.isSubmitting = false;
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.roomForm.controls).forEach(key => {
      this.roomForm.get(key)?.markAsTouched();
    });
  }

  // Equipment Management
  toggleEquipment(equipment: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedEquipment.includes(equipment)) {
        this.selectedEquipment.push(equipment);
      }
    } else {
      const index = this.selectedEquipment.indexOf(equipment);
      if (index > -1) {
        this.selectedEquipment.splice(index, 1);
      }
    }
  }

  // Search and Filter functionality
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
    this.applyTableFilters();
  }

  filterRooms(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFilters();
    this.applyTableFilters();
  }

  applyFilters(): void {
    let filtered = this.rooms;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(query) ||
        room.location.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query)
      );
    }

    switch (this.currentFilter) {
      case 'available':
        filtered = filtered.filter(room => room.status === 'Available');
        break;
      case 'occupied':
        filtered = filtered.filter(room => room.status === 'Occupied');
        break;
      case 'maintenance':
        filtered = filtered.filter(room => room.status === 'Maintenance');
        break;
    }

    this.filteredRooms = filtered;
  }

  applyTableFilters(): void {
    let filtered = this.rooms;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(query) ||
        room.location.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query)
      );
    }

    switch (this.currentFilter) {
      case 'available':
        filtered = filtered.filter(room => room.status === 'Available');
        break;
      case 'occupied':
        filtered = filtered.filter(room => room.status === 'Occupied');
        break;
      case 'maintenance':
        filtered = filtered.filter(room => room.status === 'Maintenance');
        break;
    }

    filtered.sort((a, b) => {
      let aValue = a[this.sortField as keyof FrontendRoom];
      let bValue = b[this.sortField as keyof FrontendRoom];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredRoomsTable = filtered.slice(startIndex, endIndex);
    this.totalRooms = filtered.length;
  }

  sortRooms(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyTableFilters();
  }

  editRoom(room: FrontendRoom): void {
    this.openEditRoomModal(room);
  }

  viewRoomDetails(room: FrontendRoom): void {
    this.showNotification(`Viewing details for ${room.name}`);
  }

  toggleRoomStatus(room: FrontendRoom): void {
    const originalStatus = room.status;

    if (room.status === 'Available') {
      room.status = 'Occupied';
    } else if (room.status === 'Occupied') {
      room.status = 'Available';
    } else if (room.status === 'Maintenance') {
      room.status = 'Available';
    }

    if (room.id) {
      const frontendData: Partial<FrontendRoom> = { ...room };
      const backendData = RoomMapper.toBackend(frontendData);
      const roomId = parseInt(room.id, 10);
      this.roomService.updateRoom(roomId, backendData as any).subscribe({
        next: () => {
          this.showNotification(`${room.name} is now ${room.status.toLowerCase()}`);
          this.applyFilters();
          this.applyTableFilters();
        },
        error: (error: any) => {
          console.error('Error updating room status:', error);
          room.status = originalStatus;
          this.showNotification('Error updating room status. Please try again.');
        }
      });
    }
  }

  deleteRoom(room: FrontendRoom): void {
    if (confirm(`Are you sure you want to delete ${room.name}? This action cannot be undone.`)) {
      if (room.id) {
        const roomId = parseInt(room.id, 10);
        this.roomService.deleteRoom(roomId).subscribe({
          next: () => {
            const index = this.rooms.findIndex(r => r.id === room.id);
            if (index > -1) {
              this.rooms.splice(index, 1);
              this.applyFilters();
              this.applyTableFilters();
              this.updateStats();
              this.showNotification(`Room ${room.name} has been deleted`);
            }
          },
          error: (error: any) => {
            console.error('Error deleting room:', error);
            this.showNotification('Error deleting room. Please try again.');
          }
        });
      }
    }
  }

  parseAvailabilityHours(hours: string): [string, string] {
    const [from, to] = hours.split(' - ');
    return [from, to];
  }

  getRoomStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Available': 'room-available',
      'Occupied': 'room-occupied',
      'Maintenance': 'room-maintenance'
    };
    return classes[status] || 'room-available';
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Available': 'status-available',
      'Occupied': 'status-occupied',
      'Maintenance': 'status-maintenance'
    };
    return classes[status] || 'status-available';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Available': 'bg-green-100',
      'Occupied': 'bg-yellow-100',
      'Maintenance': 'bg-red-100'
    };
    return classes[status] || 'bg-gray-100';
  }

  getRoomInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getRoomColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #f97316, #fb923c)',
      'linear-gradient(135deg, #3b82f6, #60a5fa)',
      'linear-gradient(135deg, #10b981, #34d399)',
      'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      'linear-gradient(135deg, #ef4444, #f87171)',
      'linear-gradient(135deg, #f59e0b, #fbbf24)'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  get totalPages(): number {
    return Math.ceil(this.totalRooms / this.pageSize);
  }

  get showPaginationDots(): boolean {
    return this.totalPages > 5;
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (current >= total - 2) {
        pages.push(total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(current - 2, current - 1, current, current + 1, current + 2);
      }
    }
    return pages;
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalRooms);
    return `${start}-${end}`;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyTableFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyTableFilters();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyTableFilters();
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

  getProgressWidth(stat: RoomStat): number {
    const current = parseInt(stat.value.replace(/[^\d]/g, ''));
    const last = parseInt(stat.lastMonth.replace(/[^\d]/g, ''));
    return Math.min((current / (last * 1.5)) * 100, 100);
  }

  openFilterModal(): void {
    this.showNotification('Room filter options would open here');
  }

  openSortModal(): void {
    this.showNotification('Room sort options would open here');
  }

  showNotification(message: string): void {
    alert(message);
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showAddRoomModal) {
      this.closeAddRoomModal();
    }
  }
}
