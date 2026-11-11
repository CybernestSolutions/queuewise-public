import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TellerService } from './teller.service';
import { environment } from '../../environments/environment';

describe('TellerService', () => {
  it('calls the API at environment.apiUrl', () => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(TellerService).getNextQueues().subscribe();
    http.expectOne(`${environment.apiUrl}/queue`).flush([]);
    http.verify();
  });
});
