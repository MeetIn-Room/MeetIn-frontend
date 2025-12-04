import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  homeRoute = "home";
  allRoomsRoute = "all-rooms";
  settingsRoute = "settings";

  userName: string | null = null;
  private router: Router = inject(Router);

  constructor() {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const obj = JSON.parse(raw);
        this.userName = obj.name || obj.username ;
      }
    } catch {
      this.userName = null;
    }
  }

  logout() {
   if(confirm("Do you really wish to Log out?")){
      localStorage.removeItem('accessToken');
      localStorage.removeItem("currentUser")
      this.router.navigate(['/auth']);
    }
  }
}
