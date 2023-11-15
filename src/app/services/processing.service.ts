import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProcessingService {

  processes = [
    {
      windowNum: '1',
      queueNum: 'B0312',
      status: 'In Progress',
      type: 'Renewal',
      priority: false,
      emphasis: false,
    },
    {
      windowNum: '2',
      queueNum: 'B0313',
      status: 'In Progress',
      type: 'New',
      priority: true,
      emphasis: false,
    },
    {
      windowNum: '3',
      queueNum: 'B0314',
      status: 'In Progress',
      type: 'Retirement',
      priority: false,
      emphasis: false,
    },
    {
      windowNum: '4',
      queueNum: 'B0315',
      status: 'In Progress',
      type: 'Renewal',
      priority: false,
      emphasis: false,
    },
    {
      windowNum: '5',
      queueNum: 'B0316',
      status: 'In Progress',
      type: 'New',
      priority: false,
      emphasis: false,
    },
    {
      windowNum: '6',
      queueNum: 'B0317',
      status: 'In Progress',
      type: 'Retirement',
      priority: false,
      emphasis: false,
    },
    {
      windowNum: '7',
      queueNum: 'B0318',
      status: 'In Progress',
      type: 'Renewal',
      priority: false,
      emphasis: false,
    },
    {
      windowNum: '8',
      queueNum: 'B0319',
      status: 'In Progress',
      type: 'New',
      priority: false,
      emphasis: false,
    },
    {
      windowNum: '9',
      queueNum: 'B0320',
      status: 'In Progress',
      type: 'Retirement',
      priority: true,
      emphasis: false,
    },
    {
      windowNum: '10',
      queueNum: 'B0321',
      status: 'In Progress',
      type: 'Renewal',
      priority: false,
      emphasis: false,
    },
  ];
}
