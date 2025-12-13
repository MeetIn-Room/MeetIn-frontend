// src/app/core/interfaces/booking.ts
// This matches your actual backend BookingDTO structure

import {Room} from './room';

export interface Booking {
  id: string;
  room: Room
  userId: string;
  date: Date ;
  startTime: Date;
  endTime: Date;
  title: string;
  description: string;
  isActive?: boolean;
  color?: string;
}
