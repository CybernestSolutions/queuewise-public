import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  constructor(private socket: Socket) {}

  public onQueueUpdate() {
    return this.socket.fromEvent('queueUpdate');
  }

  // New method to listen for processingQueue update
  public onProcessingQueueUpdate(): Observable<any> {
    return this.socket.fromEvent('processingQueueUpdate');
  }

  public userCapacityUpdate() {
    return this.socket.fromEvent('userCapacityUpdate');
  }
}
