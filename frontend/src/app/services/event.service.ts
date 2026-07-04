import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { ApiResponse, Evento } from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = '/api/event';

  constructor(private http: HttpClient) {}

  /*getEventiUtente(): Observable<ApiResponse<Evento[]>> {
    return this.http.get<ApiResponse<Evento[]>>(this.apiUrl);
  }*/
  getUserEvents(): Observable<any> {
    return this.http.get<any>(this.apiUrl+'/myEvents');
  }

  getLocationsByCapacity(capacity: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/location`, {
        params: {
          capacity: capacity
        }
    });  
  }
  getLocationsByCapacityAndDate(day: string, capacity: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/location`,{
      params: {
        day: day,
        capacity: capacity
      }
    });
  }
  getFreeDatesByLocation(idLocation: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/location/free-dates`, { 
      params: { 
        id:  idLocation
      }
    });
  }
}
