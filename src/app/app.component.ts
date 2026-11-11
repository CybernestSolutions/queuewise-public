import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReloadPolicy } from './services/reload-policy';
import { TextToSpeechService } from './services/tts.service';
import { VideoSoundService } from './services/video-sound.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'queuewise-public-view';
  static readonly CHECK_MS = 60_000;

  private policy = new ReloadPolicy(localStorage);
  private timer?: ReturnType<typeof setInterval>;

  constructor(private tts: TextToSpeechService, private video: VideoSoundService) {}

  // Safety-net reload only: heap over limit, repeated failed video recoveries,
  // or the daily 05:00 reset. Never mid-announcement. Each reload is logged
  // ("[tv]" lines are forwarded to electron-log on the device).
  ngOnInit(): void {
    const last = localStorage.getItem(ReloadPolicy.LAST_KEY);
    if (last) console.log(`[tv] tv-reload: last reload was ${last}`);
    this.timer = setInterval(() => this.check(), AppComponent.CHECK_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  check(now = new Date()): void {
    const mem = (performance as any).memory;
    const reason = this.policy.check({
      now,
      heapMB: mem ? mem.usedJSHeapSize / 1048576 : null,
      failedRecoveries: this.video.watchdog.consecutiveFailures,
      speaking: this.tts.speaking,
    });
    if (!reason) return;
    console.log(`[tv] tv-reload: ${reason}`);
    localStorage.setItem(ReloadPolicy.LAST_KEY, `${now.toISOString()} ${reason}`);
    window.location.reload();
  }
}
