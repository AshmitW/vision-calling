import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RtcService } from 'src/app/services/rtc.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class VideoPage implements OnInit {
  uid;
  audioMuted: boolean;
  videoMuted: boolean;

  constructor(public rtc: RtcService, private router: Router) {
    this.startCall();
  }

  ngOnInit() {
    this.rtc.updateUserInfo.subscribe(async (id) => {
      if (id) {
        try {
          // senderId means uid getUserInfo
          console.log('user getUserInfo');

          for (let index = 0; index < this.rtc.remoteUsers.length; index++) {
            const element = this.rtc.remoteUsers[index];
            console.log(element, 'user getUserInfo remoteUsers');
            if (element.uid == id) {
              element.name = 'TEST USER';
            }
          }
        } catch (error) {
          console.log(error, 'error');
        }
      }
    });
  }

  async startCall() {
    try {
      this.rtc.rtcDetails.client = this.rtc.createRTCClient();
      this.rtc.agoraServerEvents(this.rtc.rtcDetails);
      this.uid = this.rtc.options.uid;
      await this.rtc.localUser('asb', 1, 'host', this.rtc.rtcDetails);
    } catch (error) {
      console.log(error);
    }
  }

  // To mute the audio
  async audioMute() {
    this.rtc.rtcDetails.localAudioTrack.setEnabled(false);
    this.rtc.rtcDetails.audio = false;
    this.audioMuted = true;
  }

  // To unmute the audio
  audioUnmute() {
    this.rtc.rtcDetails.localAudioTrack.setEnabled(true);
    this.rtc.rtcDetails.audio = true;
    this.audioMuted = false;
  }

  // To mute the video
  async videoMute() {
    this.rtc.rtcDetails.localVideoTrack.setEnabled(false);
    this.videoMuted = true;
  }

  // To unmute the video
  videoUnmute() {
    this.rtc.rtcDetails.localVideoTrack.setEnabled(true);
    this.videoMuted = false;
  }

  async end() {
    await this.rtc.leaveCall(this.rtc.rtcDetails);
    this.router.navigate(['home']);
  }
}
