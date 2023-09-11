import { Component } from '@angular/core';
import { TICKET_NUMBER } from 'src/app/utilities/const/right-side-screen';

@Component({
  selector: 'app-next-numbers',
  templateUrl: './next-numbers.component.html',
  styleUrls: ['./next-numbers.component.scss']
})
export class NextNumbersComponent {
  ticketNumber = TICKET_NUMBER;
  nexNumberInt = [
    {
      windowNum: '1',
      queueNum: 'B0312',
      status: 'In Progress',
      type: 'Renewal',
      priority: true,
    },
    {
      windowNum: '2',
      queueNum: 'B0313',
      status: 'In Progress',
      type: 'New',
      priority: false,
    },
    {
      windowNum: '3',
      queueNum: 'B0314',
      status: 'In Progress',
      type: 'Retirement',
      priority: false,
    },
    {
      windowNum: '4',
      queueNum: 'B0315',
      status: 'In Progress',
      type: 'Renewal',
      priority: false,
    },
    {
      windowNum: '5',
      queueNum: 'B0316',
      status: 'In Progress',
      type: 'New',
      priority: false,
    },
    {
      windowNum: '6',
      queueNum: 'B0317',
      status: 'In Progress',
      type: 'Retirement',
      priority: false,
    },
    {
      windowNum: '7',
      queueNum: 'B0318',
      status: 'In Progress',
      type: 'Renewal',
      priority: false,
    },
    {
      windowNum: '8',
      queueNum: 'B0319',
      status: 'In Progress',
      type: 'New',
      priority: false,
    },
    {
      windowNum: '9',
      queueNum: 'B0320',
      status: 'In Progress',
      type: 'Retirement',
      priority: false,
    },
    {
      windowNum: '10',
      queueNum: 'B0321',
      status: 'In Progress',
      type: 'Renewal',
      priority: false,
    },
  ];

}
