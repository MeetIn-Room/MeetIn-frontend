import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  private router = inject(Router);
  

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },
    {
      label: 'User Management',
      icon: 'users',
      route: '/admin/users'
    },
    {
      label: 'Role Management',
      icon: 'shield',
      route: '/admin/roles'
    },
    {
      label: 'Rooms Management',
      icon: 'rooms',
      route: '/admin/rooms'
    },
    {
      label: 'Booking Dashboard',
      icon: 'bookings',
      route: '/admin/bookings'
    }
  ];

  generalItems: MenuItem[] = [
    {
      label: 'Calendar',
      icon: 'calendar',
      route: '/admin/calendar'
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/admin/settings'
    }
  ];

  logout(): void {
    // Add your logout logic here (clear tokens, etc.)
    if(confirm("Do you really wish to Log out?")){
      localStorage.removeItem('accessToken');
      localStorage.removeItem("currentUser")
      this.router.navigate(['/auth']);
    }
  }
}
