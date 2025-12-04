import { Room as BackendRoom } from '../interfaces/room';

// Frontend Room interface (from component)
export interface FrontendRoom {
  id: string;
  name: string;
  location: string;
  capacity: number;
  type: string;
  equipment: string[];
  availabilityHours: string;
  utilization: number;
  status: string;
  nextBooking?: {
    time: string;
    user: string;
  };
  requiresApproval?: boolean;
}

export class RoomMapper {

  // Helper to parse time string from backend (could be Date or string)
  private static parseTimeToString(time: Date | string): string {
    if (typeof time === 'string') {
      // If it's already a string like "08:00" or "08:00:00", extract HH:MM
      const timePart = time.includes('T') ? time.split('T')[1] : time;
      const [hours, minutes] = timePart.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    // If it's a Date object
    const dateObj = new Date(time);
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Convert backend Room to frontend Room
  static toFrontend(backendRoom: BackendRoom): FrontendRoom {
    const openTime = this.parseTimeToString(backendRoom.openTime);
    const closeTime = this.parseTimeToString(backendRoom.closeTime);

    return {
      id: backendRoom.id || '',
      name: backendRoom.name,
      location: backendRoom.location || 'Unknown Location',
      capacity: backendRoom.capacity,
      type: backendRoom.type || 'meeting',
      equipment: backendRoom.amenities || [],
      availabilityHours: `${openTime} - ${closeTime}`,
      utilization: Math.floor(Math.random() * 40) + 40,
      status: backendRoom.isActive ? 'Available' : 'Maintenance',
      requiresApproval: false
    };
  }

  // Convert frontend Room to backend Room
  // Backend expects time strings like "08:00" (HH:mm format)
  static toBackend(frontendRoom: Partial<FrontendRoom>): any {
    const [openTimeStr, closeTimeStr] = frontendRoom.availabilityHours
      ? frontendRoom.availabilityHours.split(' - ').map(s => s.trim())
      : ['08:00', '18:00'];

    // Format time as HH:MM for backend (no seconds)
    const formatTime = (timeStr: string): string => {
      const [hours, minutes] = timeStr.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    return {
      id: frontendRoom.id || undefined,
      name: frontendRoom.name || '',
      location: frontendRoom.location,
      capacity: frontendRoom.capacity || 0,
      type: frontendRoom.type,
      amenities: frontendRoom.equipment || [],
      openTime: formatTime(openTimeStr),
      closeTime: formatTime(closeTimeStr),
      isActive: frontendRoom.status === 'Available' || frontendRoom.status === 'Maintenance'
    };
  }

  // Convert array of backend Rooms to frontend Rooms
  static toFrontendArray(backendRooms: BackendRoom[]): FrontendRoom[] {
    return backendRooms.map(room => this.toFrontend(room));
  }
}
