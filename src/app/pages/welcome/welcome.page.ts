import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Camera } from '@capacitor/camera';
import { Microphone } from '@mozartec/capacitor-microphone';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

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
  pushPermissionStatus: string = 'notInitiated';
  micPermissionStatus: string = 'notInitiated';
  nativePlatform: boolean;

  constructor(public menuCtrl: MenuController, private router: Router) {
    // Only show when native platform is being used
    if (Capacitor.isNativePlatform()) {
      this.nativePlatform = true;
    }
  }

  ngOnInit() {}

  // enabling sidemenu after turning it off and on
  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  // User has completed welcome setup
  welcomeCompleted() {
    localStorage.setItem('welcomeCompleted', 'true');
    this.router.navigate(['login'], { replaceUrl: true });
  }

  // Triggered when last slide is called
  lastSlide(e) {
    this.askPerms();
  }

  // Ask permission during setup
  askPerms() {
    if (Capacitor.isNativePlatform()) {
      this.requestVideoPermissions();
    }
  }

  // Ask perms ahain if they say no
  tryAgainPerms() {
    this.askPerms();
  }

  // Check if video permission is granted
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

  // Ask video permission
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

  // Check if Mic permission is granted
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
      this.requestPushPermissions();
    } catch (error) {
      console.error('checkPermissions Error: ' + JSON.stringify(error));
      this.micPermissionStatus = 'denied';
      console.log('3+ Check Mic denied');
    }
  }

  // Ask Mic permission
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

  // Check if push permission is granted
  async checkPushPermissions() {
    try {
      const checkPermissionsResult = await PushNotifications.checkPermissions();
      console.log(
        'checkPermissionsResult: ' + JSON.stringify(checkPermissionsResult)
      );
      console.log('3+ Check Push success: ', checkPermissionsResult.receive);
      if (checkPermissionsResult.receive == 'granted') {
        this.pushPermissionStatus = 'granted';
        this.registerNotifications();
      } else {
        this.pushPermissionStatus = 'denied';
      }
    } catch (error) {
      console.error('checkPermissions Error: ' + JSON.stringify(error));
      this.pushPermissionStatus = 'denied';
      console.log('3+ Check Push denied');
    }
  }

  // Ask push permission
  async requestPushPermissions() {
    try {
      const requestPermissionsResult =
        await PushNotifications.requestPermissions();
      console.log(
        'requestPermissionsResult: ' + JSON.stringify(requestPermissionsResult)
      );
      console.log(
        '3+ request Push success: ',
        requestPermissionsResult.receive
      );
      this.checkPushPermissions();
    } catch (error) {
      console.error('requestPermissions Error: ' + JSON.stringify(error));
      this.pushPermissionStatus = 'denied';
      console.log('3+ request Push denied');
    }
  }

  async addListeners() {
    await PushNotifications.addListener('registration', async (ptoken) => {
      console.info('Push Registration token: ', ptoken.value);
      let pushToken = ptoken.value; // Push token for Android
      // Get FCM token instead the APN one returned by Capacitor
      const { token } = await FirebaseMessaging.getToken();
      console.info('FCM Registration token: ', token);
      pushToken = token;
      localStorage.setItem('fcmToken', pushToken);
    });

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('Registration error: ', err.error);
    });

    await PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification) => {
        console.log('Push notification received: ', notification);
        const options = {
          title: notification.data.title,
          body: notification.data.body,
          id: Math.floor(Math.random() * Math.random()),
          extra: notification.data,
        };
        await LocalNotifications.schedule({
          notifications: [options],
        });
      }
    );

    await FirebaseMessaging.addListener(
      'notificationReceived',
      async (event) => {
        console.log('notificationReceived: ', { event });
        const options = {
          //@ts-ignore
          title: event.notification.data.title,
          //@ts-ignore
          body: event.notification.data.body,
          id: Math.floor(Math.random() * Math.random()),
          extra: event.notification.data,
        };
        await LocalNotifications.schedule({
          notifications: [options],
        });
      }
    );
    await FirebaseMessaging.addListener(
      'notificationActionPerformed',
      (event) => {
        console.log('notificationActionPerformed: ', { event });
      }
    );

    await LocalNotifications.addListener(
      'localNotificationReceived',
      async (notification) => {
        console.log('localNotificationReceived', notification);
      }
    );

    await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (notification) => {
        console.log('localNotificationActionPerformed', notification);
        if (notification.notification.extra.type) {
          switch (notification.notification.extra.type) {
            case 'call': {
              // We pass required values to join same call as invitee
              this.router.navigate(['video'], {
                queryParams: {
                  callType: 'INVITED',
                  agoraToken: notification.notification.extra.agoraToken,
                  visionCode: notification.notification.extra.visionCode,
                },
              });
              break;
            }
            case 'message': {
              this.router.navigate(['messages'], {
                queryParams: {
                  openMsgId: notification.notification.extra.msgId,
                },
              });
              break;
            }
            default: {
              break;
            }
          }
        }
      }
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification) => {
        console.log(
          'Push notification action performed',
          notification,
          notification.actionId,
          notification.inputValue
        );
      }
    );
    await PushNotifications.register();
    this.getDeliveredNotifications();
  }

  async registerNotifications() {
    await PushNotifications.removeAllListeners();
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    await PushNotifications.register();
    this.addListeners();
  }

  async getDeliveredNotifications() {
    const notificationList =
      await PushNotifications.getDeliveredNotifications();
    console.log('delivered notifications', notificationList);
  }
}
