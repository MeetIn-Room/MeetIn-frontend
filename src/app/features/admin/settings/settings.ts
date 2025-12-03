import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    // Initialize component state here if needed
  }
}
