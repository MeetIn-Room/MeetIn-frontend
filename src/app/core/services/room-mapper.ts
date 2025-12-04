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

  // Helper to convert time string (HH:MM) to timestamp
  private static timeStringToTimestamp(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  }

  // Helper to convert timestamp to time string (HH:MM)
  private static timestampToTimeString(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Convert backend Room to frontend Room
  static toFrontend(backendRoom: BackendRoom): FrontendRoom {
    const openTime = this.timestampToTimeString(backendRoom.openTime);
    const closeTime = this.timestampToTimeString(backendRoom.closeTime);

    return {
      id: backendRoom.id || '',
      name: backendRoom.name,
      location: backendRoom.location || 'Unknown Location',
      capacity: backendRoom.capacity,
      type: backendRoom.type || 'meeting',
      equipment: backendRoom.amenities || [],
      availabilityHours: `${openTime} - ${closeTime}`,
      utilization: Math.floor(Math.random() * 40) + 40, // Generate random until backend provides it
      status: backendRoom.isActive ? 'Available' : 'Maintenance',
      requiresApproval: false
    };
  }

  // Convert frontend Room to backend Room
  static toBackend(frontendRoom: Partial<FrontendRoom>): Partial<BackendRoom> {
    const [openTimeStr, closeTimeStr] = frontendRoom.availabilityHours
      ? frontendRoom.availabilityHours.split(' - ').map(s => s.trim())
      : ['08:00', '18:00'];

    return {
      id: frontendRoom.id || undefined,
      name: frontendRoom.name || '',
      location: frontendRoom.location,
      capacity: frontendRoom.capacity || 0,
      type: frontendRoom.type,
      amenities: frontendRoom.equipment || [],
      openTime: this.timeStringToTimestamp(openTimeStr),
      closeTime: this.timeStringToTimestamp(closeTimeStr),
      isActive: frontendRoom.status === 'Available' || frontendRoom.status === 'Occupied'
    };
  }

  // Convert array of backend Rooms to frontend Rooms
  static toFrontendArray(backendRooms: BackendRoom[]): FrontendRoom[] {
    return backendRooms.map(room => this.toFrontend(room));
  }
}
