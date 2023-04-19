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
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Messages', url: '/messages', icon: 'mail' },
  ];
  public logoutPages = [{ title: 'Logout', func: 'logout()', icon: 'log-out' }];
  private isLogged: boolean;

  constructor(private userService: UserService, private router: Router) {
    this.isLogged = this.userService.tokenValue ? true : false;
    if (!localStorage.getItem('welcomeCompleted')) {
      this.router.navigateByUrl('/welcome');
    }
  }

  logout() {
    this.userService.logout();
  }
}
