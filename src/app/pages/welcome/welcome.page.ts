import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Camera } from '@capacitor/camera';
import { Microphone } from '@mozartec/capacitor-microphone';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WelcomePage implements OnInit {
  videoPermissionStatus: string = 'notInitiated';
  micPermissionStatus: string = 'notInitiated';
  nativePlatform: boolean;

  constructor(public menuCtrl: MenuController, private router: Router) {
    if (Capacitor.isNativePlatform()) {
      this.nativePlatform = true;
    }
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  welcomeCompleted() {
    localStorage.setItem('welcomeCompleted', 'true');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  lastSlide(e) {
    this.askPerms();
  }

  askPerms() {
    if (Capacitor.isNativePlatform()) {
      this.requestVideoPermissions();
    }
  }

  tryAgainPerms() {
    this.askPerms();
  }

  async checkVideoPermissions() {
    try {
      const checkPermissionsResult = await Camera.checkPermissions();
      console.log(
        'checkPermissionsResult: ' + JSON.stringify(checkPermissionsResult)
      );
      console.log('3+ Check Vid success: ', checkPermissionsResult.camera);
      if (checkPermissionsResult.camera == 'granted') {
        this.videoPermissionStatus = 'granted';
      } else {
        this.videoPermissionStatus = 'denied';
      }
      this.requestMicPermissions();
    } catch (error) {
      console.error('checkPermissions Error: ' + JSON.stringify(error));
      this.videoPermissionStatus = 'denied';
      console.log('3+ Check Vid denied');
    }
  }

  async requestVideoPermissions() {
    try {
      const requestPermissionsResult = await Camera.requestPermissions();
      console.log(
        'requestPermissionsResult: ' + JSON.stringify(requestPermissionsResult)
      );
      console.log('3+ request Vid success: ', requestPermissionsResult.camera);
      this.checkVideoPermissions();
    } catch (error) {
      console.error('requestPermissions Error: ' + JSON.stringify(error));
      this.videoPermissionStatus = 'denied';
      console.log('3+ request Vid denied');
    }
  }

  async checkMicPermissions() {
    try {
      const checkPermissionsResult = await Microphone.checkPermissions();
      console.log(
        'checkPermissionsResult: ' + JSON.stringify(checkPermissionsResult)
      );
      console.log('3+ Check Mic success: ', checkPermissionsResult.microphone);
      if (checkPermissionsResult.microphone == 'granted') {
        this.micPermissionStatus = 'granted';
      } else {
        this.micPermissionStatus = 'denied';
      }
    } catch (error) {
      console.error('checkPermissions Error: ' + JSON.stringify(error));
      this.micPermissionStatus = 'denied';
      console.log('3+ Check Mic denied');
    }
  }

  async requestMicPermissions() {
    try {
      const requestPermissionsResult = await Microphone.requestPermissions();
      console.log(
        'requestPermissionsResult: ' + JSON.stringify(requestPermissionsResult)
      );
      console.log(
        '3+ request Mic success: ',
        requestPermissionsResult.microphone
      );
      this.checkMicPermissions();
    } catch (error) {
      console.error('requestPermissions Error: ' + JSON.stringify(error));
      this.micPermissionStatus = 'denied';
      console.log('3+ request Mic denied');
    }
  }
}
