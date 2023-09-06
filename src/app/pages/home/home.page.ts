import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit {
  visionCode: string = localStorage.getItem('visionCode');
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
    private toastController: ToastController
  ) {}

  ngOnInit() {}

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

  routeVideo() {
    if (!this.visionCode) {
      this.presentToast('Please enter a Vision Code');
      return;
    }
    this.router.navigate(['video'], {
      queryParams: {
        visionCode: this.visionCode,
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
          if (!this.visionCode) {
            this.presentToast('Please enter a Vision Code');
            return;
          }
          this.router.navigate(['live-users'], {
            queryParams: {
              visionCode: this.visionCode,
            },
          });
          break;
        }
        case 'Create': {
          if (!this.visionCode) {
            this.presentToast('Please enter a Vision Code');
            return;
          }
          this.presentToast('Create');
          // this.router.navigate(['video'], {
          //   queryParams: {
          //     visionCode: this.visionCode,
          //   },
          // });
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
