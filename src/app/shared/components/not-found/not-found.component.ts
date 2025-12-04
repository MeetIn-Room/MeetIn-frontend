import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
    private router: Router = inject(Router)
    private location: Location = inject(Location)

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}