import { Injectable } from '@angular/core';
import { TellerService } from './teller.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProcessingService {
  constructor(private tellerService: TellerService) {}
  processes: any[] = [];
  nextQueues: any[] = [{ queueNum: '', priority: null }];
  showEmphasisOverlay: boolean = false;
  emphasizedQueues: any = [
    // {
    //   queue: {
    //     queueNum: "initial",
    //     priority: null,
    //   },
    //   tellerNum: '',
    //   windowNum: '',
    // },
  ];

  getEmphasizedQueues(): Observable<any[]> {
    return this.tellerService.getEmphasizedTellers().pipe(
      tap((queues: any[]) => {
        this.emphasizedQueues = queues || [];
        console.log('emphasizedQueues:', this.emphasizedQueues);
      })
    );
  }

  getNextQueues(): Observable<any[]> {
    return this.tellerService.getNextQueues().pipe(
      tap((queues) => {
        this.nextQueues = queues.filter((queue) => queue.status === 'raw');
        this.nextQueues.sort((a, b) => {
          if (a.queueNum.startsWith('P') && !b.queueNum.startsWith('P')) {
            return -1; // Priority queue comes first
          } else if (!a.queueNum.startsWith('P') && b.queueNum.startsWith('P')) {
            return 1; // Non-priority queue comes later
          } else {
            return 0; // Preserve the original order
          }
        });
      })
    );
  }
}
