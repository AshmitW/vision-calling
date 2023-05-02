import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit {
  visionCode: string = '';
  constructor(public menuCtrl: MenuController, private router: Router) {}

  ngOnInit() {}

  ionViewWillEnter() {
    // re-enable sidemenu after turning it off on login and sign up page
    this.menuCtrl.enable(true);
  }

  routeVideo() {
    this.router.navigate(['video'], {
      queryParams: {
        visionCode: this.visionCode,
      },
    });
  }
}
