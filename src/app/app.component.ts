import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UserService } from './services/user.service';
import { register } from 'swiper/element/bundle';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { first } from 'rxjs';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, CommonModule],
})
export class AppComponent {
  public appPages = [{ title: 'Home', url: '/home', icon: 'home' }];
  public logoutPages = [{ title: 'Logout', func: 'logout()', icon: 'log-out' }];
  private isLogged: boolean;
  loading: boolean = false;

  constructor(private userService: UserService, private router: Router) {
    // isLogged is use to check if USER has logged in.
    this.isLogged = this.userService.tokenValue ? true : false;
    // Check if User has done the first time setup, if not show it
    if (!localStorage.getItem('welcomeCompleted')) {
      this.router.navigateByUrl('/welcome');
    } else {
      if (Capacitor.isNativePlatform()) {
        this.registerNotifications();
      }
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
              this.router.navigate(['video'], {
                queryParams: {
                  callType: 'INVITED',
                  agoraToken: notification.notification.extra.agoraToken,
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

  // Calling the logout function in service
  logout() {
    this.loading = true;
    this.userService
      .logout()
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['login'], { replaceUrl: true });
          }, 500);
        },
        error: (error) => {
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['login'], { replaceUrl: true });
          }, 500);
        },
      });
  }
}
