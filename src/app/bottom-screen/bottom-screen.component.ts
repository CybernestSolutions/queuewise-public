import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  EMPTY,
  Subject,
  catchError,
  debounceTime,
  forkJoin,
  merge,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
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
export class BottomScreenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
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
    // initial load + one forkJoin per burst of queueUpdate events
    merge(
      of(null),
      this.webSocketService.onQueueUpdate().pipe(debounceTime(300))
    )
      .pipe(
        switchMap(() =>
          forkJoin([
            this.tellerService.getQueuesByCategory('all'),
            this.tellerService.getQueuesByCategory('new'),
            this.tellerService.getQueuesByCategory('renewal'),
            this.tellerService.getQueuesByCategory('retirement'),
          ]).pipe(catchError(() => EMPTY)) // a failed round must not kill the stream
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(([all, nw, renewal, retirement]: any[]) => {
        this.totalQueuesInt = all.count;
        this.newMemberInt = nw.count;
        this.renewalInt = renewal.count;
        this.retirementInt = retirement.count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
