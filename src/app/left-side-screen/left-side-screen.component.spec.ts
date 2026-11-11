import { fakeAsync, tick } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { LeftSideScreenComponent } from './left-side-screen.component';

describe('LeftSideScreenComponent', () => {
  let queueUpdate$: Subject<unknown>;
  let capacity$: Subject<unknown>;
  let tts$: Subject<unknown>;
  let ttsSvc: any;
  let teller: { getTellersByType: jasmine.Spy };
  let processing: any;
  let cmp: LeftSideScreenComponent;

  beforeEach(() => {
    queueUpdate$ = new Subject();
    capacity$ = new Subject();
    tts$ = new Subject();
    teller = {
      getTellersByType: jasmine
        .createSpy('getTellersByType')
        .and.callFake(() => of([])),
    };
    processing = {
      emphasizedQueues: [],
      showEmphasisOverlay: false,
      getEmphasizedQueues: jasmine
        .createSpy('getEmphasizedQueues')
        .and.callFake(() => {
          processing.emphasizedQueues = [
            { tellerNum: '2', queue: { queueNum: 'N001', type: 'New' } },
          ];
          return of(processing.emphasizedQueues);
        }),
    };
    ttsSvc = {
      onStart$: new Subject<void>(),
      onEnd$: new Subject<void>(),
      onError$: new Subject<void>(),
      speak: jasmine.createSpy('speak'),
    };
    cmp = new LeftSideScreenComponent(
      {} as any,
      {
        onQueueUpdate: () => queueUpdate$,
        userCapacityUpdate: () => capacity$,
        ttsUpdate: () => tts$,
      } as any,
      teller as any,
      processing,
      ttsSvc,
      { pauseVideo() {}, playVideo() {} } as any
    );
  });

  it('loads tellers once on init', fakeAsync(() => {
    cmp.ngOnInit();
    expect(teller.getTellersByType).toHaveBeenCalledTimes(1);
    cmp.ngOnDestroy();
  }));

  it('coalesces mixed queueUpdate/userCapacityUpdate bursts into one refetch', fakeAsync(() => {
    cmp.ngOnInit();
    teller.getTellersByType.calls.reset();
    for (let i = 0; i < 5; i++) {
      (i % 2 ? capacity$ : queueUpdate$).next(null);
      tick(50);
    }
    tick(300);
    expect(teller.getTellersByType).toHaveBeenCalledTimes(1);
    cmp.ngOnDestroy();
  }));

  it('refetches twice for events 400ms apart', fakeAsync(() => {
    cmp.ngOnInit();
    teller.getTellersByType.calls.reset();
    queueUpdate$.next(null);
    tick(400);
    queueUpdate$.next(null);
    tick(400);
    expect(teller.getTellersByType).toHaveBeenCalledTimes(2);
    cmp.ngOnDestroy();
  }));

  it('survives an HTTP error and refetches on the next event', fakeAsync(() => {
    cmp.ngOnInit();
    teller.getTellersByType.calls.reset();
    teller.getTellersByType.and.returnValue(
      throwError(() => new Error('down'))
    );
    queueUpdate$.next(null);
    tick(300);
    teller.getTellersByType.and.returnValue(of([{ tellerNum: '1' }]));
    queueUpdate$.next(null);
    tick(300);
    expect(teller.getTellersByType).toHaveBeenCalledTimes(2);
    expect(cmp.processes).toEqual([{ tellerNum: '1' }]);
    cmp.ngOnDestroy();
  }));

  it('makes no calls after destroy and clears the greeting timer', fakeAsync(() => {
    cmp.ngOnInit();
    cmp.ngOnDestroy();
    teller.getTellersByType.calls.reset();
    queueUpdate$.next(null);
    capacity$.next(null);
    tts$.next(null);
    tick(5000); // would fire the 3s greeting if not cleared
    expect(teller.getTellersByType).not.toHaveBeenCalled();
    expect(processing.getEmphasizedQueues).not.toHaveBeenCalled();
    expect(ttsSvc.speak).not.toHaveBeenCalled();
  }));

  describe('TTS path', () => {
    it('one ttsUpdate announces exactly once', fakeAsync(() => {
      cmp.ngOnInit();
      tts$.next(null);
      expect(ttsSvc.speak).toHaveBeenCalledTimes(1);
      expect(ttsSvc.speak.calls.mostRecent().args[0]).toContain('N001');
      cmp.ngOnDestroy();
    }));

    it('does not re-announce the same queue when speech ends', fakeAsync(() => {
      cmp.ngOnInit();
      tts$.next(null);
      ttsSvc.onStart$.next();
      ttsSvc.onEnd$.next();
      expect(ttsSvc.speak).toHaveBeenCalledTimes(1);
      cmp.ngOnDestroy();
    }));

    it('queueUpdate bursts never announce', fakeAsync(() => {
      cmp.ngOnInit();
      queueUpdate$.next(null);
      tick(300);
      expect(ttsSvc.speak).not.toHaveBeenCalled();
      cmp.ngOnDestroy();
    }));

    it('ignores ttsUpdate while speech is in progress', fakeAsync(() => {
      cmp.ngOnInit();
      ttsSvc.onStart$.next();
      tts$.next(null);
      expect(ttsSvc.speak).not.toHaveBeenCalled();
      cmp.ngOnDestroy();
    }));
  });
});
