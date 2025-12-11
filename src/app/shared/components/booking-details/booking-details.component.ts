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
  editStart!: Date;
  editEnd!: Date;
  editDescription = '';
  startTimeString = '';
  endTimeString = '';

  ngOnChanges() {
    if (this.booking) {
      this.editDate = this.booking.date;
      this.editStart = this.booking.startTime;
      this.editEnd = this.booking.endTime;
      this.editDescription = this.booking.description || '';
    }
   
    // parseFloat('0.' + 10.5.toString().split('.')[1]);
  }

  isValid(){
    return this.booking.date > new Date()
  }



  ngOnInit(){
    this.startTimeString = formatToStandardTime(this.booking.startTime);
    this.endTimeString = formatToStandardTime(this.booking.endTime);
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
    this.editStart = this.booking.startTime;
    this.editEnd = this.booking.endTime;
    this.editDescription = this.booking.description || '';
    this.editDate = this.booking.date;
  }

  cancelEdit() {
  }

  saveEdit() {
    const updated: Booking = {
      ...this.booking,
      startTime: new Date(this.editStart),
      endTime: new Date(this.editEnd),
      description: this.editDescription
    };
    this.update.emit(updated);
    this.editing = false;
  }

  doClose() {
    this.editing = false;
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
