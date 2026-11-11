import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voicesLoaded = false;
  private defaultVoice: SpeechSynthesisVoice | null = null;

  private queuedText: string | null = null;
  private queuedRate: number = 0.7;

  // The utterance in flight. Kept referenced (Chromium can drop end/error events
  // on a collected utterance) and force-ended if the engine never reports back,
  // so a stuck SAPI voice cannot leave the video paused and announcements blocked.
  private current: SpeechSynthesisUtterance | null = null;
  private endTimer?: ReturnType<typeof setTimeout>;
  /** True between onStart$ and onEnd$/onError$. */
  speaking = false;

  // 🔥 Events to sync UI/video with TTS
  public onStart$ = new Subject<void>();
  public onEnd$ = new Subject<void>();
  public onError$ = new Subject<any>();

  constructor() {
    this.synth = window.speechSynthesis;
    this.fetchVoices();

    // In some environments, voices are already available
    const existing = this.synth.getVoices();
    if (existing?.length) {
      this.defaultVoice = this.findDefaultVoice(existing);
      this.voicesLoaded = true;
    }
  }

  fetchVoices(): void {
    this.synth.onvoiceschanged = () => {
      const voices = this.synth.getVoices();
      this.defaultVoice = this.findDefaultVoice(voices);
      this.voicesLoaded = true;

      // Speak queued text after voices load
      if (this.queuedText !== null) {
        const t = this.queuedText;
        const r = this.queuedRate;
        this.queuedText = null;
        this.speak(t, r);
      }
    };
  }

  private findDefaultVoice(
    voices: SpeechSynthesisVoice[]
  ): SpeechSynthesisVoice | null {
    return (
      voices.find(
        (v) => v.name === 'Microsoft Zira - English (United States)'
      ) || null
    );
  }

  stop(): void {
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }
  }

  speak(text: string, rate: number = 0.7): void {
    if (!text?.trim()) return;

    // if voices not loaded yet, queue it
    if (!this.voicesLoaded) {
      this.queuedText = text;
      this.queuedRate = rate;
      return;
    }

    // Stop any existing speech (prevents overlap)
    this.stop();

    const utter = new SpeechSynthesisUtterance(text);

    if (this.defaultVoice) {
      utter.voice = this.defaultVoice;
    }
    utter.rate = rate;

    // Only the utterance in flight may finish; a cancelled one is ignored.
    const finish = (emit: () => void) => {
      if (this.current !== utter) return;
      this.current = null;
      clearTimeout(this.endTimer);
      this.speaking = false;
      emit();
    };

    utter.onstart = () => {
      this.speaking = true;
      this.onStart$.next();
    };
    utter.onend = () => finish(() => this.onEnd$.next());
    utter.onerror = (e) => finish(() => this.onError$.next(e));

    this.current = utter;
    clearTimeout(this.endTimer);
    this.endTimer = setTimeout(() => {
      console.log(`[tv] tts: no end event after ${TextToSpeechService.maxMs(text, rate)}ms, forcing end`);
      this.synth.cancel();
      finish(() => this.onEnd$.next());
    }, TextToSpeechService.maxMs(text, rate));

    this.synth.speak(utter);
  }

  /** Generous upper bound for an utterance: ~150 ms per char at rate 1, capped at 30 s. */
  static maxMs(text: string, rate: number): number {
    return Math.min(30_000, 4000 + (text.length * 150) / Math.max(rate, 0.1));
  }
}
