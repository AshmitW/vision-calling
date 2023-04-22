import { Injectable } from '@angular/core';
import AgoraRTC, {
  IAgoraRTCClient,
  LiveStreamingTranscodingConfig,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ScreenVideoTrackInitConfig,
  VideoEncoderConfiguration,
  AREAS,
  IRemoteAudioTrack,
  ClientRole,
} from 'agora-rtc-sdk-ng';
import { RtcInfo } from '../models/rtc-info';
import { RtcUserInfo } from '../models/rtc-user-info';
import { BehaviorSubject } from 'rxjs';

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

  name;
  videoStatus = true;
  audioStatus = false;
  errorValue;
  type;

  options = {
    appId: 'd19b8e8972314505b397601f15cae1b5',
    channel: 'vision-calling',
    token:
      '007eJxTYFjSbWL2faF2/3Xld/M5u44/9b0kVz6P5/u+AtFVYdwni/kVGFIMLZMsUi0szY2MDU1MDUyTjC3NzQwM0wxNkxNTDZNMo62dUxoCGRm2PXBiZGSAQBCfj6EsszgzP083OTEnJzMvnYEBAH6NIn0=',
    uid: Math.round(Math.random() * (999 - 1) + 1),
  };

  remoteUsers: RtcUserInfo[] = [];
  updateUserInfo = new BehaviorSubject<any>(null);
  constructor() {}

  createRTCClient() {
    return AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
  }

  // To join a call with tracks (video or audio)
  async localUser(token: string, uuid: number, type: string, rtc: RtcInfo) {
    console.log('4+ LOCALUSER');
    await rtc.client.join(
      this.options.appId,
      this.options.channel,
      this.options.token,
      this.options.uid
    );
    // Create an audio track from the audio sampled by a microphone.
    this.rtcDetails.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(
      // Custom Audio Manipulation
      {
        encoderConfig: {
          sampleRate: 48000,
          stereo: true,
          bitrate: 128,
        },
      }
    );
    // Create a video track from the video captured by a camera.
    this.rtcDetails.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    // if you want to use your camera
    // this.switchCamera('OBS Virtual Camera', this.rtcDetails.localVideoTrack)

    // Publish the local audio and video tracks to the channel.
    // this.rtcDetails.localAudioTrack.play();
    this.rtcDetails.localVideoTrack.play('local-player');

    // channel for other users to subscribe to it.
    await rtc.client.publish([
      this.rtcDetails.localAudioTrack,
      this.rtcDetails.localVideoTrack,
    ]);
  }

  async getVideodevices() {
    let cams = await AgoraRTC.getCameras(); //  all cameras devices you can use
    return cams;
  }

  async allaudiodevices() {
    let mics = await AgoraRTC.getMicrophones(); // all microphones devices you can use
    return mics;
  }

  async switchCamera(label: string, localTracks: ICameraVideoTrack) {
    const cams = await this.getVideodevices();
    let currentCam = cams.find((cam) => cam.label === label);
    await localTracks.setDevice(currentCam.deviceId);
  }

  // To switch audio-
  async switchMicrophone(label: string, localTracks: IMicrophoneAudioTrack) {
    const mics = await this.allaudiodevices();
    let currentMic = mics.find((mic) => mic.label === label);
    await localTracks.setDevice(currentMic.deviceId);
  }

  async switchMicrophone2(val, localTracks) {
    let mics = await AgoraRTC.getDevices();
    if (val.kind == 'audiooutput') {
      let currentMic = mics.find((mic) => mic.label === val.label);
      await localTracks.setPlaybackDevice(currentMic.deviceId);
    } else {
      let currentMic2 = mics.find((mic) => mic.label === val.label);
      await localTracks.setDevice(currentMic2.deviceId);
    }
  }

  agoraServerEvents(rtc: RtcInfo, uid1?: number, uid2?: number) {
    // 2 used
    rtc.client.on('user-published', async (user, mediaType) => {
      console.log(user, mediaType, 'user-published');
      await rtc.client.subscribe(user, mediaType);
      if (user.hasAudio) {
        user.audioTrack?.play();
      }
      if (user.hasVideo) {
        user.videoTrack?.play(`remote-user-player-${user.uid}`);
      }
      let id = user.uid;
    });

    rtc.client.on('user-unpublished', (user) => {
      console.log(user, 'user-unpublished');
    });
    rtc.client.on('connection-state-change', (curState, prevState) => {
      console.log('current', curState, 'prev', prevState, 'event');
    });

    // 1 used
    rtc.client.on('user-joined', (user) => {
      let id = user.uid;
      console.log('user-joined', user, this.remoteUsers, 'event1');
    });
    rtc.client.on('channel-media-relay-event', (user) => {
      console.log('channel-media-relay-event', user, 'event2');
    });
    rtc.client.on('channel-media-relay-state', (user) => {
      console.log('channel-media-relay-state', user, 'event4');
    });
    rtc.client.on('user-left', (user) => {
      console.log('user-left', user, 'event3');
    });

    rtc.client.on('crypt-error', (user) => {
      console.log('crypt-error', user, 'event5');
    });
    rtc.client.on('exception', (user) => {
      console.log('exception', user, 'event6');
    });
    rtc.client.on('live-streaming-error', (user) => {
      console.log('live-streaming-error', user, 'event7');
    });
    rtc.client.on('live-streaming-warning', (user) => {
      console.log('live-streaming-warning', user, 'event8');
    });
    rtc.client.on('media-reconnect-end', (user) => {
      console.log('media-reconnect-end', user, 'event9');
    });
    rtc.client.on('media-reconnect-start', (user) => {
      console.log('media-reconnect-start', user, 'event10');
    });
    rtc.client.on('network-quality', (user) => {
      // console.log("network-quality", user, 'event11');
    });
    rtc.client.on('stream-fallback', (user) => {
      console.log('stream-fallback', user, 'event12');
    });
    rtc.client.on('stream-type-changed', (user) => {
      console.log('stream-type-changed', user, 'event13');
    });
    rtc.client.on('token-privilege-did-expire', (user) => {
      console.log('token-privilege-did-expire', user, 'event14');
    });
    rtc.client.on('token-privilege-will-expire', (user) => {
      console.log('token-privilege-will-expire', user, 'event15');
    });
    // rtc.client.enableAudioVolumeIndicator();
    rtc.client.on('volume-indicator', (user) => {
      console.log('volume-indicator', user, 'volume');
    });
    rtc.client.on('track-ended', () => {
      console.log('track-ended', 'event17');
    });
  }

  // To leave channel-
  async leaveCall(rtc: RtcInfo) {
    // Destroy the local audio and video tracks.
    if (rtc.localAudioTrack != undefined) {
      rtc.localAudioTrack.close();
    }
    if (rtc.localVideoTrack != undefined) {
      rtc.localVideoTrack.close();
    }

    // Traverse all remote users.
    if (rtc.client != undefined) {
      rtc.client.remoteUsers.forEach((user) => {
        // Destroy the dynamically created DIV container.
        const playerContainer = document.getElementById(
          'remote-user-player' + user.uid
        );
        playerContainer && playerContainer.remove();
      });
      // Leave the channel.
      await rtc.client.leave();
    }
  }

  async videoUpdate() {
    // this.videoStatus = flag;

    if (this.videoStatus) {
      this.videoStatus = false;
    } else {
      this.videoStatus = true;
    }
    await this.rtcDetails.localVideoTrack.setEnabled(this.videoStatus);
  }

  async audioUpdate() {
    // this.audioStatus = flag;

    if (this.audioStatus) {
      this.audioStatus = false;
    } else {
      this.audioStatus = true;
    }
    await this.rtcDetails.localAudioTrack.setEnabled(this.audioStatus);
  }
}
