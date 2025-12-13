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

  // Helper to convert Date/string to time string (HH:MM)
  private static dateToTimeString(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Helper to convert Date/string to date string (YYYY-MM-DD)
  private static dateToDateString(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }

  // Helper to calculate duration between two times
  private static calculateDuration(startTime: Date | string, endTime: Date | string): string {
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours === 0) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`;
    } else if (diffMinutes === 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${diffHours}.5 hours`;
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
      startTime: this.dateToTimeString(backendBooking.startTime),
      endTime: this.dateToTimeString(backendBooking.endTime),
      duration: this.calculateDuration(backendBooking.startTime, backendBooking.endTime),
      purpose: backendBooking.title || 'No title',
      description: backendBooking.description || '',
      attendees: [],
      status: backendBooking.isActive ? 'Confirmed' : 'Cancelled',
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
      isActive: frontendBooking.status !== 'Cancelled'
    };
  }

  // Convert array of backend Bookings to frontend Bookings
  static toFrontendArray(backendBookings: BackendBooking[]): FrontendBooking[] {
    return backendBookings.map(booking => this.toFrontend(booking));
  }
}
