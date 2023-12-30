import { Injectable } from '@angular/core';
import { TellerService } from './teller.service';

@Injectable({
  providedIn: 'root',
})
export class ProcessingService {
  constructor(private tellerService: TellerService) {}
  processes: any[] = [];
  nextQueues: any[] = [{ queueNum: '', priority: null }];
  emphasizedQueues: any = [
    {
      queue: {
        queueNum: '',
        priority: null,
      },
      tellerNum: '',
      windowNum: '',
    },
  ];

  getTellers() {
    this.tellerService.getTellersByType('').subscribe((tellers) => {
      this.processes = tellers;
      this.processes.forEach((process) => {
        if (process.emphasis) {
          this.emphasizedQueues.push(process);
        }
      });
    });
  }

  getEmphasizedQueues() {
    this.tellerService.getEmphasizedTellers().subscribe((queues) => {
      this.emphasizedQueues = queues;
      console.log(this.emphasizedQueues);

    });
  }


  getNextQueues() {
    this.tellerService.getNextQueues().subscribe((queues) => {
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
    });
  }
}
