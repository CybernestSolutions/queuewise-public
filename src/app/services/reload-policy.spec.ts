import { ReloadPolicy } from './reload-policy';

describe('ReloadPolicy', () => {
  let store: Map<string, string>;
  let policy: ReloadPolicy;
  const at = (h: number, m = 0, day = 11) => new Date(2026, 10, day, h, m, 0);
  const ok = { heapMB: 20, failedRecoveries: 0, speaking: false };

  beforeEach(() => {
    store = new Map();
    policy = new ReloadPolicy({
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
    });
  });

  it('keeps running in the normal case', () => {
    expect(policy.check({ now: at(14), ...ok })).toBeNull();
  });

  it('reloads when the heap passes the limit', () => {
    expect(policy.check({ now: at(14), ...ok, heapMB: 201 })).toContain('heap 201MB');
    expect(policy.check({ now: at(14), ...ok, heapMB: 200 })).toBeNull();
  });

  it('tolerates a missing heap reading', () => {
    expect(policy.check({ now: at(14), ...ok, heapMB: null })).toBeNull();
  });

  it('reloads after 3 consecutive failed watchdog recoveries', () => {
    expect(policy.check({ now: at(14), ...ok, failedRecoveries: 2 })).toBeNull();
    expect(policy.check({ now: at(14), ...ok, failedRecoveries: 3 })).toContain('watchdog failed 3');
  });

  it('never reloads mid-announcement, whatever the reason', () => {
    expect(policy.check({ now: at(5), heapMB: 999, failedRecoveries: 9, speaking: true })).toBeNull();
  });

  it('reloads once in the 05:00 hour per day, surviving the reload itself', () => {
    expect(policy.check({ now: at(4, 59), ...ok })).toBeNull();
    expect(policy.check({ now: at(5, 0), ...ok })).toContain('daily 05:00');
    // same day, fresh instance (the page just reloaded) sharing the persisted store
    const fresh = new ReloadPolicy({
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
    });
    expect(fresh.check({ now: at(5, 1), ...ok })).toBeNull();
    expect(fresh.check({ now: at(5, 59), ...ok })).toBeNull();
    expect(fresh.check({ now: at(6, 0), ...ok })).toBeNull();
    // next day
    expect(fresh.check({ now: at(5, 0, 12), ...ok })).toContain('daily 05:00');
  });

  it('a deferred daily reload (speaking at 05:00) still happens later that hour', () => {
    expect(policy.check({ now: at(5, 0), ...ok, speaking: true })).toBeNull();
    expect(policy.check({ now: at(5, 1), ...ok })).toContain('daily 05:00');
  });
});
