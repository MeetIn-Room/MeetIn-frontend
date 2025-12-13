import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';
import { UserServiceService } from '../../../core/services/user-service.service';

interface SystemSettings {
  // General Settings
  applicationName: string;
  timeZone: string;
  defaultBookingDuration: number;
  
  // Booking Settings
  maxAdvanceBookingDays: number;
  minCancellationNotice: number;
  allowRecurringBookings: boolean;
  approvalThreshold: number;
  
  // Notification Settings
  sendBookingConfirmations: boolean;
  sendReminders: boolean;
  reminderTime: number;
  reminderUnit: string;
  notifyOnMaintenance: boolean;
  
  // User Management
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  sessionTimeout: number;
  
  // Room Management
  defaultRoomStatus: string;
  defaultOpenTime: string;
  defaultCloseTime: string;
  defaultRoomType: string;
  bookingCleanupDays: number;
  
  // System Integration
  enableCalendarSync: boolean;
  apiRateLimit: number;
  enableAuditLogging: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {
  settings: SystemSettings;
  isSaving: boolean = false;
  originalSettings: SystemSettings;

  constructor(private userService: UserServiceService) {
    this.settings = this.getDefaultSettings();
    this.originalSettings = { ...this.settings };
  }

  ngOnInit() {
    this.loadSettings();
  }

  getDefaultSettings(): SystemSettings {
    return {
      // General Settings
      applicationName: 'Meeting Room Booking System',
      timeZone: 'UTC',
      defaultBookingDuration: 60, // minutes
      
      // Booking Settings
      maxAdvanceBookingDays: 30,
      minCancellationNotice: 60, // minutes
      allowRecurringBookings: true,
      approvalThreshold: 20, // people
      
      // Notification Settings
      sendBookingConfirmations: true,
      sendReminders: true,
      reminderTime: 15,
      reminderUnit: 'minutes',
      notifyOnMaintenance: true,
      
      // User Management
      allowSelfRegistration: false,
      requireEmailVerification: true,
      defaultUserRole: 'USER',
      sessionTimeout: 30, // minutes
      
      // Room Management
      defaultRoomStatus: 'Available',
      defaultOpenTime: '08:00',
      defaultCloseTime: '18:00',
      defaultRoomType: 'meeting',
      bookingCleanupDays: 90, // days
      
      // System Integration
      enableCalendarSync: false,
      apiRateLimit: 100, // requests per minute
      enableAuditLogging: true
    };
  }

  loadSettings(): void {
    // In a real application, you would load settings from your backend
    // For now, we'll use localStorage to simulate persistence
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        this.settings = { ...this.getDefaultSettings(), ...parsedSettings };
        this.originalSettings = { ...this.settings };
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }

  saveSettings(): void {
    this.isSaving = true;
    
    // In a real application, you would save to your backend
    // Since you mentioned using existing backend, we could:
    // 1. Store in a system settings table if you have one
    // 2. Use the user service to store admin preferences
    // 3. Store in application configuration
    
    // For now, we'll simulate saving with localStorage
    setTimeout(() => {
      localStorage.setItem('systemSettings', JSON.stringify(this.settings));
      this.originalSettings = { ...this.settings };
      this.isSaving = false;
      this.showNotification('Settings saved successfully!');
      
      // Apply settings that need immediate effect
      this.applySettings();
    }, 1000);
  }

  applySettings(): void {
    // Apply settings that need immediate effect in the application
    // Example: Update application title
    if (this.settings.applicationName) {
      document.title = this.settings.applicationName;
    }
    
    // Example: Store settings in a service for other components to use
    // this.settingsService.setSettings(this.settings);
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      this.settings = this.getDefaultSettings();
      this.saveSettings();
    }
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.settings) !== JSON.stringify(this.originalSettings);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }

  showNotification(message: string): void {
    // You can use a toast service here
    alert(message);
  }
}