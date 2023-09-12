import { Component } from '@angular/core';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss'],
})
export class TimeComponent {
  formattedTime: string | undefined;
  formattedDayDate: string | undefined;

  constructor() {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
  }

  updateDateTime() {
    const now = new Date();

    this.formattedTime = now.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    this.formattedDayDate = now.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
}
