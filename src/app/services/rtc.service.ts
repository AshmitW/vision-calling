import { Injectable } from '@angular/core';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { RtcInfo } from '../models/rtc-info';
import { RtcUserInfo } from '../models/rtc-user-info';
import { first } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class RtcService {
  rtcDetails: RtcInfo = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
    token: '',
    checkSpeakingInterval: null,
    audio: true,
    video: true,
  };

  options = {
    appId: 'd19b8e8972314505b397601f15cae1b5',
    channel: 'vision-calling',
    token:
      '007eJxTYFjSbWL2faF2/3Xld/M5u44/9b0kVz6P5/u+AtFVYdwni/kVGFIMLZMsUi0szY2MDU1MDUyTjC3NzQwM0wxNkxNTDZNMo62dUxoCGRm2PXBiZGSAQBCfj6EsszgzP083OTEnJzMvnYEBAH6NIn0=',
    uid: Math.round(Math.random() * (999 - 1) + 1).toString(),
  };

  remoteUsers: RtcUserInfo[] = [];
  remoteUsersDB = [];
  constructor(private userService: UserService) {}

  createRTCClient() {
    return AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
  }

  // To Join call, create localtracks and publish it
  async joinCall(channel: string, token: string, uid: string, rtc: RtcInfo) {
    await rtc.client.join(this.options.appId, channel, token, uid);
    this.rtcDetails.localAudioTrack =
      await AgoraRTC.createMicrophoneAudioTrack();
    this.rtcDetails.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: '720p',
    });
    this.rtcDetails.localAudioTrack.play();
    this.rtcDetails.localVideoTrack.play('local-player');
    await rtc.client.publish([
      this.rtcDetails.localAudioTrack,
      this.rtcDetails.localVideoTrack,
    ]);
  }

  // To subscribe to all events so we can get remote users and keep a long of all events
  agoraServerEvents(rtc: RtcInfo, uid1?: number, uid2?: number) {
    rtc.client.on('user-published', async (user, mediaType) => {
      console.log('user-published', user, mediaType, '1+');
      await rtc.client.subscribe(user, mediaType);
      // console.log('USERUID', user.uid);
      if (user.hasAudio) {
        user.audioTrack?.play();
      }
      if (user.hasVideo) {
        user.videoTrack?.play(`remote-user-player-${user.uid}`);
      }
    });
    rtc.client.on('user-unpublished', (user) => {
      console.log('user-unpublished', user, '2+');
    });
    rtc.client.on('connection-state-change', (curState, prevState) => {
      console.log('current', curState, 'prev', prevState, '3+');
    });
    rtc.client.on('user-joined', (user) => {
      console.log('user-joined', user, this.remoteUsers, '4+');
      this.userService
        .getUser(user.uid.toString())
        .pipe(first())
        .subscribe({
          next: (userDB) => {
            this.remoteUsersDB.push(userDB);
          },
          error: (error) => {},
        });
    });
    rtc.client.on('channel-media-relay-event', (user) => {
      console.log('channel-media-relay-event', user, '5+');
    });
    rtc.client.on('channel-media-relay-state', (user) => {
      console.log('channel-media-relay-state', user, '6+');
    });
    rtc.client.on('user-left', (user) => {
      console.log('user-left', user, '7+');
      this.remoteUsersDB = this.remoteUsersDB.filter(
        (item) => item.id !== user.uid
      );
    });
    rtc.client.on('crypt-error', (user) => {
      console.log('crypt-error', user, '8+');
    });
    rtc.client.on('exception', (user) => {
      console.log('exception', user, '9+');
    });
    rtc.client.on('live-streaming-error', (user) => {
      console.log('live-streaming-error', user, '10+');
    });
    rtc.client.on('live-streaming-warning', (user) => {
      console.log('live-streaming-warning', user, '11+');
    });
    rtc.client.on('media-reconnect-end', (user) => {
      console.log('media-reconnect-end', user, '12+');
    });
    rtc.client.on('media-reconnect-start', (user) => {
      console.log('media-reconnect-start', user, '13+');
    });
    rtc.client.on('network-quality', (user) => {
      console.log('network-quality', user, '14+');
    });
    rtc.client.on('stream-fallback', (user) => {
      console.log('stream-fallback', user, '15+');
    });
    rtc.client.on('stream-type-changed', (user) => {
      console.log('stream-type-changed', user, '16+');
    });
    rtc.client.on('token-privilege-did-expire', (user) => {
      console.log('token-privilege-did-expire', user, '17+');
    });
    rtc.client.on('token-privilege-will-expire', (user) => {
      console.log('token-privilege-will-expire', user, '18+');
    });
    // rtc.client.enableAudioVolumeIndicator();
    rtc.client.on('volume-indicator', (user) => {
      console.log('volume-indicator', user, '19+');
    });
    rtc.client.on('track-ended', () => {
      console.log('track-ended', '20+');
    });
  }

  // To end session, closing localtracks, destroying div and leaving channel
  async leaveCall(rtc: RtcInfo) {
    if (rtc.localAudioTrack != undefined) {
      rtc.localAudioTrack.close();
    }
    if (rtc.localVideoTrack != undefined) {
      rtc.localVideoTrack.close();
    }
    if (rtc.client != undefined) {
      rtc.client.remoteUsers.forEach((user) => {
        const playerContainer = document.getElementById(
          'remote-user-player' + user.uid
        );
        playerContainer && playerContainer.remove();
      });
      await rtc.client.leave();
    }
  }
}
