import { Room } from "./room";

export interface Booking {
    id: string;
    room: Room;
    date: Date;
    startTime: string; 
    endTime: string;
    title: string;
    description: string;
    userId: string;
    isActive: boolean;
}
