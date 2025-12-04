export interface Room {
  id: string;
  name: string;
  location?: string;
  capacity: number;
  type?: string;
  openTime: Date;      // Timestamp
  closeTime: Date;     // Timestamp
  amenities?: string[];
  description?: string;
  isActive: boolean;
}
