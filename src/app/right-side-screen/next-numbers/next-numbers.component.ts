import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, debounceTime, merge, of, switchMap, takeUntil } from 'rxjs';
import { ProcessingService } from 'src/app/services/processing.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { TICKET_NUMBER } from 'src/app/utilities/const/right-side-screen';

@Component({
  selector: 'app-next-numbers',
  templateUrl: './next-numbers.component.html',
  styleUrls: ['./next-numbers.component.scss'],
})
export class NextNumbersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  ticketNumberString = TICKET_NUMBER;
  priorityString = 'PRIORITY';
  nextQueues: any[] = [];

  constructor(
    public processingData: ProcessingService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    // initial load + one refetch per burst of queueUpdate events
    merge(
      of(null),
      this.webSocketService.onQueueUpdate().pipe(debounceTime(300))
    )
      .pipe(
        switchMap(() => this.processingData.getNextQueues()),
        takeUntil(this.destroy$)
      )
      .subscribe(() => (this.nextQueues = this.processingData.nextQueues));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
