import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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
  constructor(private router: Router) {}

  ngOnInit() {}

  routeVideo() {
    this.router.navigate(['video'], {
      queryParams: {
        visionCode: this.visionCode,
      },
    });
  }
}
