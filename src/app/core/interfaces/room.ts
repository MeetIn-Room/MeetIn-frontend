export interface Room {
    id: string;
    name: string;
    capacity: number;
    openTime: number; 
    closeTime: number;
    amenities: string[];// e.g., ['Projector', 'Whiteboard']
    description?: string;
    isActive: boolean;
}
