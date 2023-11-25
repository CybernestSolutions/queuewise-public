import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-processing-numbers',
  templateUrl: './processing-numbers.component.html',
  styleUrls: ['./processing-numbers.component.scss'],
})
export class ProcessingNumbersComponent {
  @Input() windowNum: string | undefined;
  @Input() queueNum: string | undefined;
  @Input() status: string | undefined;
}
