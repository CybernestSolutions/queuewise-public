import { Component, OnInit } from '@angular/core';
import { COUNTER } from '../utilities/const/main';
import { EmphasizedQueuesService } from '../services/emphasized-queues.service';
import { WebSocketService } from '../services/websocket.service';
import { TellerService } from '../services/teller.service';
import { ProcessingService } from '../services/processing.service';
import { TextToSpeechService } from '../services/tts.service';

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
    private textToSpeechService: TextToSpeechService
  ) {}
  emphasizedIndex: number = 0;
  counter = COUNTER;
  isPriority = true;
  processes: any;
  textToSpeak: string = 'Attention please. Please proceed to counter number';
  speechRate: number = 0.7; // Adjust the rate as needed

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
    setTimeout(() => {
      this.speakText();
    }, 5000);
    this.tellerService.getTellersByType('').subscribe((tellers) => {
      this.processes = tellers;
      console.log(this.processes);
    });

    this.getEmphasizedQueues();
    this.setupWebSocket();
  }

  speakText(): void {
    this.textToSpeechService.speak(this.textToSpeak, this.speechRate);
  }
  getEmphasizedQueues(): void {
    this.processingService.getEmphasizedQueues();
    setTimeout(() => {
      if (this.processingService.emphasizedQueues.length > 0) {
        this.getEmphasizedQueues();
      }
    }, 10000);
  }

  private setupWebSocket(): void {
    this.webSocketService.onQueueUpdate().subscribe((data: any) => {
      this.tellerService.getTellersByType('').subscribe((tellers) => {
        this.processes = tellers;
        this.getEmphasizedQueues();
      });
    });

    this.webSocketService.userCapacityUpdate().subscribe((data: any) => {
      this.tellerService.getTellersByType('').subscribe((tellers) => {
        this.processes = tellers;
      });
    });
  }
}
