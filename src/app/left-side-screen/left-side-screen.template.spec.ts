import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { LeftSideScreenComponent } from './left-side-screen.component';
import { EmphasizedQueuesService } from '../services/emphasized-queues.service';
import { WebSocketService } from '../services/websocket.service';
import { TellerService } from '../services/teller.service';
import { ProcessingService } from '../services/processing.service';
import { TextToSpeechService } from '../services/tts.service';
import { VideoSoundService } from '../services/video-sound.service';

// Regression: an emphasised teller with no queue (the 10 s after "done") used to
// throw TypeError from the template on every change-detection pass, flooding
// console.error and aborting the rest of that pass.
describe('LeftSideScreenComponent template', () => {
  const never = new Subject<unknown>();
  const setup = (tellers: any[], emphasizedQueues: any[] = []) => {
    TestBed.configureTestingModule({
      declarations: [LeftSideScreenComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: EmphasizedQueuesService, useValue: {} },
        { provide: WebSocketService, useValue: { onQueueUpdate: () => never, userCapacityUpdate: () => never, ttsUpdate: () => never } },
        { provide: TellerService, useValue: { getTellersByType: () => of(tellers) } },
        { provide: ProcessingService, useValue: { emphasizedQueues, showEmphasisOverlay: false, getEmphasizedQueues: () => of([]) } },
        { provide: TextToSpeechService, useValue: { onStart$: never, onEnd$: never, onError$: never, speak() {} } },
        { provide: VideoSoundService, useValue: { pauseVideo() {}, playVideo() {} } },
      ],
    });
    const fixture = TestBed.createComponent(LeftSideScreenComponent);
    fixture.detectChanges();
    return fixture;
  };

  // Live bug: after an API restart a teller served a ticket while the server had it inactive, and the COUNTER column
  // showed nobody. Inactive with a ticket = still serving -> shown; inactive and idle -> hidden.
  it('shows a teller that holds a ticket even when inactive; hides an idle inactive one', () => {
    const fixture = setup([
      { tellerNum: 5, tellerType: 'regular', active: false, queue: { queueNum: 'NW001' } },
      { tellerNum: 6, tellerType: 'regular', active: false },
      { tellerNum: 7, tellerType: 'priority', active: false, queue: { queueNum: 'PNW001' } },
      { tellerNum: 8, tellerType: 'regular', active: true },
    ]);
    const shown = (sel: string) => Array.from(fixture.nativeElement.querySelectorAll(sel)).map((e: any) => String(e.windowNum)); // [windowNum] binding on an unknown element sets the DOM property
    expect(shown('app-processing-numbers')).toEqual(['5', '8']);
    expect(shown('app-priority-processing-numbers')).toEqual(['7']);
    fixture.destroy();
  });

  it('renders an emphasised teller that has no queue without throwing', () => {
    const never = new Subject<unknown>();
    const processing = {
      emphasizedQueues: [{ tellerNum: '2', emphasis: true }],
      showEmphasisOverlay: true,
      getEmphasizedQueues: () => of([]),
    };
    TestBed.configureTestingModule({
      declarations: [LeftSideScreenComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: EmphasizedQueuesService, useValue: {} },
        { provide: WebSocketService, useValue: { onQueueUpdate: () => never, userCapacityUpdate: () => never, ttsUpdate: () => never } },
        { provide: TellerService, useValue: { getTellersByType: () => of([{ tellerNum: '2', tellerType: 'regular', active: true }]) } },
        { provide: ProcessingService, useValue: processing },
        { provide: TextToSpeechService, useValue: { onStart$: never, onEnd$: never, onError$: never, speak() {} } },
        { provide: VideoSoundService, useValue: { pauseVideo() {}, playVideo() {} } },
      ],
    });
    const fixture = TestBed.createComponent(LeftSideScreenComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(() => fixture.detectChanges()).not.toThrow();
    fixture.destroy();
  });
});
