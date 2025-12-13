import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../../core/interfaces/room';
import { formatToStandardTime } from '../booking-item/booking-item.component';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-card.component.html',
  styleUrls: ['./room-card.component.scss']
})
export class RoomCardComponent {
  @Input() room!: Room;
  @Output() book = new EventEmitter<Room>();
  @Output() viewDetails = new EventEmitter<Room>();

  ngOnInit(){
    this.room = {
      ...this.room,
      openTime: formatToStandardTime(this.room.openTime),
      closeTime: formatToStandardTime(this.room.closeTime)
    }
  }

  onBook() { this.book.emit(this.room);
    console.log('Book event emitted for room:', this.room);
  }
  onViewDetails() { this.viewDetails.emit(this.room); }
}
