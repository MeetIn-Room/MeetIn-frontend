import { RoomServiceService } from './../../../core/services/room.service';
import { AfterViewInit, Component, ElementRef, HostListener, inject, OnInit, QueryList, ViewChild, ViewChildren, viewChildren } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { BookingItemComponent, formatToStandardTime } from '../../../shared/components/booking-item/booking-item.component';
import { Booking } from '../../../core/interfaces/booking';
import { CommonModule } from '@angular/common';
import { WeeklyCalendarComponent } from '../../../shared/components/weekly-calendar/weekly-calendar.component';
import { BookingService } from '../../../core/services/booking.service';
import { NewBookingComponent } from '../../../shared/components/new-booking/new-booking.component';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../../core/interfaces/auth';
import { RoomBookingCalendarComponent } from '../../../shared/components/room-booking-calendar/room-booking-calendar.component';
import { RoomServiceService } from '../../../core/services/room.service';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    BookingItemComponent,
    CommonModule,
    WeeklyCalendarComponent,
    NewBookingComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  showCalendar = false;
  showNewBookingModal = false;
  showDetails = false;
  bookingDetails!: Booking;
  selected!: Element
  showMoreOptions!: boolean;


  currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
  latest = true;
  _latest = this.latest; //Previous state of the ordering of bookings to detect ordering changes from the select input

  @ViewChild('sortSelect') sortSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('details') details!: ElementRef<HTMLDivElement>;
  @ViewChild('options') options!: ElementRef<HTMLDivElement>
  startTimeString: any;
  endTimeString: any;
  bookings: Booking[] = [];

  private bookingService = inject(BookingService);
  private roomService = inject(RoomServiceService)

  ngOnInit(): void {

    // subscribe to service updates
    this.bookingService.getBookings().subscribe({
      next: (response) => {
        this.bookings = response.filter((book) => book.userId === this.currentUserSubject.getValue().id.toString() && book.isActive)
        this.sortElements(this.latest ? -1 : 1);

      },
      error: (err) => { alert("Error fetching bookings "+ err); console.error('error', err); }
    })
  }

  @HostListener('document:click', ['$event'])
  handleOutClick(ev: MouseEvent){
    const target = ev.target as HTMLElement;
    if(!this.options.nativeElement.contains(target)) this.showMoreOptions = false

  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  onShowBookingDetails(b: Booking){
    this.bookingDetails = b
    this.showDetails = true
    this.startTimeString = formatToStandardTime(b.startTime)
    this.endTimeString = formatToStandardTime(b.endTime)
  }

  sortBookings(){
    this.latest = this.sortSelect.nativeElement.value === 'latest';
    if(this._latest !== this.latest){ //Sort only if there is a change in the ordering
      this._latest = this.latest;
      this.sortElements(this.latest ? -1 : 1);
    }
  }

  sortElements(val: number){
    this.bookings = this.bookings.sort((a, b) => a.date >= b.date && a.startTime > b.startTime  ? val : -val);
  }

  onCancelBooking(id: string) {
    this.bookingService.deleteBooking(parseInt(id, 10)).subscribe({

    });
  }

  onUpdateBooking(updated: Booking) {
    this.bookingService.updateBooking(parseInt(updated.id, 10),updated).subscribe({

    });
  }

  openNewBookingModal() { this.showNewBookingModal = true; }
  closeNewBookingModal() {
    this.showNewBookingModal = false;
  }

  onNewCreated(b: Booking) {
    console.log('New booking created:', b);
    this.bookingService.create(b);
    this.showNewBookingModal = false;
    // location.reload()
  }

  onNewCancelled() { this.showNewBookingModal = false; }

  doClose(){
    this.showDetails = false;
    this.selected.firstElementChild!.classList.remove('active')
    this.showMoreOptions = false
  }

  handleClick(bookItemId: number){
    if(this.selected) this.selected.firstElementChild!.classList.remove('active')
    this.selected = document.querySelector("#book-" + bookItemId)!
    this.selected!.firstElementChild!.classList.add('active')
  }

  onShowTooltips(){
    this.showMoreOptions = true
  }

}
