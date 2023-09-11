import { Component } from '@angular/core';
import { GREETINGS, NEW, QUEUE_STAT_DASHBOARD, RENEWAL, RETIREMENT, TOTAL_QUEUES } from '../utilities/const/bottom-side-screen';

@Component({
  selector: 'app-bottom-screen',
  templateUrl: './bottom-screen.component.html',
  styleUrls: ['./bottom-screen.component.scss']
})
export class BottomScreenComponent {
queueStatusDashBoard = QUEUE_STAT_DASHBOARD;
totalQueuesString= TOTAL_QUEUES;
newMember = NEW;
renewal = RENEWAL;
retirement = RETIREMENT;
greetings = GREETINGS;
totalQueuesInt = 157;
renewalInt = 100;
newMemberInt = 50;
retirementInt = 7;
}
