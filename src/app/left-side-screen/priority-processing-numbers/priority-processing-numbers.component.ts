import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-priority-processing-numbers',
  templateUrl: './priority-processing-numbers.component.html',
  styleUrls: ['./priority-processing-numbers.component.scss'],
})
export class PriorityProcessingNumbersComponent {
  @Input() windowNum: string | undefined;
  @Input() queueNum: string | undefined;
  @Input() emphasis: boolean | undefined;
}
