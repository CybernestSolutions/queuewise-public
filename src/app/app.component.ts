import { Component, OnInit } from '@angular/core';
import { ProcessingService } from './services/processing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'queuewise-public-view';

  ngOnInit(): void {
    setInterval(() => {
      window.location.reload();
    }, 3600000); // 1 hour = 3600000 milliseconds
  }
}
