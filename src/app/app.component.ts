import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UserService } from './services/user.service';
import { register } from 'swiper/element/bundle';

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, CommonModule],
})
export class AppComponent {
  public appPages = [{ title: 'Home', url: '/home', icon: 'home' }];
  public logoutPages = [{ title: 'Logout', func: 'logout()', icon: 'log-out' }];
  private isLogged: boolean;

  constructor(private userService: UserService, private router: Router) {
    // isLogged is use to check if USER has logged in.
    this.isLogged = this.userService.tokenValue ? true : false;
    // Check if User has done the first time setup, if not show it
    if (!localStorage.getItem('welcomeCompleted')) {
      this.router.navigateByUrl('/welcome');
    }
  }

  // Calling the logout function in serice
  logout() {
    this.userService.logout();
  }
}
