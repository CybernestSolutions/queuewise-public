import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { interval, merge } from 'rxjs';

const REPORT_EVERY_MS = 5 * 60 * 1000;

// Electron puts "<app name>/<version> Chrome/..." in the user agent, so the display needs no bridge.
export const versionFromUserAgent = (ua: string): string | null =>
  /([^\s/]+)\/(\d+\.\d+\.\d+\S*) Chrome\//.exec(ua)?.[2] ?? null;

// Fleet report so devs can see which version this TV runs (GET /devices). No UI, no personal data.
@Injectable({ providedIn: 'root' })
export class DeviceReportService {
  constructor(private socket: Socket) {}

  init(): void {
    const version = versionFromUserAgent(navigator.userAgent);
    if (!version) return; // plain browser: nothing to report
    const report = () => this.socket.emit('deviceReport', { app: 'public', version, deviceId: this.deviceId() });
    merge(this.socket.fromEvent('connect'), interval(REPORT_EVERY_MS)).subscribe(report);
  }

  // Random id kept locally; not derived from hardware.
  private deviceId(): string {
    let id = localStorage.getItem('qwDeviceId');
    if (!id || !/^[A-Za-z0-9-]{8,64}$/.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem('qwDeviceId', id);
    }
    return id;
  }
}
