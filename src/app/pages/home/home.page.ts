import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit {
  visionCode: string = localStorage.getItem('visionCode');
  name: string;
  public actionSheetButtons = [
    {
      text: 'Join live stream',
      data: {
        action: 'Join',
      },
    },
    {
      text: 'Create live stream',
      data: {
        action: 'Create',
      },
    },
    {
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];
  constructor(
    public menuCtrl: MenuController,
    private router: Router,
    private userService: UserService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.getCurrentUserName();
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

  ionViewWillEnter() {
    // re-enable sidemenu after turning it off on login and sign up page
    this.menuCtrl.enable(true);
  }

  setVisionCode(event) {
    localStorage.setItem('visionCode', event.detail.value);
  }

  // get Current user's name to display
  getCurrentUserName() {
    this.userService
      .getCurrentUser()
      .pipe(first())
      .subscribe({
        next: (user) => {
          this.name = user.data.name;
        },
      });
  }

  routeVideo() {
    if (!this.visionCode) {
      this.presentToast('Please enter a Vision Code');
      return;
    }
    this.router.navigate(['video'], {
      queryParams: {
        callType: 'JOIN',
      },
    });
  }

  routeInvite() {
    if (!this.visionCode) {
      this.presentToast('Please enter a Vision Code');
      return;
    }
    this.router.navigate(['invite']);
  }

  routeMessages() {
    this.router.navigate(['messages']);
  }

  checkLiveStreamAction(ev) {
    try {
      switch (ev.detail.data.action) {
        case 'Join': {
          this.router.navigate(['live-users']);
          break;
        }
        case 'Create': {
          if (!this.visionCode) {
            this.presentToast('Please enter a Vision Code');
            return;
          }
          this.router.navigate(['live-stream'], {
            queryParams: {
              streamType: 'CREATE',
            },
          });
          break;
        }
        default: {
          break;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
