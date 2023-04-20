import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import AgoraRTC from 'agora-rtc-sdk-ng';

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class VideoPage implements OnInit {
  options = {
    // Pass your App ID here.
    appId: 'd19b8e8972314505b397601f15cae1b5',
    // Set the channel name.
    channel: 'vision-calling',
    // Pass your temp token here.
    token:
      '007eJxTYLC/ln340UJX/8eBDr8/q887I7EoQ21u3tGsw5MmNwk+aPJXYEgxtEyySLWwNDcyNjQxNTBNMrY0NzMwTDM0TU5MNUwyndjgkNIQyMiQy8zExMgAgSA+H0NZZnFmfp5ucmJOTmZeOgMDANyVIuw=',
    // Set the user ID.
    uid: Math.round(Math.random() * (999 - 1) + 1),
  };

  // Create an instance of the Agora Engine
  agoraEngine = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

  channelParameters = {
    // A variable to hold a local audio track.
    localAudioTrack: null,
    // A variable to hold a local video track.
    localVideoTrack: null,
    // A variable to hold a remote audio track.
    remoteAudioTrack: null,
    // A variable to hold a remote video track.
    remoteVideoTrack: null,
    // A variable to hold the remote user id.s
    remoteUid: null,
  };

  // Dynamically create a container in the form of a DIV element to play the remote video track.
  remotePlayerContainer = document.createElement('div');

  // Dynamically create a container in the form of a DIV element to play the local video track.
  localPlayerContainer = document.createElement('div');
  constructor() {
    // Specify the ID of the DIV container. You can use the uid of the local user.
    //@ts-ignore
    this.localPlayerContainer.id = this.options.uid;
    // Set the textContent property of the local video container to the local user id.
    this.localPlayerContainer.textContent = 'Local user ' + this.options.uid;
    // Set the local video container size.
    this.localPlayerContainer.style.width = '640px';
    this.localPlayerContainer.style.height = '480px';
    this.localPlayerContainer.style.padding = '15px 5px 5px 5px';
    this.localPlayerContainer.classList.add('video-container');
    // Set the remote video container size.
    this.remotePlayerContainer.style.width = '640px';
    this.remotePlayerContainer.style.height = '480px';
    this.remotePlayerContainer.style.padding = '15px 5px 5px 5px';
    this.remotePlayerContainer.classList.add('video-container');
    // Listen for the "user-published" event to retrieve a AgoraRTCRemoteUser object.
    this.agoraEngine.on('user-published', async (user, mediaType) => {
      // Subscribe to the remote user when the SDK triggers the "user-published" event.
      await this.agoraEngine.subscribe(user, mediaType);
      console.log('subscribe success');
      // Subscribe and play the remote video in the container If the remote user publishes a video track.
      if (mediaType == 'video') {
        // Retrieve the remote video track.
        this.channelParameters.remoteVideoTrack = user.videoTrack;
        // Retrieve the remote audio track.
        this.channelParameters.remoteAudioTrack = user.audioTrack;
        // Save the remote user id for reuse.
        this.channelParameters.remoteUid = user.uid.toString();
        // Specify the ID of the DIV container. You can use the uid of the remote user.
        this.remotePlayerContainer.id = user.uid.toString();
        this.channelParameters.remoteUid = user.uid.toString();
        this.remotePlayerContainer.textContent =
          'Remote user ' + user.uid.toString();
        // Append the remote container to the page body.
        document.body.append(this.remotePlayerContainer);
        // Play the remote video track.
        this.channelParameters.remoteVideoTrack.play(
          this.remotePlayerContainer
        );
      }
      // Subscribe and play the remote audio track If the remote user publishes the audio track only.
      if (mediaType == 'audio') {
        // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
        this.channelParameters.remoteAudioTrack = user.audioTrack;
        // Play the remote audio track. No need to pass any DOM element.
        this.channelParameters.remoteAudioTrack.play();
      }
      // Listen for the "user-unpublished" event.
      this.agoraEngine.on('user-unpublished', (user) => {
        console.log(user.uid + 'has left the channel');
      });
    });
  }

  ngOnInit() {
    document
      .getElementById('video-wrapper')
      .appendChild(this.remotePlayerContainer);
    document
      .getElementById('video-wrapper')
      .appendChild(this.localPlayerContainer);
  }

  async join() {
    // Join a channel.
    await this.agoraEngine.join(
      this.options.appId,
      this.options.channel,
      this.options.token,
      this.options.uid
    );
    // Create a local audio track from the audio sampled by a microphone.
    this.channelParameters.localAudioTrack =
      await AgoraRTC.createMicrophoneAudioTrack();
    // Create a local video track from the video captured by a camera.
    this.channelParameters.localVideoTrack =
      await AgoraRTC.createCameraVideoTrack();
    // Append the local video container to the page body.
    document.body.append(this.localPlayerContainer);
    // Publish the local audio and video tracks in the channel.
    await this.agoraEngine.publish([
      this.channelParameters.localAudioTrack,
      this.channelParameters.localVideoTrack,
    ]);
    // Play the local video track.
    this.channelParameters.localVideoTrack.play(this.localPlayerContainer);
    console.log('publish success!');
  }

  async leave() {
    // Destroy the local audio and video tracks.
    this.channelParameters.localAudioTrack.close();
    this.channelParameters.localVideoTrack.close();
    // Remove the containers you created for the local video and remote video.
    this.removeVideoDiv(this.remotePlayerContainer.id);
    this.removeVideoDiv(this.localPlayerContainer.id);
    // Leave the channel
    await this.agoraEngine.leave();
    console.log('You left the channel');
    // Refresh the page for reuse
    window.location.reload();
  }

  // Remove the video stream from the container.
  removeVideoDiv(elementId) {
    console.log('Removing ' + elementId + 'Div');
    let Div = document.getElementById(elementId);
    if (Div) {
      Div.remove();
    }
  }
}
