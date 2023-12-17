import { Injectable } from '@angular/core';
import { TellerService } from './teller.service';


@Injectable({
  providedIn: 'root',
})
export class ProcessingService {
  constructor(private tellerService: TellerService) {}
  processes: any[] = [];
  nextQueues: any[] = [
    {queueNum: '', priority: null},
  ];

  getTellers(){
    this.tellerService.getTellersByType('').subscribe((tellers) => {

      this.processes = tellers;
      console.log(this.processes);
    });
  }

  getNextQueues(){
    this.tellerService.getNextQueues().subscribe((queues) => {
      this.nextQueues = queues;
      console.log(this.nextQueues);
    });
  }


}
