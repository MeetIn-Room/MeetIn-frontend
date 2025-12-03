import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbar/navbar';

interface UserStat {
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastLogin: string;
  lastLoginIp?: string;
  selected: boolean;
  phone?: string;
  permissions?: string[];
}

interface RoleOption {
  value: string;
  name: string;
  description: string;
}

interface Permission {
  value: string;
  name: string;
  description: string;
}

interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {

  searchQuery: string = '';
  currentFilter: string = 'all';
  sortField: string = 'name';
  sortDirection: string = 'asc';
  currentPage: number = 1;
  pageSize: number = 8;
  totalUsers: number = 0;
  allSelected: boolean = false;
  selectedUsersCount: number = 0;
  
  // Modal states
  showAddUserModal: boolean = false;
  showEditUserModal: boolean = false;
  isEditing: boolean = false;
  isSubmitting: boolean = false;
  activeTab: string = 'profile';
  
  // Form states
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  editingUser: User | null = null;
  
  userForm: FormGroup;
  
  roleOptions: RoleOption[] = [
    { value: 'User', name: 'Standard User', description: 'Can book rooms and manage own bookings' },
    { value: 'Admin', name: 'Administrator', description: 'Full system access and user management' }
  ];

  permissionCategories: PermissionCategory[] = [
    {
      name: 'Booking Management',
      permissions: [
        { value: 'book_rooms', name: 'Book Rooms', description: 'Can book meeting rooms' },
        { value: 'edit_own_bookings', name: 'Edit Own Bookings', description: 'Can modify their own bookings' },
        { value: 'cancel_own_bookings', name: 'Cancel Own Bookings', description: 'Can cancel their own bookings' },
        { value: 'view_all_bookings', name: 'View All Bookings', description: 'Can see all system bookings' }
      ]
    },
    {
      name: 'User Management',
      permissions: [
        { value: 'view_users', name: 'View Users', description: 'Can see other users in the system' },
        { value: 'manage_users', name: 'Manage Users', description: 'Can create, edit, and delete users' },
        { value: 'reset_passwords', name: 'Reset Passwords', description: 'Can reset user passwords' }
      ]
    },
    {
      name: 'System Administration',
      permissions: [
        { value: 'manage_rooms', name: 'Manage Rooms', description: 'Can add, edit, and remove rooms' },
        { value: 'system_settings', name: 'System Settings', description: 'Can modify system configuration' },
        { value: 'view_audit_logs', name: 'View Audit Logs', description: 'Can access system audit logs' },
        { value: 'export_data', name: 'Export Data', description: 'Can export system data' }
      ]
    }
  ];

  userStats: UserStat[] = [
    {
      title: 'Total Users',
      value: '1,247',
      icon: 'users',
      isPositive: true,
      change: '+12.5%',
      lastMonth: '1,108',
      trend: [65, 70, 75, 80, 82, 85, 89],
      color: '#FF6B35',
      gradient: ['#FF6B35', '#FF8C42']
    },
    {
      title: 'Active Users',
      value: '893',
      icon: 'activity',
      isPositive: true,
      change: '+8.1%',
      lastMonth: '826',
      trend: [65, 68, 72, 75, 76, 77, 78],
      color: '#FF8C42',
      gradient: ['#FF8C42', '#FFA62E']
    },
    {
      title: 'Admin Users',
      value: '24',
      icon: 'shield',
      isPositive: false,
      change: '-2.3%',
      lastMonth: '26',
      trend: [30, 28, 26, 25, 24, 23, 24],
      color: '#E2725B',
      gradient: ['#E2725B', '#FF8C42']
    },
    {
      title: 'New Users',
      value: '45',
      icon: 'user-plus',
      isPositive: true,
      change: '+15.2%',
      lastMonth: '39',
      trend: [12, 18, 15, 22, 25, 28, 24],
      color: '#B7410E',
      gradient: ['#B7410E', '#D86F39']
    }
  ];

  users: User[] = [
    {
      id: 'USR001',
      name: 'Alex Nelson Ryan',
      email: 'alex.nelson@company.com',
      role: 'Admin',
      department: 'IT',
      status: 'Active',
      lastLogin: '2 Dec 2026, 14:30',
      lastLoginIp: '192.168.1.100',
      selected: false,
      phone: '+1 (555) 123-4567',
      permissions: ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings', 'view_all_bookings', 'view_users', 'manage_users', 'reset_passwords', 'manage_rooms', 'system_settings', 'view_audit_logs', 'export_data']
    },
    {
      id: 'USR002',
      name: 'Weber Kengne',
      email: 'weber.kengne@company.com',
      role: 'User',
      department: 'Engineering',
      status: 'Active',
      lastLogin: '1 Dec 2026, 09:15',
      lastLoginIp: '192.168.1.101',
      selected: false,
      phone: '+1 (555) 123-4568',
      permissions: ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings']
    },
    {
      id: 'USR003',
      name: 'Marie Louise',
      email: 'marie.louise@company.com',
      role: 'Manager',
      department: 'HR',
      status: 'Active',
      lastLogin: '1 Dec 2026, 11:45',
      lastLoginIp: '192.168.1.102',
      selected: false,
      phone: '+1 (555) 123-4569',
      permissions: ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings', 'view_all_bookings', 'view_users']
    },
    {
      id: 'USR004',
      name: 'Ismael Takam',
      email: 'ismael.takam@company.com',
      role: 'User',
      department: 'Marketing',
      status: 'Inactive',
      lastLogin: '28 Nov 2026, 16:20',
      selected: false,
      phone: '+1 (555) 123-4570',
      permissions: ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings']
    },
    {
      id: 'USR005',
      name: 'Gift Anderson',
      email: 'gift.anderson@company.com',
      role: 'Admin',
      department: 'Finance',
      status: 'Active',
      lastLogin: '30 Nov 2026, 10:30',
      lastLoginIp: '192.168.1.104',
      selected: false,
      phone: '+1 (555) 123-4571',
      permissions: ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings', 'view_all_bookings', 'view_users', 'manage_users', 'reset_passwords', 'manage_rooms', 'system_settings', 'view_audit_logs', 'export_data']
    },
    {
      id: 'USR006',
      name: 'Prince Raoul',
      email: 'prince.raoul@company.com',
      role: 'User',
      department: 'Operations',
      status: 'Active',
      lastLogin: '29 Nov 2026, 15:45',
      lastLoginIp: '192.168.1.105',
      selected: false,
      phone: '+1 (555) 123-4572',
      permissions: ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings']
    },
    {
      id: 'USR007',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Manager',
      department: 'Sales',
      status: 'Active',
      lastLogin: '2 Dec 2026, 08:20',
      lastLoginIp: '192.168.1.106',
      selected: false,
      phone: '+1 (555) 123-4573',
      permissions: ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings', 'view_all_bookings', 'view_users']
    },
    {
      id: 'USR008',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'User',
      department: 'Engineering',
      status: 'Inactive',
      lastLogin: '25 Nov 2026, 14:10',
      selected: false,
      phone: '+1 (555) 123-4574',
      permissions: ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings']
    }
  ];

  filteredUsers: User[] = [];

  constructor(private fb: FormBuilder, private router: Router) {
    this.userForm = this.createUserForm();
  }

  ngOnInit() {
    this.filteredUsers = [...this.users];
    this.totalUsers = this.users.length;
    this.updateSelectedCount();
  }

  createUserForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      department: ['', Validators.required],
      role: ['', Validators.required],
      status: ['Active'],
      password: ['', [Validators.minLength(8)]],
      confirmPassword: [''],
      sendWelcomeEmail: [true]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  // Modal Management
  openAddUserModal(): void {
    this.isEditing = false;
    this.showAddUserModal = true;
    this.userForm.reset({
      status: 'Active',
      sendWelcomeEmail: true,
      role: ''
    });
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.userForm.reset();
  }

  openEditUserModal(user: User): void {
    this.isEditing = true;
    this.showEditUserModal = true;
    this.editingUser = user;
    this.activeTab = 'profile';
    
    // Split name into first and last
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    this.userForm.patchValue({
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      phone: user.phone || '',
      department: user.department,
      role: user.role,
      status: user.status,
      password: '',
      confirmPassword: ''
    });
    
    // Clear password validators for edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.updateValueAndValidity();
  }

  closeEditUserModal(): void {
    this.showEditUserModal = false;
    this.editingUser = null;
    this.userForm.reset();
    
    // Restore password validators
    this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.userForm.get('confirmPassword')?.setValidators([]);
  }

  // Form Actions
  saveUser(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    
    // Simulate API call
    setTimeout(() => {
      const formValue = this.userForm.value;
      
      if (this.isEditing && this.editingUser) {
        // Update existing user
        const updatedUser: User = {
          ...this.editingUser,
          name: `${formValue.firstName} ${formValue.lastName}`,
          email: formValue.email,
          phone: formValue.phone,
          department: formValue.department,
          role: formValue.role,
          status: formValue.status
        };
        
        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        if (index > -1) {
          this.users[index] = updatedUser;
        }
      } else {
        // Create new user
        const newUser: User = {
          id: 'USR' + (this.users.length + 1).toString().padStart(3, '0'),
          name: `${formValue.firstName} ${formValue.lastName}`,
          email: formValue.email,
          phone: formValue.phone,
          department: formValue.department,
          role: formValue.role,
          status: formValue.status,
          lastLogin: 'Never',
          selected: false,
          permissions: this.getDefaultPermissions(formValue.role)
        };
        
        this.users.unshift(newUser);
      }
      
      this.applyFilters();
      this.isSubmitting = false;
      
      if (this.isEditing) {
        this.closeEditUserModal();
      } else {
        this.closeAddUserModal();
      }
      
      // Show success message
      this.showNotification(`${this.isEditing ? 'Updated' : 'Created'} user successfully!`);
      
    }, 1500);
  }

  markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  // Password Management
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordStrengthClass(): string {
    const password = this.userForm.get('password')?.value || '';
    if (password.length === 0) return 'strength-none';
    if (password.length < 4) return 'strength-weak';
    if (password.length < 8) return 'strength-fair';
    if (password.length < 12) return 'strength-good';
    return 'strength-strong';
  }

  getPasswordStrengthText(): string {
    const password = this.userForm.get('password')?.value || '';
    if (password.length === 0) return 'No password';
    if (password.length < 4) return 'Weak';
    if (password.length < 8) return 'Fair';
    if (password.length < 12) return 'Good';
    return 'Strong';
  }

  sendPasswordReset(): void {
    if (this.editingUser) {
      this.isSubmitting = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.showNotification(`Password reset email sent to ${this.editingUser!.email}`);
      }, 1000);
    }
  }

  // Permission Management
  hasPermission(permission: string): boolean {
    return this.editingUser?.permissions?.includes(permission) || false;
  }

  togglePermission(permission: string, event: any): void {
    if (!this.editingUser) return;
    
    if (!this.editingUser.permissions) {
      this.editingUser.permissions = [];
    }
    
    if (event.target.checked) {
      if (!this.editingUser.permissions.includes(permission)) {
        this.editingUser.permissions.push(permission);
      }
    } else {
      const index = this.editingUser.permissions.indexOf(permission);
      if (index > -1) {
        this.editingUser.permissions.splice(index, 1);
      }
    }
  }

  getDefaultPermissions(role: string): string[] {
    const basePermissions = ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings'];
    
    switch (role) {
      case 'Admin':
        return [...basePermissions, 'view_all_bookings', 'view_users', 'manage_users', 'reset_passwords', 'manage_rooms', 'system_settings', 'view_audit_logs', 'export_data'];
      case 'Manager':
        return [...basePermissions, 'view_all_bookings', 'view_users'];
      default:
        return basePermissions;
    }
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Filter functionality
  filterUsers(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.users;

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    switch (this.currentFilter) {
      case 'active':
        filtered = filtered.filter(user => user.status === 'Active');
        break;
      case 'inactive':
        filtered = filtered.filter(user => user.status === 'Inactive');
        break;
      case 'admin':
        filtered = filtered.filter(user => user.role === 'Admin');
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[this.sortField as keyof User];
      let bValue = b[this.sortField as keyof User];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });

    this.filteredUsers = filtered;
    this.totalUsers = filtered.length;
  }

  // Sorting functionality
  sortUsers(field: string): void {
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
    this.filteredUsers.forEach(user => user.selected = checked);
    this.updateSelectedCount();
  }

  toggleUserSelection(user: User): void {
    user.selected = !user.selected;
    this.allSelected = this.filteredUsers.every(u => u.selected);
    this.updateSelectedCount();
  }

  updateSelectedCount(): void {
    this.selectedUsersCount = this.filteredUsers.filter(user => user.selected).length;
  }

  // Pagination functionality
  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
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
    const end = Math.min(this.currentPage * this.pageSize, this.totalUsers);
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

  // User actions
  editUser(user: User): void {
    this.openEditUserModal(user);
  }

  toggleUserStatus(user: User): void {
    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    this.showNotification(`${user.name} has been ${user.status === 'Active' ? 'activated' : 'deactivated'}`);
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index > -1) {
        this.users.splice(index, 1);
        this.applyFilters();
        this.showNotification(`User ${user.name} has been deleted`);
      }
    }
  }

  // Utility functions
  getRoleClass(role: string): string {
    const classes: { [key: string]: string } = {
      'Admin': 'role-admin',
      'Manager': 'role-manager',
      'User': 'role-user'
    };
    return classes[role] || 'role-user';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Active': 'bg-green-100',
      'Inactive': 'bg-red-100',
      'Pending': 'bg-yellow-100'
    };
    return classes[status] || 'bg-gray-100';
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getUserAvatarColor(name: string): string {
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

  // Export functionality
  exportUsers(): void {
    this.showNotification('Exporting users data...');
    // Implement export functionality
  }

  openFilterModal(): void {
    this.showNotification('Filter options would open here');
  }

  openSortModal(): void {
    this.showNotification('Sort options would open here');
  }

  // Chart methods
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

  getProgressWidth(stat: UserStat): number {
    const current = parseInt(stat.value.replace(/[^\d]/g, ''));
    const last = parseInt(stat.lastMonth.replace(/[^\d]/g, ''));
    return Math.min((current / (last * 1.5)) * 100, 100);
  }

  // Utility Methods
  showNotification(message: string): void {
    // In a real app, you might use a toast service
    alert(message);
  }

  // Keyboard navigation
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showAddUserModal) {
      this.closeAddUserModal();
    }
    if (this.showEditUserModal) {
      this.closeEditUserModal();
    }
  }

  // logout(): void {
  //   // Clear any auth tokens/data here
  //   this.router.navigate(['/login']);
  // }

}