import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideoSoundService {
  private videoElement: HTMLVideoElement | null = null;

  setVideoElement(video: HTMLVideoElement): void {
    this.videoElement = video;
  }

  pauseVideo(): void {
    if (this.videoElement) {
      this.videoElement.pause();
    }
  }

  playVideo(): void {
    if (this.videoElement) {
      this.videoElement.play();
    }
  }

  setVolume(volume: number): void {
    if (this.videoElement) {
      this.videoElement.volume = volume;
    }
  }
}
