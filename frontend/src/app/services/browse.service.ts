import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrowseService {
    private apiUrl = '/api/browse';

  constructor(private http: HttpClient) {}

  getBrowseData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}