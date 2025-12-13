import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking } from '../../../core/interfaces/booking';
import { formatToStandardTime } from '../booking-item/booking-item.component';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnChanges {

  @Input() booking!: Booking;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<Booking>();
  // @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  editing = false;
  editDate!: Date;
  editStart!: string;
  editEnd!: string;
  editDescription = '';
  startTimeString = '';
  endTimeString = '';

  ngOnChanges() {
    if (this.booking) {
      this.editDate = this.booking.date;

      // Safely convert startTime / endTime to ISO strings
      this.editStart = this.normalizeToISOString(this.booking.startTime);
      this.editEnd = this.normalizeToISOString(this.booking.endTime);

      this.editDescription = this.booking.description || '';
    }
  }

  isValid() {
    return this.booking.date > new Date();
  }

  ngOnInit() {
    this.startTimeString = formatToStandardTime(this.booking.startTime);
    this.endTimeString = formatToStandardTime(this.booking.endTime);
  }

  /** Convert string | Date to ISO string */
  private normalizeToISOString(value: string | Date): string {
    return typeof value === 'string' ? new Date(value).toISOString() : value.toISOString();
  }

  toLocalInput(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  }

  fromLocalInput(value: string) {
    if (!value) return '';
    const d = new Date(value);
    return d.toISOString();
  }

  startEdit() {
    this.editing = true;
    this.editStart = this.normalizeToISOString(this.booking.startTime);
    this.editEnd = this.normalizeToISOString(this.booking.endTime);
    this.editDescription = this.booking.description || '';
    this.editDate = this.booking.date;
  }

  cancelEdit() {
    this.editing = false;
  }

  saveEdit() {
    const updated: Booking = {
      ...this.booking,
      startTime: this.editStart,
      endTime: this.editEnd,
      description: this.editDescription
    };
    this.update.emit(updated);
    this.editing = false;
  }

  doClose() {
    this.editing = false;
    this.close.emit();
  }

  timeStringtoNumber(t: string | Date): number {
    let str = typeof t === 'string' ? t : t.toTimeString().slice(0, 5); // "HH:MM"
    const splitted = str.split(':');
    return parseFloat(splitted[0]) + (parseFloat(splitted[1]) / 60);
  }

  numberToTimeString(t: number): string {
    const hours = Math.floor(t).toString().padStart(2, '0');
    const minutes = Math.round((t - Math.floor(t)) * 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
