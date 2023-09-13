import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController, LoadingController } from '@ionic/angular';
import { RtcService } from 'src/app/services/rtc.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { first } from 'rxjs';
import { UserInfo } from 'src/app/models/user-info';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-live-stream',
  templateUrl: './live-stream.page.html',
  styleUrls: ['./live-stream.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LiveStreamPage implements OnInit {
  loading: any;
  audioMuted: boolean;
  videoMuted: boolean;
  visionCode: string = localStorage.getItem('visionCode');
  agoraRtcToken: string;
  currentUser: UserInfo;
  type: 'JOIN' | 'CREATE';
  hostId: string;
  nativePlatform: boolean;

  constructor(
    public menuCtrl: MenuController,
    public rtc: RtcService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private loadingCtrl: LoadingController
  ) {
    this.showLoading();
    if (Capacitor.isNativePlatform()) {
      this.nativePlatform = true;
    }
    this.getAllInfo();
  }

  async showLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Loading',
    });

    this.loading.present();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {}

  // Get if its create or join from query params and get CurrentUser Info
  getAllInfo() {
    this.route.queryParams.subscribe(async (params) => {
      this.type = await params['streamType'];
      this.userService
        .getCurrentUser()
        .pipe(first())
        .subscribe({
          next: (user) => {
            this.currentUser = user.data;
            switch (this.type) {
              case 'JOIN': {
                this.hostId = params['hostId'];
                this.userService
                  .joinStream(this.hostId)
                  .pipe(first())
                  .subscribe({
                    next: (response) => {
                      this.visionCode = response.data.visionCode;
                      this.agoraRtcToken = response.data.agoraToken;
                      if (
                        !this.visionCode ||
                        !this.currentUser ||
                        !this.agoraRtcToken
                      ) {
                        this.loading.dismiss();
                        setTimeout(() => {
                          this.router.navigate(['home'], { replaceUrl: true });
                        }, 500);
                        return;
                      }
                      this.startStream();
                    },
                    error: (error) => {
                      this.loading.dismiss();
                      setTimeout(() => {
                        this.router.navigate(['home'], { replaceUrl: true });
                      }, 500);
                    },
                  });
                break;
              }
              case 'CREATE': {
                // Modify vision code if creating live stream so there are never 2 publishers with same code
                this.visionCode =
                  this.visionCode +
                  '-live-' +
                  (Math.random() + 1).toString(36).substring(2);
                this.userService
                  .createStream(this.visionCode)
                  .pipe(first())
                  .subscribe({
                    next: (response) => {
                      this.agoraRtcToken = response.data.agoraToken;
                      if (
                        !this.visionCode ||
                        !this.currentUser ||
                        !this.agoraRtcToken
                      ) {
                        this.loading.dismiss();
                        setTimeout(() => {
                          this.router.navigate(['home'], { replaceUrl: true });
                        }, 500);
                        return;
                      }
                      this.startStream();
                    },
                    error: (error) => {
                      this.loading.dismiss();
                      setTimeout(() => {
                        this.router.navigate(['home'], { replaceUrl: true });
                      }, 500);
                    },
                  });
                break;
              }
              default: {
                break;
              }
            }
          },
          error: (error) => {
            this.loading.dismiss();
            setTimeout(() => {
              this.router.navigate(['home'], { replaceUrl: true });
            }, 500);
          },
        });
    });
  }

  // Create RTC client from RTC service with live mode, listen to all events and join/create stream with the info received
  async startStream() {
    try {
      this.rtc.rtcDetails.client = this.rtc.createRTCClient('live', 'vp9');
      this.rtc.agoraServerEvents(this.rtc.rtcDetails);
      await this.rtc.joinCall(
        this.visionCode,
        this.agoraRtcToken,
        this.currentUser._id,
        this.rtc.rtcDetails,
        this.type === 'CREATE' ? 'host' : 'audience',
        this.hostId
      );
      this.loading.dismiss();
      // keep checking if host left
      this.rtc.hostLeftObs.subscribe((hostLeft) => {
        if (hostLeft === true) this.end();
      });
    } catch (error) {
      console.log(error);
    }
  }

  // Mute the audio
  async audioMute() {
    this.rtc.rtcDetails.localAudioTrack.setEnabled(false);
    this.rtc.rtcDetails.audio = false;
    this.audioMuted = true;
  }

  // Unmute the audio
  audioUnmute() {
    this.rtc.rtcDetails.localAudioTrack.setEnabled(true);
    this.rtc.rtcDetails.audio = true;
    this.audioMuted = false;
  }

  // Mute the video
  async videoMute() {
    this.rtc.rtcDetails.localVideoTrack.setEnabled(false);
    this.videoMuted = true;
  }

  // Unmute the video
  videoUnmute() {
    this.rtc.rtcDetails.localVideoTrack.setEnabled(true);
    this.videoMuted = false;
  }

  toggleCamera() {
    this.rtc.toggleCameraDevice();
  }

  // Leave call and remove current page from history stack
  async end() {
    this.loading.present();
    this.userService
      .endRtcSession()
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.loading.dismiss();
          setTimeout(async () => {
            await this.rtc.leaveCall(this.rtc.rtcDetails);
            this.router.navigate(['home'], { replaceUrl: true });
          }, 500);
        },
        error: (error) => {
          this.loading.dismiss();
          setTimeout(async () => {
            await this.rtc.leaveCall(this.rtc.rtcDetails);
            this.router.navigate(['home'], { replaceUrl: true });
          }, 500);
        },
      });
  }
}
