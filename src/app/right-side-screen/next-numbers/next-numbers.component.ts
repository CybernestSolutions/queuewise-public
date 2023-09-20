import { Component } from '@angular/core';
import { ProcessingService } from 'src/app/services/processing.service';
import { TICKET_NUMBER } from 'src/app/utilities/const/right-side-screen';

@Component({
  selector: 'app-next-numbers',
  templateUrl: './next-numbers.component.html',
  styleUrls: ['./next-numbers.component.scss'],
})
export class NextNumbersComponent {
  ticketNumberString = TICKET_NUMBER;
  priorityString = "PRIORITY"
  constructor(public processingData: ProcessingService) {}
  
  nextNumbers = this.processingData.processes.slice(0, 3);


}
