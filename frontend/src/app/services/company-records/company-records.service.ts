import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Record } from '../../models/company-records.model';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CompanyRecordsService {

  private createEndpoint = 'http://localhost:3000/companyRecords/create';
  private fetchRecordsEndpoint = 'http://localhost:3000/companyRecords/fetch';
  private searchRecordsEndpoint = 'http://localhost:3000/companyRecords/search';
  private updateEndpoint = 'http://localhost:3000/companyRecords/update';
  private TOKEN_KEY = 'authToken';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  create(record: Record): Observable<Record> {
    return this.http.post<Record>(this.createEndpoint, record, { headers: this.getAuthToken() });
  }

  fetch(): Observable<Record[]> {
    return this.http.get<Record[]>(this.fetchRecordsEndpoint, { headers: this.getAuthToken() });
  }

  search(query: string): Observable<Record[]> {
    return this.http.post<Record[]>(this.searchRecordsEndpoint, { query: query }, { headers: this.getAuthToken() });
  }

  update(record: Record): Observable<Record> {
    return this.http.post<Record>(this.updateEndpoint, record, { headers: this.getAuthToken() });
  }

  getAuthToken(): HttpHeaders {
    const token = this.cookieService.get(this.TOKEN_KEY);

    if (!token) {
      throw new Error('No authentication token found');
    }

     return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
