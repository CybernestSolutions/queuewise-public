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

    if (
      process &&
      emphasizedQueue &&
      process.tellerNum === emphasizedQueue.tellerNum
    ) {
      return true;
    }
    return false;
  }

  ngOnInit(): void {
    this.tellerService.getTellersByType('').subscribe((tellers) => {
      this.processes = tellers;
      console.log(this.processes);
    });

    this.setupWebSocket();
    this.checkEmphasizedQueues(); // Initial call to check emphasized queues
  }

  getEmphasizedQueues(): void {
    this.processingService.getEmphasizedQueues();
    setTimeout(() => {
      if (this.processingService.emphasizedQueues.length > 0) {
        this.getEmphasizedQueues();
      } else {
        this.videoSoundService.playVideo();
        this.isEmphasisPresent = false;
      }
    }, 10000);
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
      if (
        !this.processingService.emphasizedQueues ||
        this.processingService.emphasizedQueues.length === 0
      ) {
        this.handleNoEmphasis();
      } else {
        this.handleEmphasis();
      }
    }, 1000);
  }

  handleEmphasis(): void {
    if (!this.speakTextInProgress && !this.isEmphasisPresent) {
      this.speakText();
      this.videoSoundService.pauseVideo();
      this.isEmphasisPresent = true;
    }
  }

  handleNoEmphasis(): void {
    if (this.isEmphasisPresent) {
      this.videoSoundService.playVideo();
      this.isEmphasisPresent = false;
    }
  }

  speakText(): void {
    this.speakTextInProgress = true;

    const emphasizedQueue = this.processingService.emphasizedQueues[0];
    const counterNum = emphasizedQueue?.tellerNum;
    const queueNum = emphasizedQueue?.queue?.queueNum;

    if (counterNum && queueNum) {
      const textToSpeak = `Attention, queue number ${queueNum}, Please Proceed to counter number ${counterNum}`;
      this.textToSpeechService.speak(textToSpeak, this.speechRate);
    }

    setTimeout(() => {
      this.speakTextInProgress = false;
    }, 10000); // Adjust this timeout as needed
  }
}
