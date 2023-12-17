import { Component, OnInit } from '@angular/core';
import { COUNTER } from '../utilities/const/main';
import { ProcessingService } from '../services/processing.service';
import { EmphasizedQueuesService } from '../services/emphasized-queues.service';
import { WebSocketService } from '../services/websocket.service';
import { TellerService } from '../services/teller.service';

@Component({
  selector: 'app-left-side-screen',
  templateUrl: './left-side-screen.component.html',
  styleUrls: ['./left-side-screen.component.scss'],
})
export class LeftSideScreenComponent implements OnInit {
  constructor(
    public emphasizedQueuesService: EmphasizedQueuesService,
    private webSocketService: WebSocketService,
    private tellerService: TellerService
  ) {}

  counter = COUNTER;
  isPriority = true;
  processes: any;

  ngOnInit(): void {
    // this.emphasizedQueuesService.getEmphasisList();
    this.tellerService.getTellersByType('').subscribe((tellers) => {
      this.processes = tellers;
      console.log(this.processes);
    });
    console.log(`this.processes: ${this.processes}`);
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.webSocketService.onQueueUpdate().subscribe((data: any) => {
      // this.emphasizedQueuesService.getEmphasisList();
      this.tellerService.getTellersByType('').subscribe((tellers) => {
        this.processes = tellers;
        console.log(this.processes);
      });
    });

    this.webSocketService.userCapacityUpdate().subscribe((data: any) => {
      this.tellerService.getTellersByType('').subscribe((tellers) => {
        this.processes = tellers;
        console.log(this.processes);
      });
    });
  }
}
