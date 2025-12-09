import { AfterViewInit, Component, ElementRef, inject, OnInit, QueryList, ViewChild, ViewChildren, viewChildren } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { BookingItemComponent, formatTime } from '../../../shared/components/booking-item/booking-item.component';
import { Booking } from '../../../core/interfaces/booking';
import { CommonModule } from '@angular/common';
import { WeeklyCalendarComponent } from '../../../shared/components/weekly-calendar/weekly-calendar.component';
import { BookingService } from '../../../core/services/booking.service';
import { NewBookingComponent } from '../../../shared/components/new-booking/new-booking.component';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../../core/interfaces/auth';

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

  currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
  latest = true;
  _latest = this.latest; //Previous state of the ordering of bookings to detect ordering changes from the select input

  @ViewChild('sortSelect') sortSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('details') details!: ElementRef<HTMLDivElement>;
  startTimeString: any;
  endTimeString: any;
  bookings: Booking[] = [];

  private bookingService = inject(BookingService);
  showMoreOptions!: boolean;

  ngOnInit(): void {
    // subscribe to service updates
    this.bookingService.getBoookings().subscribe({
      next: (response) => {
        this.bookings = response.filter((book) => book.userId === this.currentUserSubject.getValue().id.toString() && book.isActive)
        this.sortElements(this.latest ? -1 : 1);
        console.log("Bookings " + this.bookings.length, this.bookings);

      },
      error: (err) => { alert("Error fetching bookings "+ err); console.error('error', err); }
    })
  }

  // ngAfterViewInit(): void {
  //   this.viewBookings.forEach((b) => {
  //     if(b.isClicked) this.selected = b;
  //   })
  // }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  onShowBookingDetails(b: Booking){
    this.bookingDetails = b
    this.showDetails = true
    this.startTimeString = formatTime(b.startTime)
    this.endTimeString = formatTime(b.endTime)
  }

  sortBookings(){
    this.latest = this.sortSelect.nativeElement.value === 'latest';
    if(this._latest !== this.latest){ //Sort only if there is a change in the ordering
      this._latest = this.latest;
      this.sortElements(this.latest ? -1 : 1);
    }
  }

  sortElements(val: number){
    this.bookings = this.bookings.sort((a, b) => a.date.toString() > b.date.toString() && a.startTime.toString() > b.startTime.toString() ? val : -val);
  }

  onCancelBooking(id: string) {
    this.bookingService.remove(id);
  }

  onUpdateBooking(updated: Booking) {
    this.bookingService.update(updated);
  }

  openNewBookingModal() { this.showNewBookingModal = true; }
  closeNewBookingModal() { 
    this.showNewBookingModal = false;
  }

  onNewCreated(b: Booking) {
    this.showNewBookingModal = false;
    // booking already added by service; if you need extra handling, do it here
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
    console.log(this.selected)
  }

  onShowTooltips(){
    this.showMoreOptions = true
  }

}
