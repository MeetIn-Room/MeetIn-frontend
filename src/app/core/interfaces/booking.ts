import { Room } from "./room";

export interface Booking {
    id: string;
    room: Room;
    date: Date;
    startTime: number; // in hours, e.g., 9 for 9 AM
    endTime: number; // in hours, e.g., 11.5 for 11:30 AM
    title: string;
    description: string;
    color?: string;
    userId: string;
}
