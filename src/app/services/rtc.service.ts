import { Injectable } from '@angular/core';
import AgoraRTC, { ClientRole } from 'agora-rtc-sdk-ng';
import { RtcInfo } from '../models/rtc-info';
import { RtcUserInfo } from '../models/rtc-user-info';
import { Subject, first } from 'rxjs';
import { UserService } from './user.service';
import { RoleInfo } from '../models/role-info';

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

  // Token, channel and ID are not being used here and is rather recieved from Server or User
  options = {
    appId: 'd19b8e8972314505b397601f15cae1b5',
    channel: 'vision-calling',
    token:
      '007eJxTYFjSbWL2faF2/3Xld/M5u44/9b0kVz6P5/u+AtFVYdwni/kVGFIMLZMsUi0szY2MDU1MDUyTjC3NzQwM0wxNkxNTDZNMo62dUxoCGRm2PXBiZGSAQBCfj6EsszgzP083OTEnJzMvnYEBAH6NIn0=',
    uid: Math.round(Math.random() * (999 - 1) + 1).toString(),
  };
  mode: 'rtc' | 'live';
  codec: 'h264' | 'vp9';
  liveHostId: string;
  // RemoteUsers where we store our remoteUsers video and audio feed
  remoteUsers: RtcUserInfo[] = [];
  // Remote users where we store the info received from our DB for diplay names
  remoteUsersDB = [];
  cameraDevices = [];
  private hostLeft: Subject<any> = new Subject<any>();
  public hostLeftObs = this.hostLeft.asObservable();
  private soloUser: Subject<any> = new Subject<any>();
  public soloUserObs = this.soloUser.asObservable();
  constructor(private userService: UserService) {}

  // Creating the RTC Client
  createRTCClient(mode: 'rtc' | 'live', codec: 'h264' | 'vp9') {
    this.mode = mode;
    return AgoraRTC.createClient({ mode: mode, codec: codec });
  }

  // To Join call, create localtracks and publish it
  async joinCall(
    visionCode: string,
    token: string,
    uid: string,
    rtc: RtcInfo,
    role: ClientRole = 'host',
    hostId = ''
  ) {
    if (this.mode === 'live') await rtc.client.setClientRole(role);
    this.liveHostId = hostId;
    await rtc.client.join(this.options.appId, visionCode, token, uid);
    this.rtcDetails.localAudioTrack =
      await AgoraRTC.createMicrophoneAudioTrack();
    this.rtcDetails.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: '720p',
    });
    this.cameraDevices = await AgoraRTC.getCameras();
    if (role !== 'audience') {
      //   this.rtcDetails.localAudioTrack.play();
      this.rtcDetails.localVideoTrack.play('local-player');
      await rtc.client.publish([
        this.rtcDetails.localAudioTrack,
        this.rtcDetails.localVideoTrack,
      ]);
    }
  }

  // to toggle camera devices
  toggleCameraDevice() {
    this.cameraDevices.forEach((camera) => {
      if (this.rtcDetails.localVideoTrack.getTrackLabel !== camera.label) {
        this.rtcDetails.localVideoTrack.setDevice(camera.deviceId);
      }
    });
  }

  // To subscribe to all events so we can get remote users and keep a long of all events
  agoraServerEvents(rtc: RtcInfo, uid1?: number, uid2?: number) {
    rtc.client.on('user-published', async (user, mediaType) => {
      // All console logs below this, output with an extra code at the end to make it easier to pinpoint origin of console
      console.log('user-published', user, mediaType, '1+');
      await rtc.client.subscribe(user, mediaType);
      // If incoming user has audio feed, play it
      if (user.hasAudio) {
        user.audioTrack?.play();
      }
      // If incoming user has video feed, play it
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
      // When a new user joins, we use thier ID to get their name and add to our remoteUsers.
      this.userService
        .getUser(user.uid.toString())
        .pipe(first())
        .subscribe({
          next: (userDB) => {
            this.remoteUsersDB.push(userDB.data);
            console.log('JOINED LENGTH', this.remoteUsersDB.length);
            this.soloUser.next(this.remoteUsersDB.length === 0 ? true : false);
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
      // When a user leaves, we use thier ID to remove from our remoteUsers.
      this.remoteUsersDB = this.remoteUsersDB.filter(
        (item) => item._id !== user.uid
      );
      console.log('LEFT LENGTH', this.remoteUsersDB.length);
      this.soloUser.next(this.remoteUsersDB.length === 0 ? true : false);
      if (this.mode === 'live' && this.liveHostId === user.uid)
        this.hostLeft.next(true);
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
    // we empty our remoteUsers from DB
    this.remoteUsersDB = [];
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
