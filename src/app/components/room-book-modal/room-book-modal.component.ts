import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../interfaces/room';
import { Booking } from '../../interfaces/booking';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-room-book-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-book-modal.component.html',
  styleUrls: ['./room-book-modal.component.scss']
})
export class RoomBookModalComponent implements OnInit {
  @Input() room!: Room | null;
  @Output() close = new EventEmitter<void>();

  weekDays: Date[] = [];
  slotLabels: string[] = []; // human labels like 08:00, 08:30
  slotsCount = 0;
  bookingsForRoom: Booking[] = [];

  // selection
  selectedDay?: Date;
  selectionStart = -1;
  selectionEnd = -1;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.updateWeek(new Date());
    this.bookingService.bookings$.subscribe(() => this.loadBookings());
  }

  updateWeek(base: Date) {
    this.weekDays = this.getWeekDays(base);
    this.generateSlots();
    this.loadBookings();
  }

  getWeekDays(date: Date): Date[] {
    const week: Date[] = [];
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(current);
      d.setDate(diff + i);
      week.push(d);
    }
    return week;
  }

  generateSlots() {
    if (!this.room) return;
    const start = this.room.openTime;
    const end = this.room.closeTime;
    const slots: string[] = [];
    for (let h = start; h < end; h += 0.5) {
      const hh = Math.floor(h);
      const mm = (h % 1) === 0 ? '00' : '30';
      slots.push(`${hh.toString().padStart(2,'0')}:${mm}`);
    }
    this.slotLabels = slots;
    this.slotsCount = slots.length;
  }

  loadBookings() {
    if (!this.room) return;
    this.bookingsForRoom = this.bookingService.getSnapshot().filter(b => b.room?.id === this.room?.id);
  }

  isBooked(day: Date, slotIndex: number): boolean {
    const slotStart = this.indexToHour(slotIndex);
    const slotEnd = slotStart + 0.5;
    return this.bookingsForRoom.some(b => this.isSameDay(b.date, day) && !(b.endTime <= slotStart || b.startTime >= slotEnd));
  }

  indexToHour(idx: number) {
    if (!this.room) return 0;
    return this.room.openTime + idx * 0.5;
  }

  isSameDay(d1: Date, d2: Date) {
    return new Date(d1).toDateString() === new Date(d2).toDateString();
  }

  toggleSelect(day: Date, idx: number) {
    if (!this.selectedDay || !this.isSameDay(this.selectedDay, day)) {
      this.selectedDay = day;
      this.selectionStart = idx;
      this.selectionEnd = idx;
      return;
    }
    if (this.selectionStart === -1) { this.selectionStart = idx; this.selectionEnd = idx; return; }
    if (idx < this.selectionStart) this.selectionStart = idx;
    else this.selectionEnd = idx;
  }

  clearSelection() { this.selectionStart = -1; this.selectionEnd = -1; this.selectedDay = undefined; }

  bookSelected() {
    if (!this.room || this.selectionStart === -1 || !this.selectedDay) return;
    const start = this.indexToHour(this.selectionStart);
    const end = this.indexToHour(this.selectionEnd) + 0.5;
    // basic overlap check
    const overlaps = this.bookingsForRoom.some(b => this.isSameDay(b.date, this.selectedDay!) && !(b.endTime <= start || b.startTime >= end));
    if (overlaps) { alert('Selected time overlaps existing booking'); return; }

    const booking: Booking = {
      id: `bkg-${Date.now()}`,
      room: this.room,
      date: new Date(this.selectedDay),
      startTime: start,
      endTime: end,
      title: 'Booking',
      description: ''
    };
    this.bookingService.create(booking);
    this.clearSelection();
  }

  closePanel() { this.close.emit(); }
}
