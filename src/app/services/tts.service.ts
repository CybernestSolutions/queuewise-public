import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  voices: SpeechSynthesisVoice[];

  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.fetchVoices();
  }

  fetchVoices(): void {
    this.voices = this.synth.getVoices();
    if (this.voices.length === 0) {
      // If voices are not yet loaded, wait for voiceschanged event
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  speak(text: string, selectedVoiceIndex: number, rate: number): void {
    const utterThis = new SpeechSynthesisUtterance(text);
    if (this.voices.length > 0) {
      utterThis.voice = this.voices[selectedVoiceIndex];
      utterThis.rate = rate; // Adjust speech rate here
      this.synth.speak(utterThis);
    } else {
      console.error('Voices not available.');
    }
  }
}
