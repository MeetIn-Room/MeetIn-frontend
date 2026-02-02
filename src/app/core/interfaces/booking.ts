// src/app/core/interfaces/booking.ts
// This matches your actual backend BookingDTO structure

import { Role } from './role';
import {Room} from './room';

export interface Booking {
  id: string;
  room: Room
  userId: string;
  date: Date ;
  startTime: Date | string ;
  endTime: Date | string;
  title: string;
  description: string;
  isActive?: boolean;
  active?: boolean;
  color?: string;
}
