import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Room } from '../../interfaces/room';
import { Booking } from '../../interfaces/booking';

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

@Component({
  selector: 'app-new-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-booking.component.html',
  styleUrls: ['./new-booking.component.scss']
})
export class NewBookingComponent {
  @Output() created = new EventEmitter<Booking>();
  @Output() cancel = new EventEmitter<void>();
  @Input({required: true}) isOpen = false;

  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);



  // In a real app the room list would be retrieved from a service. Expose a simple list here.
  availableRooms: Room[] = [
    { id: 'r-1', name: 'Conference Room A', capacity: 8, openTime: 8, closeTime: 18, amenities: ['Projector', 'Whiteboard'] },
    { id: 'r-2', name: 'Focus Room 2', capacity: 4, openTime: 8, closeTime: 18, amenities: ['Monitor'] }
  ];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    roomId: ['', Validators.required],
    description: ['']
  }, { validators: endAfterStartValidator });

  constructor() {
    // default values
    const today = new Date();
    this.form.patchValue({ date: this.toDateInput(today), startTime: '09:00', endTime: '10:00', roomId: this.availableRooms[0].id });
  }

  toDateInput(d: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const vals = this.form.value;
    const room = this.availableRooms.find(r => r.id === vals.roomId)!;
    const booking: Booking = {
      id: `bkg-${Date.now()}`,
      room,
      date: new Date(vals.date!),
      startTime: this.timeStringToHourNumber(vals.startTime!),
      endTime: this.timeStringToHourNumber(vals.endTime!),
      title: vals.title!,
      description: vals.description || ''
    };

    this.bookingService.create(booking);
    this.created.emit(booking);
  }

  timeStringToHourNumber(t: string) {
    if (!t) return 0;
    const [hh, mm] = t.split(':').map(Number);
    return hh + (mm / 60);
  }

  onCancel() {
    this.cancel.emit();
  }
}
