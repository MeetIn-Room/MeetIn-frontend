import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';
import { RoleService } from '../../../core/services/role.service';
import { Role, RoleCreateDTO, RoleUpdateDTO } from '../../../core/interfaces/role';
import { RoleBadgeComponent } from '../../../shared/components/role-badge/role-badge.component';

interface RoleStat {
  title: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    SidebarComponent, 
    HeaderComponent,
    RoleBadgeComponent
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {
  private roleService = inject(RoleService);
  private fb = inject(FormBuilder);

  // Search and filter
  searchQuery: string = '';
  currentFilter: string = 'all'; // 'all', 'system', 'custom'

  // Loading states
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Data
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  systemRoles: Role[] = [];
  customRoles: Role[] = [];

  // Modal states
  showCreateModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  editingRole: Role | null = null;
  deletingRole: Role | null = null;

  // Forms
  roleForm: FormGroup;

  // Stats
  roleStats: RoleStat[] = [
    { title: 'Total Roles', value: '0', icon: 'shield', color: '#4F46E5' },
    { title: 'System Roles', value: '0', icon: 'lock', color: '#059669' },
    { title: 'Custom Roles', value: '0', icon: 'users', color: '#DC2626' }
  ];

  constructor() {
    this.roleForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        Validators.pattern(/^[A-Z_][A-Z0-9_]*$/) // UPPER_CASE_WITH_UNDERSCORES
      ]],
      description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.systemRoles = roles.filter(r => r.isSystem);
        this.customRoles = roles.filter(r => !r.isSystem);
        this.applyFilters();
        this.updateStats();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load roles. Please try again.';
        this.isLoading = false;
        console.error('Error loading roles:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.roles];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(query) ||
        (role.description && role.description.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (this.currentFilter === 'system') {
      filtered = filtered.filter(role => role.isSystem);
    } else if (this.currentFilter === 'custom') {
      filtered = filtered.filter(role => !role.isSystem);
    }

    this.filteredRoles = filtered;
  }

  updateStats(): void {
    this.roleStats[0].value = this.roles.length.toString();
    this.roleStats[1].value = this.systemRoles.length.toString();
    this.roleStats[2].value = this.customRoles.length.toString();
  }

  onSearch(): void {
    this.applyFilters();
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyFilters();
  }

  // Create Role
  openCreateModal(): void {
    this.roleForm.reset();
    this.showCreateModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.roleForm.reset();
  }

  createRole(): void {
    if (this.roleForm.invalid) {
      this.markFormGroupTouched(this.roleForm);
      return;
    }

    this.isSubmitting = true;
    const roleData: RoleCreateDTO = {
      name: this.roleForm.value.name,
      description: this.roleForm.value.description
    };

    this.roleService.createRole(roleData).subscribe({
      next: (newRole) => {
        this.roles.push(newRole);
        this.customRoles.push(newRole);
        this.applyFilters();
        this.updateStats();
        this.successMessage = `Role "${newRole.name}" created successfully!`;
        this.isSubmitting = false;
        setTimeout(() => this.closeCreateModal(), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create role. Role name may already exist.';
        this.isSubmitting = false;
      }
    });
  }

  // Edit Role
  openEditModal(role: Role): void {
    if (role.isSystem) {
      // For system roles, only description can be edited
      this.errorMessage = 'System roles can only have their description modified.';
    }
    
    this.editingRole = role;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description || ''
    });
    
    // Disable name field for system roles
    if (role.isSystem) {
      this.roleForm.get('name')?.disable();
    } else {
      this.roleForm.get('name')?.enable();
    }
    
    this.showEditModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingRole = null;
    this.roleForm.reset();
    this.roleForm.get('name')?.enable();
  }

  updateRole(): void {
    if (!this.editingRole || this.roleForm.invalid) {
      this.markFormGroupTouched(this.roleForm);
      return;
    }

    this.isSubmitting = true;
    const roleData: RoleUpdateDTO = {
      name: this.roleForm.value.name,
      description: this.roleForm.value.description
    };

    this.roleService.updateRole(this.editingRole.id, roleData).subscribe({
      next: (updatedRole) => {
        // Update the role in the arrays
        const index = this.roles.findIndex(r => r.id === updatedRole.id);
        if (index !== -1) {
          this.roles[index] = updatedRole;
        }
        
        // Update system/custom arrays
        if (updatedRole.isSystem) {
          const sysIndex = this.systemRoles.findIndex(r => r.id === updatedRole.id);
          if (sysIndex !== -1) this.systemRoles[sysIndex] = updatedRole;
        } else {
          const custIndex = this.customRoles.findIndex(r => r.id === updatedRole.id);
          if (custIndex !== -1) this.customRoles[custIndex] = updatedRole;
        }
        
        this.applyFilters();
        this.successMessage = `Role "${updatedRole.name}" updated successfully!`;
        this.isSubmitting = false;
        setTimeout(() => this.closeEditModal(), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update role.';
        this.isSubmitting = false;
      }
    });
  }

  // Delete Role
  openDeleteModal(role: Role): void {
    if (role.isSystem) {
      this.errorMessage = 'System roles cannot be deleted.';
      return;
    }
    
    if (role.userCount && role.userCount > 0) {
      this.errorMessage = `Cannot delete role "${role.name}" because it has ${role.userCount} user(s) assigned.`;
      return;
    }
    
    this.deletingRole = role;
    this.showDeleteModal = true;
    this.errorMessage = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingRole = null;
  }

  deleteRole(): void {
    if (!this.deletingRole) return;

    this.isSubmitting = true;
    this.roleService.deleteRole(this.deletingRole.id).subscribe({
      next: () => {
        // Remove from arrays
        this.roles = this.roles.filter(r => r.id !== this.deletingRole!.id);
        this.customRoles = this.customRoles.filter(r => r.id !== this.deletingRole!.id);
        
        this.applyFilters();
        this.updateStats();
        this.successMessage = `Role "${this.deletingRole?.name}" deleted successfully!`;
        this.isSubmitting = false;
        setTimeout(() => this.closeDeleteModal(), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete role.';
        this.isSubmitting = false;
      }
    });
  }

  // Helper methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getRoleValidationError(): string {
    const nameControl = this.roleForm.get('name');
    if (nameControl?.hasError('required')) {
      return 'Role name is required';
    }
    if (nameControl?.hasError('minlength')) {
      return 'Role name must be at least 2 characters';
    }
    if (nameControl?.hasError('maxlength')) {
      return 'Role name cannot exceed 50 characters';
    }
    if (nameControl?.hasError('pattern')) {
      return 'Role name must be UPPERCASE with underscores (e.g., MANAGER_ROLE)';
    }
    return '';
  }

  clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}
