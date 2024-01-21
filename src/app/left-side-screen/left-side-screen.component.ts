import { Component, OnInit } from '@angular/core';
import { COUNTER } from '../utilities/const/main';
import { EmphasizedQueuesService } from '../services/emphasized-queues.service';
import { WebSocketService } from '../services/websocket.service';
import { TellerService } from '../services/teller.service';
import { ProcessingService } from '../services/processing.service';
import { TextToSpeechService } from '../services/tts.service';
import { VideoSoundService } from '../services/video-sound.service';

@Component({
  selector: 'app-left-side-screen',
  templateUrl: './left-side-screen.component.html',
  styleUrls: ['./left-side-screen.component.scss'],
})
export class LeftSideScreenComponent implements OnInit {
  constructor(
    public emphasizedQueuesService: EmphasizedQueuesService,
    private webSocketService: WebSocketService,
    private tellerService: TellerService,
    public processingService: ProcessingService,
    private textToSpeechService: TextToSpeechService,
    private videoSoundService: VideoSoundService
  ) {}
  emphasizedIndex: number = 0;
  counter = COUNTER;
  isPriority = true;
  speakTextInProgress: boolean = false;
  processes: any;
  speechRate: number = 0.7; // Adjust the rate as needed
  isEmphasisPresent = false;

  isEmphasized(index: number): boolean {
    const process = this.processes[index];
    const emphasizedQueue = this.processingService.emphasizedQueues[0];
    const isEmphasized = this.processingService.showEmphasisOverlay;

    if (
      process &&
      emphasizedQueue &&
      process.tellerNum === emphasizedQueue.tellerNum &&
      isEmphasized
    ) {
      return true;
    }
    return false;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.greetings();
    }, 3000);
    this.tellerService.getTellersByType('').subscribe((tellers) => {
      this.processes = tellers;
      console.log(this.processes);
    });
    this.setupWebSocket();
  }
  greetings() {
    this.textToSpeechService.speak(
      'Welcome to Business Permit Licensing Office!',
      1
    );
  }
  getEmphasizedQueues(): void {
    this.processingService.getEmphasizedQueues();
    this.processingService.showEmphasisOverlay = true;
    setTimeout(() => {
      if (this.processingService.emphasizedQueues.length > 0) {
        this.getEmphasizedQueues();
      } else {
        this.videoSoundService.playVideo();
        this.isEmphasisPresent = false;
      }
    }, 5000);
  }

  private setupWebSocket(): void {
    this.webSocketService.onQueueUpdate().subscribe((data: any) => {
      this.tellerService.getTellersByType('').subscribe((tellers) => {
        this.processes = tellers;
      });
    });

    this.webSocketService.ttsUpdate().subscribe((data: any) => {
      this.getEmphasizedQueues();
      this.checkEmphasizedQueues();
    });

    this.webSocketService.userCapacityUpdate().subscribe((data: any) => {
      this.tellerService.getTellersByType('').subscribe((tellers) => {
        this.processes = tellers;
      });
    });
  }
  checkEmphasizedQueues(): void {
    setInterval(() => {
      const hasEmphasizedQueue =
        this.processingService.emphasizedQueues.length > 0;

      if (!hasEmphasizedQueue && this.isEmphasisPresent) {
        this.handleNoEmphasis();
      } else if (hasEmphasizedQueue && !this.speakTextInProgress) {
        this.handleEmphasis();
      }
    }, 1000);
  }

  handleEmphasis(): void {
    this.speakTextInProgress = true;

    const emphasizedQueue = this.processingService.emphasizedQueues[0];
    const counterNum = emphasizedQueue?.tellerNum;
    const queueNum = emphasizedQueue?.queue?.queueNum;
    const queueType = emphasizedQueue?.queue?.type;
    console.log(emphasizedQueue);

    if (counterNum && queueNum) {
      const textToSpeak = `Attention, ${queueType} number ${queueNum}, Please Proceed to counter number ${counterNum}. Number ${queueNum}, Counter ${counterNum}`;
      this.textToSpeechService.speak(textToSpeak, this.speechRate);

      // Pause video when emphasis occurs
      this.videoSoundService.pauseVideo();
      this.isEmphasisPresent = true;

      // Reset the flag after speaking
      setTimeout(() => {
        this.speakTextInProgress = false;
        this.videoSoundService.playVideo(); // Play video after TTS completes
        this.isEmphasisPresent = false;
      }, 15000); // Adjust this timeout as needed
    }
  }

  handleNoEmphasis(): void {
    this.videoSoundService.playVideo();
    this.isEmphasisPresent = false;
    this.processingService.showEmphasisOverlay = false;
  }
}
