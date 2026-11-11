import { Injectable, OnDestroy } from '@angular/core';
import { VideoWatchdog } from './video-watchdog';

@Injectable({
  providedIn: 'root',
})
export class VideoSoundService implements OnDestroy {
  static readonly TICK_MS = 5000;

  private videoElement: HTMLVideoElement | null = null;
  private timer?: ReturnType<typeof setInterval>;
  readonly watchdog = new VideoWatchdog();

  setVideoElement(video: HTMLVideoElement): void {
    this.videoElement = video;
    clearInterval(this.timer);
    this.timer = setInterval(
      () => this.videoElement && this.watchdog.tick(this.videoElement, Date.now()),
      VideoSoundService.TICK_MS
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  /** Pause for an announcement; the watchdog treats it as intentional (bounded by holdMaxMs). */
  pauseVideo(): void {
    this.watchdog.hold(Date.now());
    this.videoElement?.pause();
  }

  playVideo(): void {
    this.watchdog.release();
    this.videoElement?.play().catch(() => {});
  }

  setVolume(volume: number): void {
    if (this.videoElement) {
      this.videoElement.volume = volume;
    }
  }
}
