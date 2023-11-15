import { Component } from '@angular/core';
import { COUNTER } from '../utilities/const/main';
import { ProcessingService } from '../services/processing.service';
import { EmphasizedQueuesService } from '../services/emphasized-queues.service';

@Component({
  selector: 'app-left-side-screen',
  templateUrl: './left-side-screen.component.html',
  styleUrls: ['./left-side-screen.component.scss'],
})
export class LeftSideScreenComponent {
  constructor(
    public processingData: ProcessingService,
    private emphasizedQueuesService: EmphasizedQueuesService
  ) {}
  emphasizedQueues = this.emphasizedQueuesService.emphasizedQueues;
  counter = COUNTER;
  isPriority = true;
  processes = this.processingData.processes;
}
