import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UserService } from './services/user.service';
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

  constructor(private userService: UserService) {
    this.isLogged = this.userService.tokenValue ? true : false;
  }

  logout() {
    console.log('Logout func called');
    this.userService.logout();
  }
}
