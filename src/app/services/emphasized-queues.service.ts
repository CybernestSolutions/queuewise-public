import { Injectable } from '@angular/core';
import { TellerService } from './teller.service';

@Injectable({
  providedIn: 'root',
})
export class EmphasizedQueuesService {
  emphasizedQueues: any = [];
  constructor(private tellerService: TellerService) {}

  getEmphasisList() {
    this.tellerService.getEmphasizedWindows().subscribe((emphasizedQueues) => {
      this.emphasizedQueues = emphasizedQueues;
      console.log(this.emphasizedQueues);
    });
  }
}
