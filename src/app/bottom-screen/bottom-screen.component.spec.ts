import { fakeAsync, tick } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { BottomScreenComponent } from './bottom-screen.component';

describe('BottomScreenComponent', () => {
  let queueUpdate$: Subject<unknown>;
  let teller: { getQueuesByCategory: jasmine.Spy };
  let cmp: BottomScreenComponent;

  beforeEach(() => {
    queueUpdate$ = new Subject();
    teller = {
      getQueuesByCategory: jasmine
        .createSpy('getQueuesByCategory')
        .and.callFake((c: string) => of({ count: c.length })),
    };
    cmp = new BottomScreenComponent(teller as any, {
      onQueueUpdate: () => queueUpdate$,
    } as any);
  });

  it('loads the four counts once on init', fakeAsync(() => {
    cmp.ngOnInit();
    expect(teller.getQueuesByCategory.calls.allArgs()).toEqual([
      ['all'],
      ['new'],
      ['renewal'],
      ['retirement'],
    ]);
    expect(cmp.totalQueuesInt).toBe(3);
    cmp.ngOnDestroy();
  }));

  it('coalesces a burst of 5 events into one refetch round', fakeAsync(() => {
    cmp.ngOnInit();
    teller.getQueuesByCategory.calls.reset();
    for (let i = 0; i < 5; i++) {
      queueUpdate$.next(null);
      tick(50);
    }
    tick(300);
    expect(teller.getQueuesByCategory.calls.count()).toBe(4);
    cmp.ngOnDestroy();
  }));

  it('refetches twice for events 400ms apart', fakeAsync(() => {
    cmp.ngOnInit();
    teller.getQueuesByCategory.calls.reset();
    queueUpdate$.next(null);
    tick(400);
    queueUpdate$.next(null);
    tick(400);
    expect(teller.getQueuesByCategory.calls.count()).toBe(8);
    cmp.ngOnDestroy();
  }));

  it('survives an HTTP error and refetches on the next event', fakeAsync(() => {
    cmp.ngOnInit();
    teller.getQueuesByCategory.and.returnValue(
      throwError(() => new Error('down'))
    );
    queueUpdate$.next(null);
    tick(300);
    teller.getQueuesByCategory.and.returnValue(of({ count: 9 }));
    queueUpdate$.next(null);
    tick(300);
    expect(cmp.totalQueuesInt).toBe(9);
    cmp.ngOnDestroy();
  }));

  it('makes no calls after destroy', fakeAsync(() => {
    cmp.ngOnInit();
    cmp.ngOnDestroy();
    teller.getQueuesByCategory.calls.reset();
    queueUpdate$.next(null);
    tick(500);
    expect(teller.getQueuesByCategory).not.toHaveBeenCalled();
    expect(queueUpdate$.observed).toBeFalse();
  }));
});
