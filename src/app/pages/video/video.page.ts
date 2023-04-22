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
  visionCode: string = '';
  loading: boolean = true;
  currentUser: UserInfo;

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
    // this.rtc.updateUserInfo.subscribe(async (id) => {
    //   if (id) {
    //     try {
    //       // senderId means uid getUserInfo
    //       console.log('user getUserInfo');

    //       for (let index = 0; index < this.rtc.remoteUsers.length; index++) {
    //         const element = this.rtc.remoteUsers[index];
    //         console.log(element, 'user getUserInfo remoteUsers');
    //         if (element.uid == id) {
    //           element.name = 'TEST USER';
    //         }
    //       }
    //     } catch (error) {
    //       console.log(error, 'error');
    //     }
    //   }
    // });
    this.makeFrameDraggable();
  }

  // Get visionCode (Channel ID) from query params and get CurrentUser Info
  getAllInfo() {
    this.route.queryParams.subscribe((params) => {
      this.visionCode = params['visionCode'];
      this.userService
        .getCurrentUser()
        .pipe(first())
        .subscribe({
          next: (user: UserInfo) => {
            this.currentUser = user;
            console.log('VISION', this.currentUser);
            if (!this.visionCode || !this.currentUser) {
              this.loading = false;
              this.router.navigate(['home'], { replaceUrl: true });
              return;
            }
            this.startCall();
          },
          error: (error) => {
            this.loading = false;
          },
        });
    });
  }

  // Create RTC client from RTC service, listen to all events and join call with the info received
  async startCall() {
    try {
      this.rtc.rtcDetails.client = this.rtc.createRTCClient();
      this.rtc.agoraServerEvents(this.rtc.rtcDetails);
      await this.rtc.joinCall(
        this.visionCode,
        'asb',
        this.currentUser.id,
        this.rtc.rtcDetails
      );
      this.loading = false;
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

  // Leave call and remove current page from history stack
  async end() {
    await this.rtc.leaveCall(this.rtc.rtcDetails);
    this.router.navigate(['home'], { replaceUrl: true });
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
