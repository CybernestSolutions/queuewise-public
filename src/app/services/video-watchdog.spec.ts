import { VideoWatchdog, WatchedVideo } from './video-watchdog';

class FakeVideo implements WatchedVideo {
  paused = false;
  ended = false;
  currentTime = 0;
  src?: string;
  plays = 0;
  loads = 0;
  rejectPlay = false;
  play() {
    this.plays++;
    if (this.rejectPlay) return Promise.reject(new Error('NotAllowedError'));
    this.paused = false;
    return Promise.resolve();
  }
  load() {
    this.loads++;
  }
}

describe('VideoWatchdog', () => {
  let v: FakeVideo;
  let logs: string[];
  let wd: VideoWatchdog;
  const T = 5000;

  beforeEach(() => {
    v = new FakeVideo();
    logs = [];
    wd = new VideoWatchdog({ holdMaxMs: 30_000, stuckTicks: 2, log: (m) => logs.push(m) });
  });

  it('does nothing while the video progresses', () => {
    for (let i = 1; i <= 5; i++) {
      v.currentTime = i;
      expect(wd.tick(v, i * T)).toBe('ok');
    }
    expect(v.plays).toBe(0);
    expect(wd.recoveries).toBe(0);
    expect(logs).toEqual([]);
  });

  it('resumes a video paused without a hold and logs it', () => {
    v.paused = true;
    expect(wd.tick(v, T)).toBe('resumed');
    expect(v.plays).toBe(1);
    expect(v.paused).toBeFalse();
    expect(wd.recoveries).toBe(1);
    expect(logs[0]).toContain('tv-watchdog: paused without hold');
  });

  it('leaves an intentional (announcement) pause alone within holdMaxMs', () => {
    wd.hold(0);
    v.paused = true;
    expect(wd.tick(v, 10_000)).toBe('held');
    expect(wd.tick(v, 30_000)).toBe('held');
    expect(v.plays).toBe(0);
  });

  it('releases a hold that outlives holdMaxMs (stuck TTS) and resumes', () => {
    wd.hold(0);
    v.paused = true;
    expect(wd.tick(v, 30_001)).toBe('resumed');
    expect(v.plays).toBe(1);
    expect(logs[0]).toContain('hold expired');
  });

  it('release() ends the hold early', () => {
    wd.hold(0);
    wd.release();
    v.paused = true;
    expect(wd.tick(v, 1000)).toBe('resumed');
  });

  it('ignores the paused state at ended (component swaps the clip)', () => {
    v.paused = true;
    v.ended = true;
    expect(wd.tick(v, T)).toBe('ok');
    expect(v.plays).toBe(0);
  });

  it('reloads the source when currentTime is stuck for stuckTicks ticks', () => {
    v.currentTime = 3;
    expect(wd.tick(v, T)).toBe('ok'); // first observation
    expect(wd.tick(v, 2 * T)).toBe('ok'); // stuck 1
    expect(wd.tick(v, 3 * T)).toBe('reloaded'); // stuck 2
    expect(v.loads).toBe(1);
    expect(v.plays).toBe(1);
    expect(logs[0]).toContain('stuck at 3.00s');
  });

  it('counts consecutive failures and resets them once the video moves', () => {
    v.paused = true;
    v.rejectPlay = true;
    wd.tick(v, T);
    wd.tick(v, 2 * T);
    wd.tick(v, 3 * T);
    expect(wd.consecutiveFailures).toBe(3);
    expect(wd.recoveries).toBe(3);
    v.rejectPlay = false;
    v.paused = false;
    v.currentTime = 1;
    wd.tick(v, 4 * T);
    v.currentTime = 2;
    wd.tick(v, 5 * T);
    expect(wd.consecutiveFailures).toBe(0);
    expect(wd.recoveries).toBe(3);
  });

  it('logs a rejected play() instead of throwing', async () => {
    v.paused = true;
    v.rejectPlay = true;
    wd.tick(v, T);
    await Promise.resolve();
    await Promise.resolve();
    expect(logs.some((l) => l.includes('play() rejected'))).toBeTrue();
  });

  it('stays idle with no source (nothing imported): no recovery, no failures, no reload', () => {
    v.src = '';
    v.paused = true;
    for (let i = 1; i <= 10; i++) expect(wd.tick(v, i * T)).toBe('idle');
    expect([v.plays, v.loads, wd.recoveries, wd.consecutiveFailures]).toEqual([0, 0, 0, 0]);
    expect(logs).toEqual([]);
  });
});
