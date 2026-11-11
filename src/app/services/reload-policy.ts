// Safety-net reload policy for the unattended TV. Pure so it can be unit-tested;
// AppComponent evaluates it once a minute and reloads only on a returned reason.
export interface ReloadInput {
  now: Date;
  /** performance.memory.usedJSHeapSize in MB, or null when unavailable. */
  heapMB: number | null;
  /** VideoWatchdog.consecutiveFailures */
  failedRecoveries: number;
  /** An announcement is playing: never reload mid-announcement. */
  speaking: boolean;
}

export class ReloadPolicy {
  constructor(
    private readonly store: Pick<Storage, 'getItem' | 'setItem'>,
    private readonly opts = { heapLimitMB: 200, maxFailures: 3, dailyHour: 5 }
  ) {}

  /** Returns the reason to reload, or null to keep running. Idempotent for the daily rule. */
  check(i: ReloadInput): string | null {
    if (i.speaking) return null;
    if (i.heapMB !== null && i.heapMB > this.opts.heapLimitMB) {
      return `heap ${i.heapMB.toFixed(0)}MB > ${this.opts.heapLimitMB}MB`;
    }
    if (i.failedRecoveries >= this.opts.maxFailures) {
      return `video watchdog failed ${i.failedRecoveries} times`;
    }
    const day = i.now.toDateString(); // local date; the TV's clock is local
    if (i.now.getHours() === this.opts.dailyHour && this.store.getItem(ReloadPolicy.DAILY_KEY) !== day) {
      this.store.setItem(ReloadPolicy.DAILY_KEY, day);
      return `daily ${String(this.opts.dailyHour).padStart(2, '0')}:00 reset`;
    }
    return null;
  }

  static readonly DAILY_KEY = 'tv-daily-reload';
  static readonly LAST_KEY = 'tv-last-reload';
}
