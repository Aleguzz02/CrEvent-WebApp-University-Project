import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BrowseResponse } from '../interfaces/browse.interface';


@Injectable({
  providedIn: 'root'
})
export class BrowseService {
    private apiUrl = '/api/browse';

  constructor(private http: HttpClient) {}

  getBrowseData(): Observable<BrowseResponse> {
    return this.http.get<BrowseResponse>(this.apiUrl);
  }
}