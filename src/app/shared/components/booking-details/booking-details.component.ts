import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking } from '../../../core/interfaces/booking';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent {
  @Input() booking!: Booking;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<Booking>();

  editing = false;
  editStart = 0;
  editEnd = 0;
  editDescription = '';

  ngOnChanges() {
    if (this.booking) {
      this.editStart = this.booking.startTime.getHours() + this.booking.startTime.getMinutes()/60;
      this.editEnd = this.booking.endTime.getHours() + this.booking.endTime.getMinutes()/60;
      this.editDescription = this.booking.description || '';
    }
    // parseFloat('0.' + 10.5.toString().split('.')[1]);
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
    this.editStart = this.booking.startTime.getHours() + this.booking.startTime.getMinutes()/60;
    this.editEnd = this.booking.endTime.getHours() + this.booking.endTime.getMinutes()/60;
    this.editDescription = this.booking.description || '';
  }

  cancelEdit() {
    this.editing = false;
  }

  saveEdit() {
    const updated: Booking = {
      ...this.booking,
      startTime: new Date(this.booking.startTime.setHours(Math.floor(this.editStart), (this.editStart % 1) * 60)),
      endTime: new Date(this.booking.endTime.setHours(Math.floor(this.editEnd), (this.editEnd % 1) * 60)),
      description: this.editDescription
    };
    this.update.emit(updated);
    this.editing = false;
  }

  doClose() {
    this.close.emit();
  }

  timeStringtoNumber(t: string): number{
    if (!t) return 0;
    const splitted = t.split(':') //e.g 10:30 -> 10 + 30/60 = 10.5
    return parseFloat(splitted[0]) + (parseFloat(splitted[1])/60)
  }

   numberToTimeString(t: number): string {
    return t.toString().split('.')[0].padStart(2, '0') + ':' + `${parseFloat('0.' + t.toString().split('.')[1]) * 60}`.padStart(2, '0');
  }
}
