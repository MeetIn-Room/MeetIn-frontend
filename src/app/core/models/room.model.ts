export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities?: string[];
  availabilityHours?: {
    start: string; // e.g., "08:00"
    end: string;   // e.g., "18:00"
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}