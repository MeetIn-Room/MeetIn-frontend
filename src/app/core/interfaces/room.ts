export interface Room {
    id: string;
    name: string;
    capacity: number;
    openTime: Date; 
    closeTime: Date;
    amenities?: string[]; // e.g., ['Projector', 'Whiteboard']
    description?: string;
    isActive: boolean;
}
