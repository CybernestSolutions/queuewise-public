import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TellerService {
  private apiUrl = 'http://192.168.100.29:3000';

  constructor(private http: HttpClient) {}

  getTellersByType(tellerType?: string): Observable<any[]> {
    const url = `${this.apiUrl}/listTeller/?tellerType=${tellerType}`;
    return this.http.get<any[]>(url);
  }

  getEmphasizedWindows(): Observable<any[]> {
    const url = `${this.apiUrl}/emphasis-list`;
    return this.http.get<any[]>(url);
  }
  getNextQueues(){
    const url = `${this.apiUrl}/queue`;
    return this.http.get<any[]>(url);
  }
}
