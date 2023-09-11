import { Component } from '@angular/core';
import { COUNTER } from '../utilities/const/main';

@Component({
  selector: 'app-left-side-screen',
  templateUrl: './left-side-screen.component.html',
  styleUrls: ['./left-side-screen.component.scss'],
})
export class LeftSideScreenComponent {
  counter = COUNTER;
  processes = [
    { windowNum: '1', queueNum: 'B0312' },
    { windowNum: '2', queueNum: 'B0313' },
    { windowNum: '3', queueNum: 'B0314' },
    { windowNum: '4', queueNum: 'B0315' },
    { windowNum: '5', queueNum: 'B0316' },
    { windowNum: '6', queueNum: 'B0317' },
    { windowNum: '7', queueNum: 'B0318' },
    { windowNum: '8', queueNum: 'B0319' },
    { windowNum: '9', queueNum: 'B0320' },
    { windowNum: '10', queueNum: 'B0321' },
  ];
}
