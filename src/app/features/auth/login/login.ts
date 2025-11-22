import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1>Login Page</h1>
      <p>Login component coming soon...</p>
    </div>
  `,
  styles: []
})
export class LoginComponent {}