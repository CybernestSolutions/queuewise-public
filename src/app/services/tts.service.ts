import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voicesLoaded: boolean = false;
  private defaultVoice: SpeechSynthesisVoice | null = null;
  private queuedText: string | null = null;
  private queuedRate: number = 0.7;

  constructor() {
    this.synth = window.speechSynthesis;
    this.fetchVoices();
  }

  fetchVoices(): void {
    this.synth.onvoiceschanged = () => {
      this.defaultVoice = this.findDefaultVoice(this.synth.getVoices());
      this.voicesLoaded = true;
      if (this.queuedText !== null) {
        this.speak(this.queuedText, this.queuedRate);
        this.queuedText = null;
      }
    };
  }

  private findDefaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    return voices.find(voice => voice.name === 'Microsoft Zira - English (United States)') || null;
  }

  speak(text: string, rate: number): void {
    if (this.voicesLoaded) {
      const utterThis = new SpeechSynthesisUtterance(text);
      if (this.defaultVoice) {
        utterThis.voice = this.defaultVoice;
        utterThis.rate = rate; // Adjust speech rate here
        this.synth.speak(utterThis);
      } else {
        console.error('Default voice not available.');
      }
    } else {
      // Queue text to be spoken once voices are loaded
      this.queuedText = text;
      this.queuedRate = rate;
    }
  }
}
