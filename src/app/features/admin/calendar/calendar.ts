 import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbarAdmin/navbar';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})

export class CalendarComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    // Initialize component state here if needed
  }

}
