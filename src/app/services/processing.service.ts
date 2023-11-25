import { Injectable } from '@angular/core';
import { TellerService } from './teller.service';


@Injectable({
  providedIn: 'root',
})
export class ProcessingService {
  constructor(private tellerService: TellerService) {}
  processes: any[] = [];

  getTellers(){
    this.tellerService.getTellersByType('').subscribe((tellers) => {
      this.processes = tellers;
      console.log(this.processes);

    });
  }
}
