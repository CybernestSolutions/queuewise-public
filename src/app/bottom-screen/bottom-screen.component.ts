import { Component } from '@angular/core';
import {
  GREETINGS,
  NEW,
  QUEUE_STAT_DASHBOARD,
  RENEWAL,
  RETIREMENT,
  TOTAL_QUEUES,
} from '../utilities/const/bottom-side-screen';
import { TellerService } from '../services/teller.service';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-bottom-screen',
  templateUrl: './bottom-screen.component.html',
  styleUrls: ['./bottom-screen.component.scss'],
})
export class BottomScreenComponent {
  constructor(
    private tellerService: TellerService,
    private webSocketService: WebSocketService
  ) {}
  queueStatusDashBoard = QUEUE_STAT_DASHBOARD;
  totalQueuesString = TOTAL_QUEUES;
  newMember = NEW;
  renewal = RENEWAL;
  retirement = RETIREMENT;
  greetings = GREETINGS;
  totalQueuesInt = 0;
  renewalInt = 0;
  newMemberInt = 0;
  retirementInt = 0;

  ngOnInit(): void {
    this.tellerService.getQueuesByCategory('all').subscribe((total: any) => {
      this.totalQueuesInt = total.count;
    });
    this.tellerService.getQueuesByCategory('new').subscribe((total: any) => {
      this.newMemberInt = total.count;
    });
    this.tellerService
      .getQueuesByCategory('renewal')
      .subscribe((total: any) => {
        this.renewalInt = total.count;
      });
    this.tellerService
      .getQueuesByCategory('retirement')
      .subscribe((total: any) => {
        this.retirementInt = total.count;
      });
    this.setupWebSocket();
  }
  private setupWebSocket() {
    this.webSocketService.onQueueUpdate().subscribe((data: any) => {
      this.tellerService.getQueuesByCategory('all').subscribe((total: any) => {
        this.totalQueuesInt = total.count;
      });
      this.tellerService.getQueuesByCategory('new').subscribe((total: any) => {
        this.newMemberInt = total.count;
      });
      this.tellerService
        .getQueuesByCategory('renewal')
        .subscribe((total: any) => {
          this.renewalInt = total.count;
        });
      this.tellerService
        .getQueuesByCategory('retirement')
        .subscribe((total: any) => {
          this.retirementInt = total.count;
        });
    });
  }
}
