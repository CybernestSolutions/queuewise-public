import { fakeAsync, tick } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { NextNumbersComponent } from './next-numbers.component';

describe('NextNumbersComponent', () => {
  let queueUpdate$: Subject<unknown>;
  let processing: { nextQueues: any[]; getNextQueues: jasmine.Spy };
  let cmp: NextNumbersComponent;

  beforeEach(() => {
    queueUpdate$ = new Subject();
    processing = {
      nextQueues: [],
      getNextQueues: jasmine
        .createSpy('getNextQueues')
        .and.callFake(() => of([])),
    };
    cmp = new NextNumbersComponent(processing as any, {
      onQueueUpdate: () => queueUpdate$,
    } as any);
  });

  it('loads once on init', fakeAsync(() => {
    cmp.ngOnInit();
    expect(processing.getNextQueues).toHaveBeenCalledTimes(1);
    cmp.ngOnDestroy();
  }));

  it('coalesces a burst of 5 events into one refetch', fakeAsync(() => {
    cmp.ngOnInit();
    processing.getNextQueues.calls.reset();
    for (let i = 0; i < 5; i++) {
      queueUpdate$.next(null);
      tick(50);
    }
    tick(300);
    expect(processing.getNextQueues).toHaveBeenCalledTimes(1);
    cmp.ngOnDestroy();
  }));

  it('refetches twice for events 400ms apart', fakeAsync(() => {
    cmp.ngOnInit();
    processing.getNextQueues.calls.reset();
    queueUpdate$.next(null);
    tick(400);
    queueUpdate$.next(null);
    tick(400);
    expect(processing.getNextQueues).toHaveBeenCalledTimes(2);
    cmp.ngOnDestroy();
  }));

  it('survives an HTTP error and refetches on the next event', fakeAsync(() => {
    cmp.ngOnInit();
    processing.getNextQueues.calls.reset();
    processing.getNextQueues.and.returnValue(
      throwError(() => new Error('down'))
    );
    queueUpdate$.next(null);
    tick(300);
    processing.getNextQueues.and.returnValue(of([]));
    queueUpdate$.next(null);
    tick(300);
    expect(processing.getNextQueues).toHaveBeenCalledTimes(2);
    cmp.ngOnDestroy();
  }));

  it('makes no calls after destroy', fakeAsync(() => {
    cmp.ngOnInit();
    cmp.ngOnDestroy();
    processing.getNextQueues.calls.reset();
    queueUpdate$.next(null);
    tick(500);
    expect(processing.getNextQueues).not.toHaveBeenCalled();
  }));
});
