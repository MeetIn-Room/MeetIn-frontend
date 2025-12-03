import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class HeaderComponent {
  @Input() userName: string = 'Admin User';
  @Input() userRole: string = 'Administrator';
  @Input() userInitials: string = 'DS';
} 