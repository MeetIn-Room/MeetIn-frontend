import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../../core/interfaces/room';
import { formatToStandardTime } from '../booking-item/booking-item.component';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.scss']
})
export class RoomDetailsComponent {
  @Input() room!: Room | null;
  @Output() close = new EventEmitter<void>();

  ngOnInit(){
    console.log(this.room)
  }


  closePanel() { this.close.emit(); }
}
