import { Booking as BackendBooking } from '../interfaces/booking';

// Frontend Booking interface (from component)
export interface FrontendBooking {
  id: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  purpose: string;
  description?: string;
  attendees: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  specialRequirements?: string;
  selected: boolean;
}

export class BookingMapper {

  // Helper to convert time to string (HH:MM)
  // Backend sends LocalTime as "HH:mm:ss" or full datetime
  private static timeToString(time: Date | string): string {
    if (typeof time === 'string') {
      // If it's a time string like "08:00:00" or "08:00", extract HH:MM
      if (time.includes('T')) {
        // Full datetime string like "2025-12-13T08:00:00"
        const timePart = time.split('T')[1];
        const [hours, minutes] = timePart.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      } else if (time.includes(':')) {
        // Time string like "08:00:00" or "08:00"
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }
      return time;
    }
    // If it's a Date object
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Helper to convert Date/string to date string (YYYY-MM-DD)
  private static dateToDateString(date: Date | string): string {
    if (typeof date === 'string') {
      // If already a date string like "2025-12-13", return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // If it's a full datetime, extract date part
      if (date.includes('T')) {
        return date.split('T')[0];
      }
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return dateObj.toISOString().split('T')[0];
  }

  // Helper to calculate duration between two times
  // Handles both time strings ("08:00:00") and full datetime strings
  private static calculateDuration(startTime: Date | string, endTime: Date | string, dateStr?: string): string {
    let startMinutes: number;
    let endMinutes: number;

    // Parse start time to minutes since midnight
    if (typeof startTime === 'string') {
      const timePart = startTime.includes('T') ? startTime.split('T')[1] : startTime;
      const [hours, minutes] = timePart.split(':').map(Number);
      startMinutes = (hours || 0) * 60 + (minutes || 0);
    } else {
      startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    }

    // Parse end time to minutes since midnight
    if (typeof endTime === 'string') {
      const timePart = endTime.includes('T') ? endTime.split('T')[1] : endTime;
      const [hours, minutes] = timePart.split(':').map(Number);
      endMinutes = (hours || 0) * 60 + (minutes || 0);
    } else {
      endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    }

    const diffMinutes = endMinutes - startMinutes;
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    if (isNaN(diffMinutes) || diffMinutes <= 0) {
      return '1 hour'; // Default fallback
    }

    if (diffHours === 0) {
      return `${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
    } else if (remainingMinutes === 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    } else {
      const hours = diffHours + remainingMinutes / 60;
      return `${hours.toFixed(1)} hours`;
    }
  }

  // Helper to format datetime for display
  private static formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString();
  }

  // Convert backend Booking to frontend Booking
  static toFrontend(backendBooking: BackendBooking): FrontendBooking {
    // Extract date from either date field or startTime
    const bookingDate = backendBooking.date
      ? this.dateToDateString(backendBooking.date)
      : this.dateToDateString(backendBooking.startTime);

    return {
      id: backendBooking.id || '',
      userName: 'User Name', // You'll need to fetch this from user service using userId
      userEmail: '', // Fetch from user service
      userDepartment: '', // Fetch from user service
      roomName: backendBooking.room?.name || 'Unknown Room',
      date: bookingDate,
      startTime: this.timeToString(backendBooking.startTime),
      endTime: this.timeToString(backendBooking.endTime),
      duration: this.calculateDuration(backendBooking.startTime, backendBooking.endTime, bookingDate),
      purpose: backendBooking.title || 'No title',
      description: backendBooking.description || '',
      attendees: [],
      status: (backendBooking.isActive ?? (backendBooking as any).active ?? true) ? 'Confirmed' : 'Cancelled',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      specialRequirements: '',
      selected: false
    };
  }

  // Convert frontend Booking to backend Booking
  static toBackend(frontendBooking: Partial<FrontendBooking>, userId: string, roomId: string): Partial<BackendBooking> {
    // Combine date and time to create full DateTime objects
    const dateStr = frontendBooking.date || new Date().toISOString().split('T')[0];
    const startTimeStr = frontendBooking.startTime || '09:00';
    const endTimeStr = frontendBooking.endTime || '10:00';

    const startDateTime = new Date(`${dateStr}T${startTimeStr}:00`);
    const endDateTime = new Date(`${dateStr}T${endTimeStr}:00`);

    return {
      id: frontendBooking.id,
      room: roomId ? { id: roomId } as any : undefined,
      userId: userId,
      date: dateStr as any,
      startTime: startDateTime as any,
      endTime: endDateTime as any,
      title: frontendBooking.purpose || '',
      description: frontendBooking.description || '',
      isActive: frontendBooking.status !== 'Cancelled',
      active: frontendBooking.status !== 'Cancelled'
    };
  }

  // Convert array of backend Bookings to frontend Bookings
  static toFrontendArray(backendBookings: BackendBooking[]): FrontendBooking[] {
    return backendBookings.map(booking => this.toFrontend(booking));
  }
}
