import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../utilities/const/api-url';

@Injectable({
  providedIn: 'root',
})
export class TellerService {
  private apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  getTellersByType(tellerType?: string): Observable<any[]> {
    const url = `${this.apiUrl}/listTeller/?tellerType=${tellerType}`;
    return this.http.get<any[]>(url);
  }

  getEmphasizedTellers(): Observable<any[]> {
    const url = `${this.apiUrl}/listTeller/?emphasis=true`;
    return this.http.get<any[]>(url);
  }

  getQueuesByCategory(category?: string): Observable<any[]> {
    const url = `${this.apiUrl}/queue/${category}`;
    return this.http.get<any[]>(url);
  }

  getNextQueues() {
    const url = `${this.apiUrl}/queue`;
    return this.http.get<any[]>(url);
  }

  getEmphasisList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/emphasisList`);
  }
}
