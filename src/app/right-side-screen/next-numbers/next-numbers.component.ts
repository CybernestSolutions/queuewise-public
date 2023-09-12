import { Component } from '@angular/core';
import { TICKET_NUMBER } from 'src/app/utilities/const/right-side-screen';

@Component({
  selector: 'app-next-numbers',
  templateUrl: './next-numbers.component.html',
  styleUrls: ['./next-numbers.component.scss'],
})
export class NextNumbersComponent  {

  ticketNumberString = TICKET_NUMBER;


  nextNumbers = [
    {
      windowNum: '1',
      queueNum: 'B0312',
      status: 'In Progress',
      type: 'Renewal',
      priority: 'PRIORITY',
    },
    {
      windowNum: '2',
      queueNum: 'B0313',
      status: 'In Progress',
      type: 'New',
      priority: '',
    },
    {
      windowNum: '3',
      queueNum: 'B0314',
      status: 'In Progress',
      type: 'Retirement',
      priority: '',
    },
  ];
}
