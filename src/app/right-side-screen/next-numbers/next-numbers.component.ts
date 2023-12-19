import { Component, OnInit } from '@angular/core';
import { ProcessingService } from 'src/app/services/processing.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { TICKET_NUMBER } from 'src/app/utilities/const/right-side-screen';

@Component({
  selector: 'app-next-numbers',
  templateUrl: './next-numbers.component.html',
  styleUrls: ['./next-numbers.component.scss'],
})
export class NextNumbersComponent implements OnInit {
  ticketNumberString = TICKET_NUMBER;
  priorityString = 'PRIORITY';
  nextQueues: any[] = [
    {queueNumber: '', priority: null},
  ];
  constructor(
    public processingData: ProcessingService,
    private webSocketService: WebSocketService
  ) {}
  ngOnInit() {
    this.processingData.getNextQueues();
    this.setupWebSocket();
    
  }
  private setupWebSocket() {
    this.webSocketService.onQueueUpdate().subscribe((data: any) => {
      this.processingData.getNextQueues();
      this.nextQueues = this.processingData.nextQueues;
      console.log(this.nextQueues);
    });
  }
}
