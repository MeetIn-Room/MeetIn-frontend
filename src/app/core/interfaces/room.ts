export interface Room {
  id: string;
  name: string;
  location?: string;
  capacity: number;
  type?: string;
  openTime: number;      // Timestamp
  closeTime: number;     // Timestamp
  amenities: string[];
  description?: string;
  isActive: boolean;
}
