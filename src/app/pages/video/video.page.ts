import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { RtcService } from 'src/app/services/rtc.service';
import { ActivatedRoute, Router } from '@angular/router';
import interact from 'interactjs';
import { UserService } from 'src/app/services/user.service';
import { first } from 'rxjs';
import { UserInfo } from 'src/app/models/user-info';

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class VideoPage implements OnInit {
  audioMuted: boolean;
  videoMuted: boolean;
  visionCode: string = localStorage.getItem('visionCode');
  agoraRtcToken: string;
  loading: boolean = true;
  currentUser: UserInfo;
  type: 'JOIN' | 'INVITING' | 'INVITED';
  recieverId: string;
  soloUser: boolean = true;

  constructor(
    public menuCtrl: MenuController,
    public rtc: RtcService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.getAllInfo();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {
    this.makeFrameDraggable();
  }

  // Get if its invite or join from query params and get CurrentUser Info
  getAllInfo() {
    this.route.queryParams.subscribe(async (params) => {
      this.type = await params['callType'];
      this.userService
        .getCurrentUser()
        .pipe(first())
        .subscribe({
          next: (user) => {
            this.currentUser = user.data;
            switch (this.type) {
              case 'JOIN': {
                this.userService
                  .joinCall(this.visionCode)
                  .pipe(first())
                  .subscribe({
                    next: (response) => {
                      this.agoraRtcToken = response.data.agoraToken;
                      if (
                        !this.visionCode ||
                        !this.currentUser ||
                        !this.agoraRtcToken
                      ) {
                        this.loading = false;
                        setTimeout(() => {
                          this.router.navigate(['home'], { replaceUrl: true });
                        }, 500);
                        return;
                      }
                      this.startCall();
                    },
                    error: (error) => {
                      this.loading = false;
                      setTimeout(() => {
                        this.router.navigate(['home'], { replaceUrl: true });
                      }, 500);
                    },
                  });
                break;
              }
              case 'INVITING': {
                this.recieverId = params['recieverId'];
                this.userService
                  .inviteCall(this.recieverId, this.visionCode)
                  .pipe(first())
                  .subscribe({
                    next: (response) => {
                      this.agoraRtcToken = response.data.agoraToken;
                      if (
                        !this.visionCode ||
                        !this.currentUser ||
                        !this.agoraRtcToken
                      ) {
                        this.loading = false;
                        setTimeout(() => {
                          this.router.navigate(['home'], { replaceUrl: true });
                        }, 500);
                        return;
                      }
                      this.startCall();
                    },
                    error: (error) => {
                      this.loading = false;
                      setTimeout(() => {
                        this.router.navigate(['home'], { replaceUrl: true });
                      }, 500);
                    },
                  });
                break;
              }
              case 'INVITED': {
                this.agoraRtcToken = params['agoraToken'];
                if (
                  !this.visionCode ||
                  !this.currentUser ||
                  !this.agoraRtcToken
                ) {
                  this.loading = false;
                  setTimeout(() => {
                    this.router.navigate(['home'], { replaceUrl: true });
                  }, 500);
                  return;
                }
                this.startCall();
                break;
              }
              default: {
                break;
              }
            }
          },
          error: (error) => {
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['home'], { replaceUrl: true });
            }, 500);
          },
        });
    });
  }

  // Create RTC client from RTC service, listen to all events and join call with the info received
  async startCall() {
    try {
      this.rtc.rtcDetails.client = this.rtc.createRTCClient('rtc', 'h264');
      this.rtc.agoraServerEvents(this.rtc.rtcDetails);
      await this.rtc.joinCall(
        this.visionCode,
        this.agoraRtcToken,
        this.currentUser._id,
        this.rtc.rtcDetails
      );
      this.loading = false;
      // keep checking if solo user
      this.rtc.soloUserObs.subscribe((soloUser) => {
        if (soloUser) this.turnOnSoloView();
        else this.turnOffSoloView();
      });
    } catch (error) {
      console.log(error);
    }
  }

  turnOnSoloView() {
    document
      .getElementById('local-video-container')
      .classList.remove('local-video-container');
    document
      .getElementById('local-video-container')
      .classList.remove('local-video-container');
    document
      .getElementById('local-player')
      .classList.remove('local-video-player');
    document
      .getElementById('local-video-container')
      .classList.add('local-video-container-solo');
    document
      .getElementById('local-player')
      .classList.add('local-video-player-solo');
    document
      .getElementById('remote-container-wrapper')
      .classList.add('remote-video-wrapper-solo');
  }

  turnOffSoloView() {
    document
      .getElementById('local-video-container')
      .classList.remove('local-video-container-solo');
    document
      .getElementById('local-player')
      .classList.remove('local-video-player-solo');
    document
      .getElementById('remote-container-wrapper')
      .classList.remove('remote-video-wrapper-solo');
    document
      .getElementById('local-video-container')
      .classList.add('local-video-container');
    document
      .getElementById('local-video-container')
      .classList.add('local-video-container');
    document.getElementById('local-player').classList.add('local-video-player');
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

  // Leave call and remove current page from history stack
  async end() {
    this.userService
      .endRtcSession()
      .pipe(first())
      .subscribe({
        next: async (response) => {
          await this.rtc.leaveCall(this.rtc.rtcDetails);
          this.router.navigate(['home'], { replaceUrl: true });
        },
        error: (error) => {
          setTimeout(async () => {
            await this.rtc.leaveCall(this.rtc.rtcDetails);
            this.router.navigate(['home'], { replaceUrl: true });
          }, 500);
        },
      });
  }

  // Make the localVideoTrack Movable
  makeFrameDraggable() {
    interact('.draggable').draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
      autoScroll: true,
      listeners: {
        move: dragMoveListener,
        end(event) {},
      },
    });

    function dragMoveListener(event) {
      var target = event.target;
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
      target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }
  }
}
