import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';
import { RoomServiceService } from '../../../core/services/room.service';
import { RoleService } from '../../../core/services/role.service';
import { FrontendRoom, RoomMapper } from '../../../core/services/room-mapper';
import { Room } from '../../../core/interfaces/room';
import { Role } from '../../../core/interfaces/role';

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
  private fb = inject(FormBuilder);
  private roomService = inject(RoomServiceService);
  private roleService = inject(RoleService);

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
  selectedRoleIds: (string | number)[] = []; // NEW: Track selected role IDs

  // NEW: Roles from backend
  roles: Role[] = [];
  rolesLoading: boolean = false;

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

  constructor() {
    this.roomForm = this.createRoomForm();
  }

  ngOnInit() {
    this.loadRoles(); // NEW: Load roles on init
    this.loadRooms();
  }

  // NEW: Load all roles from backend
  loadRoles(): void {
    this.rolesLoading = true;
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.rolesLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.rolesLoading = false;
      }
    });
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
      requiresApproval: [false],
      // NEW: Allow all roles by default (empty array = no restrictions)
      allowAllRoles: [true]
    });
  }

  // NEW: Toggle role selection
  toggleRole(roleId: string | number, event: any): void {
    if (event.target.checked) {
      if (!this.selectedRoleIds.includes(roleId)) {
        this.selectedRoleIds.push(roleId);
      }
    } else {
      const index = this.selectedRoleIds.indexOf(roleId);
      if (index > -1) {
        this.selectedRoleIds.splice(index, 1);
      }
    }
  }

  // NEW: Check if role is selected
  isRoleSelected(roleId: string | number): boolean {
    return this.selectedRoleIds.includes(roleId);
  }

  // NEW: Toggle "Allow All Roles" checkbox
  toggleAllowAllRoles(event: any): void {
    const allowAll = event.target.checked;
    if (allowAll) {
      // Clear all selections when allowing all roles
      this.selectedRoleIds = [];
    }
  }

  // Modal Management
  openAddRoomModal(): void {
    this.isEditing = false;
    this.showAddRoomModal = true;
    this.selectedEquipment = [];
    this.selectedRoleIds = []; // NEW: Reset role selections
    this.roomForm.reset({
      type: 'meeting',
      availableFrom: '08:00',
      availableTo: '18:00',
      status: 'Available',
      requiresApproval: false,
      allowAllRoles: true // NEW: Default to allowing all roles
    });
  }

  closeAddRoomModal(): void {
    this.showAddRoomModal = false;
    this.editingRoom = null;
    this.roomForm.reset();
    this.selectedEquipment = [];
    this.selectedRoleIds = []; // NEW: Reset role selections
  }

  openEditRoomModal(room: FrontendRoom): void {
    this.isEditing = true;
    this.showAddRoomModal = true;
    this.editingRoom = room;
    this.selectedEquipment = [...(room.equipment || [])];
    
    // NEW: Load allowed roles if any
    const backendRoom = this.rooms.find(r => r.id === room.id);
    // Note: allowedRoleIds would need to be added to the Room interface and mapper
    // For now, we'll assume no restrictions when editing (empty array)
    this.selectedRoleIds = [];

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
      requiresApproval: room.requiresApproval || false,
      allowAllRoles: true // NEW: Default to allowing all roles for now
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

    // NEW: Prepare allowed roles
    const allowedRoleIds = formValue.allowAllRoles ? [] : this.selectedRoleIds;

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
    
    // NEW: Add allowed roles to backend data
    (backendRoomData as any).allowedRoleIds = allowedRoleIds;

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
      case 'in-use':
        filtered = filtered.filter(room => room.status === 'In Use');
        break;
      case 'maintenance':
        filtered = filtered.filter(room => room.status === 'Maintenance');
        break;
    }

    this.filteredRooms = filtered;
  }

  applyTableFilters(): void {
    let filtered = [...this.filteredRooms];
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[this.sortField as keyof FrontendRoom];
      let bValue = b[this.sortField as keyof FrontendRoom];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });

    this.filteredRoomsTable = filtered;
  }

  // Sorting
  sortRooms(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyTableFilters();
  }

  // Room Actions
  editRoom(room: FrontendRoom): void {
    this.openEditRoomModal(room);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Available': 'status-available',
      'In Use': 'status-in-use',
      'Maintenance': 'status-maintenance'
    };
    return classes[status] || 'status-available';
  }

  toggleRoomStatus(room: FrontendRoom): void {
    const newStatus = room.status === 'Available' ? 'Maintenance' : 'Available';
    if (confirm(`Change ${room.name} status to ${newStatus}?`)) {
      // Update locally for now - backend update would go here
      room.status = newStatus;
      this.updateStats();
      this.showNotification(`Room status changed to ${newStatus}`);
    }
  }

  deleteRoom(room: FrontendRoom): void {
    if (confirm(`Are you sure you want to delete ${room.name}?`)) {
      const roomId = parseInt(room.id, 10);
      this.roomService.deleteRoom(roomId).subscribe({
        next: () => {
          this.rooms = this.rooms.filter(r => r.id !== room.id);
          this.applyFilters();
          this.applyTableFilters();
          this.updateStats();
          this.showNotification('Room deleted successfully!');
        },
        error: (error: any) => {
          console.error('Error deleting room:', error);
          this.showNotification('Error deleting room. Please try again.');
        }
      });
    }
  }

  // Utility
  getRoomColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #f97316, #fb923c)',
      'linear-gradient(135deg, #3b82f6, #60a5fa)',
      'linear-gradient(135deg, #10b981, #34d399)',
      'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      'linear-gradient(135deg, #ef4444, #f87171)'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getRoomInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  parseAvailabilityHours(hours: string): [string, string] {
    const parts = hours.split(' - ');
    if (parts.length === 2) {
      return [parts[0], parts[1]];
    }
    return ['08:00', '18:00'];
  }

  showNotification(message: string): void {
    alert(message);
  }

  // Modal stubs for template compatibility
  openFilterModal(): void {
    // TODO: Implement filter modal
    console.log('Filter modal opened');
  }

  openSortModal(): void {
    // TODO: Implement sort modal
    console.log('Sort modal opened');
  }

  // Chart and stats utilities
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

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showAddRoomModal) {
      this.closeAddRoomModal();
    }
  }

  // Pagination
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
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }
}
