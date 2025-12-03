import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomBookingCalendarComponent } from './room-booking-calendar.component';

describe('RoomBookingCalendarComponent', () => {
  let component: RoomBookingCalendarComponent;
  let fixture: ComponentFixture<RoomBookingCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomBookingCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomBookingCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
