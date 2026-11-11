import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { DeviceReportService, versionFromUserAgent } from './device-report.service';

describe('DeviceReportService', () => {
  it('reads the version from the Electron user agent', () => {
    expect(versionFromUserAgent('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) queuewise-public-view/26.2.1 Chrome/118.0.5993.159 Electron/27.0.3 Safari/537.36')).toBe('26.2.1');
    expect(versionFromUserAgent('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36')).toBeNull();
  });

  it('reports { app, version, deviceId } on connect', () => {
    localStorage.clear();
    const connect = new Subject<any>();
    const emit = jasmine.createSpy('emit');
    spyOnProperty(navigator, 'userAgent').and.returnValue('x public/3.4.5 Chrome/1.0.0');
    new DeviceReportService({ emit, fromEvent: () => connect } as unknown as Socket).init();
    connect.next(null);
    const [evt, p] = emit.calls.mostRecent().args;
    expect(evt).toBe('deviceReport');
    expect(p.app).toBe('public');
    expect(p.version).toBe('3.4.5');
    expect(p.deviceId).toBe(localStorage.getItem('qwDeviceId'));
    expect(Object.keys(p).sort()).toEqual(['app', 'deviceId', 'version']);
  });

  it('does nothing in a plain browser', () => {
    const emit = jasmine.createSpy('emit');
    const connect = new Subject<any>();
    spyOnProperty(navigator, 'userAgent').and.returnValue('Mozilla/5.0 Chrome/120.0.0.0');
    new DeviceReportService({ emit, fromEvent: () => connect } as unknown as Socket).init();
    connect.next(null);
    expect(emit).not.toHaveBeenCalled();
  });
});
