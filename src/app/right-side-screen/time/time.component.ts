import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss'],
})
export class TimeComponent implements OnDestroy {
  private timerId: ReturnType<typeof setInterval>;
  formattedTime: string | undefined;
  formattedDayDate: string | undefined;

  constructor() {
    this.updateDateTime();
    this.timerId = setInterval(() => this.updateDateTime(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timerId);
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
