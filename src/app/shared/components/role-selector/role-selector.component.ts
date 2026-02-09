import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Role, RoleDisplay, getRoleColor } from '../../../core/interfaces/role';
import { RoleService } from '../../../core/services/role.service';

/**
 * Reusable role selector component
 * Supports single or multi-select, with optional filtering
 */
@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="role-selector">
      <!-- Single Select Mode -->
      <div *ngIf="!multiple" class="relative">
        <select
          [ngModel]="selectedRoleId"
          (ngModelChange)="onSingleSelect($event)"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          [disabled]="loading || disabled"
        >
          <option value="">{{ placeholder }}</option>
          <option *ngFor="let role of roles" [value]="role.id">
            {{ role.name }}
            <span *ngIf="role.system" class="text-gray-500"> (System)</span>
          </option>
        </select>
        <div *ngIf="loading" class="absolute right-8 top-2">
          <span class="text-gray-400 text-sm">Loading...</span>
        </div>
      </div>

      <!-- Multi Select Mode -->
      <div *ngIf="multiple" class="space-y-2">
        <div class="flex flex-wrap gap-2">
          <div
            *ngFor="let role of roles"
            class="role-option cursor-pointer"
            (click)="toggleRole(role)"
          >
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors"
              [class]="isSelected(role) ? getRoleColorClass(role) : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              <span *ngIf="isSelected(role)" class="mr-1">✓</span>
              {{ role.name }}
            </span>
          </div>
        </div>
        <div *ngIf="loading" class="text-gray-500 text-sm">Loading roles...</div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="mt-1 text-red-600 text-sm">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .role-selector {
      min-width: 200px;
    }
    .role-option {
      user-select: none;
    }
  `]
})
export class RoleSelectorComponent implements OnInit {
  @Input() multiple = false;
  @Input() excludeSystem = false;
  @Input() placeholder = 'Select a role';
  @Input() disabled = false;
  @Input() selectedRoleId: string | number = '';
  @Input() selectedRoleIds: (string | number)[] = [];

  @Output() roleSelected = new EventEmitter<Role | RoleDisplay | null>();
  @Output() rolesSelected = new EventEmitter<RoleDisplay[]>();

  private roleService = inject(RoleService);

  roles: RoleDisplay[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.loading = true;
    this.error = null;

    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles.map(role => ({
          ...role,
          color: getRoleColor(role.name, role.system ?? true),
          selected: this.isRoleSelected(role.id)
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load roles';
        this.loading = false;
        console.error('Error loading roles:', err);
      }
    });
  }

  private isRoleSelected(roleId: string | number): boolean {
    if (this.multiple) {
      return this.selectedRoleIds.includes(roleId);
    }
    return this.selectedRoleId === roleId;
  }

  onSingleSelect(roleId: string | number): void {
    this.selectedRoleId = roleId;
    const selectedRole = this.roles.find(r => r.id === roleId);
    this.roleSelected.emit(selectedRole || null);
  }

  toggleRole(role: RoleDisplay): void {
    role.selected = !role.selected;

    const selectedRoles = this.roles.filter(r => r.selected);
    this.rolesSelected.emit(selectedRoles);
  }

  isSelected(role: RoleDisplay): boolean {
    return role.selected || false;
  }

  getRoleColorClass(role: RoleDisplay): string {
    return role.color || 'bg-gray-500 text-white';
  }

  /**
   * Reset selections
   */
  reset(): void {
    this.roles.forEach(role => role.selected = false);
    this.selectedRoleId = '';
    this.selectedRoleIds = [];
  }

  /**
   * Get currently selected roles (for multi-select)
   */
  getSelectedRoles(): RoleDisplay[] {
    return this.roles.filter(r => r.selected);
  }

  /**
   * Set selected roles programmatically (for multi-select)
   */
  setSelectedRoles(roleIds: (string | number)[]): void {
    this.selectedRoleIds = roleIds;
    this.roles.forEach(role => {
      role.selected = roleIds.includes(role.id);
    });
  }
}
