import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voicesLoaded = false;
  private defaultVoice: SpeechSynthesisVoice | null = null;

  private queuedText: string | null = null;
  private queuedRate: number = 0.7;

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

    utter.onstart = () => this.onStart$.next();
    utter.onend = () => this.onEnd$.next();
    utter.onerror = (e) => this.onError$.next(e);

    this.synth.speak(utter);
  }
}
