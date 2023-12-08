import { Component, OnInit } from '@angular/core';
import { ProcessingService } from './services/processing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(
    private processingService: ProcessingService,
  ){}
  title = 'queuewise-public-view';


  ngOnInit(): void {
    // this.processingService.getTellers();
  }
}
