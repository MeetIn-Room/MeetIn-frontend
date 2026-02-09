import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';
import { UserServiceService } from '../../../core/services/user-service.service';
import { RoleService } from '../../../core/services/role.service';
import { User, UserDisplay, getUserRoleName } from '../../../core/interfaces/user';
import { Role } from '../../../core/interfaces/role';
import { RoleBadgeComponent } from '../../../shared/components/role-badge/role-badge.component';
import { RoleSelectorComponent } from '../../../shared/components/role-selector/role-selector.component';

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

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    RoleBadgeComponent,
    RoleSelectorComponent
  ],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserServiceService);
  private roleService = inject(RoleService);

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

  // Loading and error states
  isLoading: boolean = false;
  rolesLoading: boolean = false;
  errorMessage: string | null = null;

  // Form states
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  editingUser: UserDisplay | null = null;

  userForm: FormGroup;

  // Dynamic roles from backend
  roles: Role[] = [];
  systemRoles: Role[] = [];
  customRoles: Role[] = [];

  userStats: UserStat[] = [
    {
      title: 'Total Users',
      value: '0',
      icon: 'users',
      isPositive: true,
      change: '+0%',
      lastMonth: '0',
      trend: [65, 70, 75, 80, 82, 85, 89],
      color: '#FF6B35',
      gradient: ['#FF6B35', '#FF8C42']
    },
    {
      title: 'Active Users',
      value: '0',
      icon: 'activity',
      isPositive: true,
      change: '+0%',
      lastMonth: '0',
      trend: [65, 68, 72, 75, 76, 77, 78],
      color: '#FF8C42',
      gradient: ['#FF8C42', '#FFA62E']
    },
    {
      title: 'Admin Users',
      value: '0',
      icon: 'shield',
      isPositive: false,
      change: '0%',
      lastMonth: '0',
      trend: [30, 28, 26, 25, 24, 23, 24],
      color: '#E2725B',
      gradient: ['#E2725B', '#FF8C42']
    },
  ];

  users: UserDisplay[] = [];
  filteredUsers: UserDisplay[] = [];

  constructor() {
    this.userForm = this.createUserForm();
  }

  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
  }

  /**
   * Load all roles from the backend
   */
  loadRoles(): void {
    this.rolesLoading = true;

    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.systemRoles = roles.filter(r => r.system);
        this.customRoles = roles.filter(r => !r.system);
        this.rolesLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.rolesLoading = false;
      }
    });
  }

  /**
   * Load all users from the API
   */
  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log("Users ", users);
        // Convert backend User to UserDisplay with additional frontend properties
        this.users = users.map(user => {
          const roleName = getUserRoleName(user);
          return {
            ...user,
            selected: false,
            lastLogin: 'Not tracked', // Backend doesn't provide this
            permissions: this.getDefaultPermissions(roleName)
          };
        });
        this.applyFilters();
        this.isLoading = false;
        this.updateUserStats();
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        this.showNotification(`Error loading users: ${error.message}`);
      }
    });
  }

  /**
   * Update user statistics based on loaded data
   */
  private updateUserStats(): void {
    const totalUsers = this.users.length;
    const activeUsers = this.users.filter(u => u.active).length;
    const adminUsers = this.users.filter(u => getUserRoleName(u) === 'ADMIN').length;

    // Update stats with real data
    this.userStats[0].value = totalUsers.toString();
    this.userStats[1].value = activeUsers.toString();
    this.userStats[2].value = adminUsers.toString();
  }

  createUserForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      roleId: [null, Validators.required],  // Changed from role string to roleId
      active: [true],
      password: ['', [Validators.required, Validators.minLength(8)]],
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
      active: true,
      sendWelcomeEmail: true,
      roleId: null
    });

    // Restore password validators for create mode
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('confirmPassword')?.setValidators([]);
    this.userForm.get('password')?.enable();
    this.userForm.get('confirmPassword')?.enable();
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.userForm.reset();
    this.editingUser = null;
  }

  openEditUserModal(user: UserDisplay): void {
    this.isEditing = true;
    this.editingUser = user;
    this.showEditUserModal = true;

    // Set form values
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      department: user.department,
      roleId: user.roleId || (typeof user.role === 'object' ? user.role?.id : null),
      active: user.active,
      password: '',
      confirmPassword: ''
    });

    // Remove password validators for edit mode (password is optional)
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
  }

  closeEditUserModal(): void {
    this.showEditUserModal = false;
    this.editingUser = null;
    this.userForm.reset();
    // Restore validators
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;

      const formValue = this.userForm.value;

      if (this.isEditing && this.editingUser) {
        // Update existing user
        const updateData = {
          name: formValue.name,
          email: formValue.email,
          department: formValue.department,
          roleId: formValue.roleId,
          active: formValue.active,
          password: formValue.password || undefined
        };

        this.userService.updateUser(this.editingUser.id, updateData).subscribe({
          next: (updatedUser) => {
            // Update the user in the list
            const index = this.users.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
              const roleName = getUserRoleName(updatedUser);
              this.users[index] = {
                ...updatedUser,
                selected: false,
                permissions: this.getDefaultPermissions(roleName)
              };
            }
            this.applyFilters();
            this.isSubmitting = false;
            this.closeEditUserModal();
            this.showNotification('User updated successfully!');
            this.updateUserStats();
          },
          error: (error) => {
            this.isSubmitting = false;
            this.showNotification(`Error updating user: ${error.message}`);
          }
        });
      } else {
        // Create new user
        const createData = {
          name: formValue.name,
          email: formValue.email,
          department: formValue.department,
          roleId: formValue.roleId,
          active: formValue.active,
          password: formValue.password
        };

        this.userService.createUser(createData).subscribe({
          next: (newUser) => {
            const roleName = getUserRoleName(newUser);
            const userDisplay: UserDisplay = {
              ...newUser,
              selected: false,
              lastLogin: 'Not tracked',
              permissions: this.getDefaultPermissions(roleName)
            };
            this.users.unshift(userDisplay);
            this.applyFilters();
            this.isSubmitting = false;
            this.closeAddUserModal();
            this.showNotification('User created successfully!');
            this.updateUserStats();
          },
          error: (error) => {
            this.isSubmitting = false;
            this.showNotification(`Error creating user: ${error.message}`);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
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
    return (this.editingUser as UserDisplay)?.permissions?.includes(permission) || false;
  }

  togglePermission(permission: string, event: any): void {
    if (!this.editingUser) return;

    const userDisplay = this.editingUser as UserDisplay;
    if (!userDisplay.permissions) {
      userDisplay.permissions = [];
    }

    if (event.target.checked) {
      if (!userDisplay.permissions.includes(permission)) {
        userDisplay.permissions.push(permission);
      }
    } else {
      const index = userDisplay.permissions.indexOf(permission);
      if (index > -1) {
        userDisplay.permissions.splice(index, 1);
      }
    }
  }

  getDefaultPermissions(roleName: string): string[] {
    const basePermissions = ['book_rooms', 'edit_own_bookings', 'cancel_own_bookings'];

    // Check if this is an admin role
    if (roleName === 'ADMIN') {
      return [...basePermissions, 'view_all_bookings', 'view_users', 'manage_users', 'reset_passwords', 'manage_rooms', 'system_settings', 'view_audit_logs', 'export_data'];
    }

    // All other roles get base permissions only
    return basePermissions;
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
        getUserRoleName(user).toLowerCase().includes(query)
      );
    }

    // Apply status filter
    switch (this.currentFilter) {
      case 'active':
        filtered = filtered.filter(user => user.active);
        break;
      case 'inactive':
        filtered = filtered.filter(user => !user.active);
        break;
      case 'admin':
        filtered = filtered.filter(user => getUserRoleName(user) === 'ADMIN');
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

  toggleUserSelection(user: UserDisplay): void {
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
  editUser(user: UserDisplay): void {
    this.openEditUserModal(user);
  }

  toggleUserStatus(user: UserDisplay): void {
    // Backend only supports deactivation, not reactivation
    if (user.active) {
      if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
        this.userService.deactivateUser(user.id).subscribe({
          next: (response) => {
            user.active = false;
            this.showNotification(response.message);
            this.updateUserStats();
          },
          error: (error) => {
            this.showNotification(`Error deactivating user: ${error.message}`);
          }
        });
      }
    } else {
      if (confirm(`Are you sure you want to activate ${user.name}?`)) {
        this.userService.activateUser(user.id).subscribe({
          next: (response) => {
            user.active = true;
            this.showNotification(response.message);
            this.updateUserStats();
          },
          error: (error) => {
            this.showNotification(`Error activating user: ${error.message}`);
          }
        });
      }
    }
  }

  deleteUser(user: UserDisplay): void {
    // Note: Backend doesn't provide a delete endpoint
    // This would need to be implemented on the backend
    this.showNotification('User deletion is not supported by the backend API. Use deactivate instead.');
  }

  // Utility functions
  saveUser(): void {
    this.onSubmit();
  }

  get roleOptions(): Role[] {
    return this.roles;
  }

  getRoleClass(roleName: string | Role): string {
    // Handle both string and Role object
    const roleStr = typeof roleName === 'string' ? roleName : roleName?.name;

    // Dynamic role class mapping based on role name
    const classes: { [key: string]: string } = {
      'ADMIN': 'role-admin',
      'USER': 'role-user'
    };
    return classes[roleStr] || 'role-user';
  }

  getUserRoleName(user: User | UserDisplay): string {
    return getUserRoleName(user);
  }

  getStatusClass(active: boolean): string {
    return active ? 'bg-green-100' : 'bg-red-100';
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
}
