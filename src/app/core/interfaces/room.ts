export interface Room {
  id: string;
  name: string;
  location?: string;
  capacity: number;
  type?: string;
  openTime: string;
  closeTime: string;
  amenities?: string[];
  description?: string;
  isActive: boolean;
  active?: boolean;
}
