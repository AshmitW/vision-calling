import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { RtcService } from 'src/app/services/rtc.service';
import { Router } from '@angular/router';
import interact from 'interactjs';

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

  constructor(
    public menuCtrl: MenuController,
    public rtc: RtcService,
    private router: Router
  ) {
    this.startCall();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
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
    this.makeFrameDraggable();
  }

  makeFrameDraggable() {
    interact('.draggable').draggable({
      // enable inertial throwing
      inertia: true,
      // keep the element within the area of it's parent
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
      // enable autoScroll
      autoScroll: true,

      listeners: {
        // call this function on every dragmove event
        move: dragMoveListener,

        // call this function on every dragend event
        end(event) {
          var textEl = event.target.querySelector('p');

          textEl &&
            (textEl.textContent =
              'moved a distance of ' +
              Math.sqrt(
                (Math.pow(event.pageX - event.x0, 2) +
                  Math.pow(event.pageY - event.y0, 2)) |
                  0
              ).toFixed(2) +
              'px');
        },
      },
    });

    function dragMoveListener(event) {
      var target = event.target;
      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }
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
