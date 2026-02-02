import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role, getRoleColor } from '../../../core/interfaces/role';

/**
 * Reusable role badge component
 * Displays a role with appropriate color coding
 */
@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [class]="getBadgeClasses()"
      [title]="role?.description || role?.name"
    >
      <!-- System role shield icon -->
      <svg *ngIf="showIcon && role?.isSystem" class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      
      <!-- Custom role user icon -->
      <svg *ngIf="showIcon && !role?.isSystem" class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
      </svg>
      
      {{ role?.name || 'Unknown' }}
      
      <!-- User count badge -->
      <span 
        *ngIf="showCount && role?.userCount !== undefined && role?.userCount !== null"
        class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
        [class]="getCountBadgeClasses()"
      >
        {{ role?.userCount }}
      </span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class RoleBadgeComponent {
  @Input() role: Role | null = null;
  @Input() showIcon = true;
  @Input() showCount = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  getBadgeClasses(): string {
    if (!this.role) {
      return 'bg-gray-300 text-gray-700';
    }

    const baseClasses = getRoleColor(this.role.name, this.role.isSystem);
    const sizeClasses = this.getSizeClasses();
    
    return `${baseClasses} ${sizeClasses}`;
  }

  private getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1 text-sm';
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  }

  getCountBadgeClasses(): string {
    if (!this.role) return 'bg-gray-500 text-white';
    
    // Use a slightly darker shade for the count badge
    if (this.role.isSystem) {
      return 'bg-white bg-opacity-30 text-white';
    }
    return 'bg-white bg-opacity-30 text-white';
  }
}
