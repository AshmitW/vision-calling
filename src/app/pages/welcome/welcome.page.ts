import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Camera } from '@capacitor/camera';
import { Microphone, AudioRecording } from '@mozartec/capacitor-microphone';

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
    this.router.navigateByUrl('/home');
  }

  async checkVideoPermissions() {
    try {
      const checkPermissionsResult = await Camera.checkPermissions();
      console.log(
        'checkPermissionsResult: ' + JSON.stringify(checkPermissionsResult)
      );
    } catch (error) {
      console.error('checkPermissions Error: ' + JSON.stringify(error));
    }
  }

  async requestVideoPermissions() {
    try {
      const requestPermissionsResult = await Camera.requestPermissions();
      console.log(
        'requestPermissionsResult: ' + JSON.stringify(requestPermissionsResult)
      );
    } catch (error) {
      console.error('requestPermissions Error: ' + JSON.stringify(error));
    }
  }

  async checkMicPermissions() {
    try {
      const checkPermissionsResult = await Microphone.checkPermissions();
      console.log(
        'checkPermissionsResult: ' + JSON.stringify(checkPermissionsResult)
      );
    } catch (error) {
      console.error('checkPermissions Error: ' + JSON.stringify(error));
    }
  }

  async requestMicPermissions() {
    try {
      const requestPermissionsResult = await Microphone.requestPermissions();
      console.log(
        'requestPermissionsResult: ' + JSON.stringify(requestPermissionsResult)
      );
    } catch (error) {
      console.error('requestPermissions Error: ' + JSON.stringify(error));
    }
  }
}
