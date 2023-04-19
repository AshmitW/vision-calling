import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WelcomePage implements OnInit {
  constructor(public menuCtrl: MenuController, private router: Router) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  welcomeCompleted() {
    localStorage.setItem('welcomeCompleted', 'true');
    this.router.navigateByUrl('/login');
  }
}
