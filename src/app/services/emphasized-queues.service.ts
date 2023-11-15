import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EmphasizedQueuesService {
  emphasizedQueues = {
    windowNum: '9',
    queueNum: '',
    status: 'In Progress',
    type: 'Retirement',
    priority: true,
    emphasis: true,
  };
  constructor() {}
}
