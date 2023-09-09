import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  InfiniteScrollCustomEvent,
  ToastController,
} from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { first } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.page.html',
  styleUrls: ['./invite.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class InvitePage implements OnInit {
  users = [];
  skip: number = 0;
  limit: number = 10;
  keyword: string = '';
  visionCode: string = localStorage.getItem('visionCode');
  constructor(
    private userService: UserService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.getUsers();
  }

  // Toast template
  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'bottom',
    });

    await toast.present();
  }

  getUsers() {
    this.userService
      .getAllUsers(this.skip, this.limit, this.keyword)
      .pipe(first())
      .subscribe({
        next: (users) => {
          this.users = users.data[0].items;
        },
        error: (error) => {
          console.log(error);
          this.presentToast(error.error.errors.message);
        },
      });
  }

  inviteToCall(userId) {
    if (!this.visionCode) {
      this.presentToast('Please enter a Vision Code');
      this.router.navigate(['home']);
      return;
    }

    this.router.navigate(['video'], {
      queryParams: {
        callType: 'INVITING',
        recieverId: userId,
      },
    });
  }

  refreshUsers(event) {
    setTimeout(() => {
      this.skip = 0;
      this.limit = 10;
      this.keyword = '';
      this.getUsers();
      event.target.complete();
    }, 1000);
  }

  onIonInfinite(ev) {
    this.limit = this.limit + 5;
    this.getUsers();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }
}
