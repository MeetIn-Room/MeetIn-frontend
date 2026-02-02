import { Component, Input } from '@angular/core';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable room access indicator component
 * Shows lock status and allowed roles for a room
 */
@Component({
  selector: 'app-room-access-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="room-access-indicator">
      <!-- Open Access - No Restrictions -->
      <div *ngIf="!isRestricted" class="flex items-center text-green-600">
        <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
        </svg>
        <span class="text-sm font-medium">Open to all roles</span>
      </div>

      <!-- Restricted Access -->
      <div *ngIf="isRestricted" class="space-y-1">
        <div class="flex items-center text-amber-600">
          <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span class="text-sm font-medium">Restricted access</span>
        </div>
        
        <!-- Show allowed roles -->
        <div class="flex flex-wrap gap-1 ml-5">
          <span class="text-xs text-gray-500">Allowed roles:</span>
          <span 
            *ngFor="let role of displayedRoles" 
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            [class]="getRoleBadgeClass(role)"
          >
            {{ role }}
          </span>
          <span *ngIf="hasMoreRoles" class="text-xs text-gray-400">
            +{{ allowedRoles.length - maxDisplayRoles }} more
          </span>
        </div>

        <!-- User's access status -->
        <div *ngIf="showUserStatus && currentUserRole" class="ml-5 text-xs">
          <span *ngIf="canAccess" class="text-green-600 font-medium">
            ✓ Your role ({{ currentUserRole }}) can book this room
          </span>
          <span *ngIf="!canAccess && !isAdmin" class="text-red-600">
            ✗ Your role ({{ currentUserRole }}) cannot book this room
          </span>
          <span *ngIf="isAdmin" class="text-blue-600 font-medium">
            ✓ Admin override - you can book any room
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .room-access-indicator {
      line-height: 1.4;
    }
  `]
})
export class RoomAccessIndicatorComponent {
  @Input() allowedRoles: string[] = [];
  @Input() currentUserRole: string | null = null;
  @Input() isAdmin = false;
  @Input() showUserStatus = true;
  @Input() maxDisplayRoles = 3;

  get isRestricted(): boolean {
    return this.allowedRoles && this.allowedRoles.length > 0;
  }

  get displayedRoles(): string[] {
    if (!this.allowedRoles) return [];
    return this.allowedRoles.slice(0, this.maxDisplayRoles);
  }

  get hasMoreRoles(): boolean {
    return this.allowedRoles && this.allowedRoles.length > this.maxDisplayRoles;
  }

  get canAccess(): boolean {
    if (!this.isRestricted) return true;
    if (this.isAdmin) return true;
    if (!this.currentUserRole) return false;
    return this.allowedRoles.includes(this.currentUserRole);
  }

  getRoleBadgeClass(roleName: string): string {
    // Simple color mapping for role badges
    const colors: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-800',
      'USER': 'bg-blue-100 text-blue-800',
      'MANAGER': 'bg-green-100 text-green-800',
      'HR': 'bg-yellow-100 text-yellow-800',
      'EXECUTIVE': 'bg-purple-100 text-purple-800',
      'TEAM_LEAD': 'bg-pink-100 text-pink-800',
      'FINANCE': 'bg-orange-100 text-orange-800',
      'IT': 'bg-cyan-100 text-cyan-800',
      'MARKETING': 'bg-indigo-100 text-indigo-800',
      'SALES': 'bg-teal-100 text-teal-800'
    };
    
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  }
}
