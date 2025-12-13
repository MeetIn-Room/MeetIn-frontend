import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { Room } from '../../../core/interfaces/room';
import { Booking } from '../../../core/interfaces/booking';
import { RoomBookingCalendarComponent, TimeSlot } from '../room-booking-calendar/room-booking-calendar.component';
import { RoomServiceService } from '../../../core/services/room.service';
import { formatToStandardTime } from '../booking-item/booking-item.component';

function endAfterStartValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startTime')?.value;
  const end = group.get('endTime')?.value;
  if (!start || !end) return null;
  const [sh, sm] = (start || '').split(':').map((n: string) => Number(n));
  const [eh, em] = (end || '').split(':').map((n: string) => Number(n));
  const s = sh + (sm / 60);
  const e = eh + (em / 60);
  return e > s ? null : { endBeforeStart: true };
}

function formatOpenCloseTime(time: string): string {
  const [hours, minutes] = time.toString().split(':').map(Number);
  // const period = hours < 12 ? 'AM' : 'PM';
  // const formattedHours = hours % 12 || 12;
  return hours + ':' + minutes;
}

@Component({
  selector: 'app-new-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-booking.component.html',
  styleUrls: ['./new-booking.component.scss'],
})
export class NewBookingComponent implements OnInit {
  @Output() created = new EventEmitter<Booking>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('select') roomDropDown!: ElementRef<HTMLSelectElement>;
  @ViewChild('calendar') calendar!: RoomBookingCalendarComponent;
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private roomService = inject(RoomServiceService);

  timeSlots: TimeSlot[] = [];
  selectedSlots: TimeSlot[] = [];
  isSelecting: boolean = false;
  className: string = '';
  selectedDate: Date = new Date();

  // Booking form modal state
  showBookingForm: boolean = false;
  bookingTitle = signal('');
  bookingDescription = signal('');

  availableRooms: Room[] = [];
  roomBookings!: Booking[]; //Bokings of a selected room
  selectedRoom!: Room; //Selected room

  form = this.fb.group(
    {
      title: ['', [Validators.required, Validators.minLength(2)]],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      roomId: ['', Validators.required],
      description: [''],
    },
    { validators: endAfterStartValidator }
  );

  constructor() {
    // default values
    const today = new Date();
    // this.form.patchValue({ date: this.toDateInput(today), startTime: '09:00', endTime: '10:00', roomId: this.availableRooms[0].id });
  }

  onTitleTypeChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.bookingTitle.set(input.value);
  }

  onDescriptionTypeChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.bookingDescription.set(input.value);
  }

  toDateInput(d: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.roomService.getRooms().subscribe({
      next: (response: Room[]) => {
        this.availableRooms = response;
      },
      error: (err: any) => alert(err),
    });
    this.onSelectChange();
  }

  onSelectChange() {
    let id = this.roomDropDown.nativeElement.value;
    this.bookingService.getBookingsByRoom(id).subscribe({
      next: (response) => {
        this.roomBookings = response;
        console.log(this.roomBookings);
        this.generateTimeSlots();
      },
      error: (err) => alert(err),
    });
    this.selectedRoom = this.availableRooms.find((r) => String(r.id) === id)!;
  }

  timeStringToHourNumber(t: string) {
    if (!t) return 0;
    const [hh, mm] = t.split(':').map(Number);
    return hh + mm / 60;
  }

  onClose() {
    this.close.emit();
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    const openTime = this.timeStringToHourNumber(
      formatOpenCloseTime(this.selectedRoom.openTime)
    );
    const closeTime = this.timeStringToHourNumber(
      formatOpenCloseTime(this.selectedRoom.closeTime)
    );

    for (let time = openTime; time < closeTime; time += 0.5) {
      if (time >= 20) break; //stop generating slots after 8 PM
      const slot: TimeSlot = {
        time: time,
        displayTime: this.formatTime(time, time + 0.5),
        isBooked: this.isSlotBooked(time),
        isSelected: false,
      };
      if (
        time < new Date().getHours() + new Date().getMinutes() / 60 - 0.5 &&
        new Date() >= this.selectedDate
      )
        slot.isBooked = true; //disable past time slots
      this.timeSlots.push(slot);
    }

    // console.log(this.timeSlots)
  }

  formatTime(time: number, nextTime: number): string {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;

    if (nextTime == 0) return `${hours}:${minutes.toString().padStart(2, '0')}`;

    const nextHours = Math.floor(nextTime);
    const nextMinutes = (nextTime % 1) * 60;

    const displayHours = hours > 12 ? hours : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes
      .toString()
      .padStart(2, '0')} - ${nextHours}:${nextMinutes
      .toString()
      .padStart(2, '0')}`;
  }

  isSlotBooked(time: number): boolean {
    for (let b of this.roomBookings) {
      if (
        this.isSameDate(b.date, this.selectedDate) &&
        time >=
          Number(formatToStandardTime(b.startTime).split(':')[0]) +
            Number(formatToStandardTime(b.startTime).split(':')[1]) / 60 &&
        time <
          Number(formatToStandardTime(b.endTime).split(':')[0]) +
            Number(formatToStandardTime(b.endTime).split(':')[1]) / 60
      )
        return true;
    }
    return false;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    const [year, month, date] = date1.toString().split('-');
    return (
      Number(year) === date2.getFullYear() &&
      Number(month) === date2.getMonth() + 1 &&
      Number(date) === date2.getDate()
    );
    // return date1.toDateString() === date2.toDateString();
  }

  onSlotMouseDown(slot: TimeSlot): void {
    if (slot.isBooked) return;

    this.isSelecting = true;
    this.selectedSlots = [slot];
    slot.isSelected = true;
  }

  onSlotMouseEnter(slot: TimeSlot): void {
    if (!this.isSelecting || slot.isBooked) return;

    const startSlot = this.selectedSlots[0];
    const startIndex = this.timeSlots.indexOf(startSlot);
    const currentIndex = this.timeSlots.indexOf(slot);

    this.timeSlots.forEach((s) => (s.isSelected = false));

    const minIndex = Math.min(startIndex, currentIndex);
    const maxIndex = Math.max(startIndex, currentIndex);

    this.selectedSlots = [];
    for (let i = minIndex; i <= maxIndex; i++) {
      if (!this.timeSlots[i].isBooked) {
        this.timeSlots[i].isSelected = true;
        this.selectedSlots.push(this.timeSlots[i]);
      } else {
        break;
      }
    }
  }

  onSlotMouseUp(): void {
    this.isSelecting = false;

    if (this.selectedSlots.length > 0) {
      this.showBookingForm = true;
    }
  }

  confirmBooking(): void {
    if (this.selectedSlots.length === 0 || !this.bookingTitle().trim()) {
      alert('Please provide a title for the booking');
      return;
    }

    const startTime = Math.min(...this.selectedSlots.map((s) => s.time));
    const endTime = Math.max(...this.selectedSlots.map((s) => s.time)) + 0.5;

    // console.log({startTime, endTime})

    const newBooking: Booking = {
      id: '',
      room: this.selectedRoom,
      date: new Date(this.selectedDate),
      startTime: this.numberToTimeString(
        this.timeStringToHourNumber(
          Math.floor(startTime) + ':' + (startTime % 1) * 60
        )
      ),
      endTime: this.numberToTimeString(
        this.timeStringToHourNumber(
          Math.floor(endTime) + ':' + (endTime % 1) * 60
        )
      ),
      title: this.bookingTitle(),
      description: this.bookingDescription(),
      userId: JSON.parse(localStorage.getItem('currentUser')!).id,
      isActive: true,
    };

    this.created.emit(newBooking);
    this.roomBookings.push(newBooking);
    this.cancelBookingForm();
    this.generateTimeSlots();
    console.log({ startTime, endTime });
  }

  cancelBookingForm(): void {
    this.showBookingForm = false;
    this.bookingTitle.set('');
    this.bookingDescription.set('');
    this.selectedSlots.forEach((slot) => (slot.isSelected = false));
    this.selectedSlots = [];
  }

  isFirstSlotOfBooking(slot: TimeSlot): boolean {
    // if (!slot.booking) return false;
    return (
      slot.time ===
      Number(formatToStandardTime(slot.booking!.startTime).split(':')[0]) +
        Number(formatToStandardTime(slot.booking!.startTime).split(':')[1]) / 60
    );
  }

  changeDate(days: number): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const yesterday = new Date().setDate(new Date().getDate() - 1);
    if (newDate <= new Date(yesterday)) return; //prevent selecting past dates
    this.selectedDate = newDate;
    this.generateTimeSlots();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.generateTimeSlots();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  timeStringtoNumber(t: string): number {
    if (!t) return 0;
    const splitted = t.split(':'); //e.g 10:30 -> 10 + 30/60 = 10.5
    return parseFloat(splitted[0]) + parseFloat(splitted[1]) / 60;
  }

  numberToTimeString(t: number): string {
    return (
      t.toString().split('.')[0].padStart(2, '0') +
      ':' +
      `${parseFloat('0.' + t.toString().split('.')[1]) * 60}`.padStart(2, '0')
    );
  }
}


