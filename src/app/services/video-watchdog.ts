// Keeps the TV's looping video alive without a page reload. Pure (no DOM, no
// timers) so it can be unit-tested; VideoSoundService ticks it every few seconds.
export interface WatchedVideo {
  paused: boolean;
  ended: boolean;
  currentTime: number;
  play(): Promise<void> | void;
  load(): void;
}

export type WatchdogResult = 'ok' | 'held' | 'resumed' | 'reloaded';

export class VideoWatchdog {
  /** Total recoveries since boot (for logs). */
  recoveries = 0;
  /** Recoveries not followed by visible progress; reset once the video moves. */
  consecutiveFailures = 0;

  private heldSince: number | null = null;
  private lastTime = -1;
  private stuckTicks = 0;

  constructor(
    private readonly opts: {
      /** A TTS hold older than this is treated as a stuck engine and released. */
      holdMaxMs: number;
      /** Ticks with no currentTime progress before the source is reloaded. */
      stuckTicks: number;
      log: (msg: string) => void;
    } = { holdMaxMs: 30_000, stuckTicks: 2, log: (m) => console.log(m) }
  ) {}

  /** An intentional pause (announcement playing). */
  hold(now: number): void {
    this.heldSince = now;
  }

  release(): void {
    this.heldSince = null;
  }

  tick(video: WatchedVideo, now: number): WatchdogResult {
    if (this.heldSince !== null) {
      if (now - this.heldSince <= this.opts.holdMaxMs) return 'held';
      this.opts.log(`[tv] tv-watchdog: hold expired after ${now - this.heldSince}ms, resuming`);
      this.heldSince = null;
    }

    if (video.paused) {
      // `ended` is the component's job (next clip); anything else is abnormal.
      if (video.ended) return 'ok';
      this.recover(video, 'paused without hold');
      this.safePlay(video);
      return 'resumed';
    }

    if (video.currentTime === this.lastTime) {
      this.stuckTicks++;
      if (this.stuckTicks >= this.opts.stuckTicks) {
        this.stuckTicks = 0;
        this.recover(video, `stuck at ${video.currentTime.toFixed(2)}s`);
        video.load();
        this.safePlay(video);
        return 'reloaded';
      }
    } else {
      this.stuckTicks = 0;
      this.consecutiveFailures = 0;
    }
    this.lastTime = video.currentTime;
    return 'ok';
  }

  private recover(video: WatchedVideo, why: string): void {
    this.recoveries++;
    this.consecutiveFailures++;
    this.lastTime = video.currentTime;
    this.opts.log(
      `[tv] tv-watchdog: ${why}; recovery #${this.recoveries} (consecutive ${this.consecutiveFailures})`
    );
  }

  private safePlay(video: WatchedVideo): void {
    const p = video.play();
    if (p && typeof (p as Promise<void>).catch === 'function') {
      (p as Promise<void>).catch((e) => this.opts.log(`[tv] tv-watchdog: play() rejected: ${e}`));
    }
  }
}
