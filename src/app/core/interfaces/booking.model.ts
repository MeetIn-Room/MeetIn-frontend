export interface Booking {
  id: string;
  roomId: string;
  roomName?: string;
  userId: string;
  userName?: string;
  startTime: Date;
  endTime: Date;
  title: string;
  description?: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingRequest {
  roomId: string;
  startTime: Date;
  endTime: Date;
  title: string;
  description?: string;
}

export interface UpdateBookingRequest {
  startTime?: Date;
  endTime?: Date;
  title?: string;
  description?: string;
}