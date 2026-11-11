import { fakeAsync, tick } from '@angular/core/testing';
import { TextToSpeechService } from './tts.service';

describe('TextToSpeechService', () => {
  let synth: any;
  let utterances: any[];
  let realSynth: SpeechSynthesis;
  let RealUtterance: any;

  beforeEach(() => {
    realSynth = window.speechSynthesis;
    RealUtterance = (window as any).SpeechSynthesisUtterance;
    utterances = [];
    synth = {
      speaking: false,
      pending: false,
      onvoiceschanged: null,
      getVoices: () => [{ name: 'Microsoft Zira - English (United States)' }],
      speak: jasmine.createSpy('speak').and.callFake((u: any) => utterances.push(u)),
      cancel: jasmine.createSpy('cancel'),
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    (window as any).SpeechSynthesisUtterance = class {
      text: string;
      voice: any = null;
      rate = 1;
      onstart: any;
      onend: any;
      onerror: any;
      constructor(t: string) {
        this.text = t;
      }
    };
  });

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', { value: realSynth, configurable: true });
    (window as any).SpeechSynthesisUtterance = RealUtterance;
  });

  it('tracks speaking across start and end', () => {
    const svc = new TextToSpeechService();
    const ends: number[] = [];
    svc.onEnd$.subscribe(() => ends.push(1));
    svc.speak('hello');
    expect(svc.speaking).toBeFalse();
    utterances[0].onstart({});
    expect(svc.speaking).toBeTrue();
    utterances[0].onend({});
    expect(svc.speaking).toBeFalse();
    expect(ends.length).toBe(1);
  });

  it('forces an end when the engine never reports one', fakeAsync(() => {
    const svc = new TextToSpeechService();
    const ends: number[] = [];
    svc.onEnd$.subscribe(() => ends.push(1));
    const text = 'Attention, New number NW001, Please Proceed to counter number 2.';
    svc.speak(text, 0.7);
    utterances[0].onstart({});
    tick(TextToSpeechService.maxMs(text, 0.7) - 1);
    expect(ends.length).toBe(0);
    expect(svc.speaking).toBeTrue();
    tick(1);
    expect(ends.length).toBe(1);
    expect(svc.speaking).toBeFalse();
    expect(synth.cancel).toHaveBeenCalled();
    // a late native end must not emit a second time
    utterances[0].onend({});
    expect(ends.length).toBe(1);
  }));

  it('a superseded utterance cannot finish on behalf of the current one', fakeAsync(() => {
    const svc = new TextToSpeechService();
    const ends: number[] = [];
    svc.onEnd$.subscribe(() => ends.push(1));
    svc.speak('first');
    svc.speak('second');
    utterances[0].onend({}); // cancel() of the first arrives late
    expect(ends.length).toBe(0);
    utterances[1].onend({});
    expect(ends.length).toBe(1);
    tick(31_000); // no stale timer left behind
    expect(ends.length).toBe(1);
  }));

  it('caps the forced-end bound at 30 s', () => {
    expect(TextToSpeechService.maxMs('x'.repeat(10_000), 0.7)).toBe(30_000);
    expect(TextToSpeechService.maxMs('', 1)).toBe(4000);
  });
});
