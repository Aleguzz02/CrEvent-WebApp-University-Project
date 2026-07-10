import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiResponse } from '../interfaces/profile.interface';
import { EventDraft, Evento, StaffEventInfo } from '../interfaces/event.interface';
import { UserEventsResponse, EventDetailResponse } from '../interfaces/event.interface';
import { LocationsResponse, LocationFreeDatesResponse, LocationResource } from '../interfaces/location.interface';
import { StaffResource } from '../interfaces/staff.interface';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  
  private apiUrl = '/api/event';

  constructor(private http: HttpClient) {}

  private eventsChangedSubject = new Subject<void>();
  eventsChanged$ = this.eventsChangedSubject.asObservable();

  notifyEventsChanged() {
    this.eventsChangedSubject.next();
  }
  
  getUserEvents(): Observable<ApiResponse<Evento[]>> {
    return this.http.get<ApiResponse<Evento[]>>(this.apiUrl+'/myEvents');
  }

  getStaffEvents(): Observable<ApiResponse<StaffEventInfo[]>> {
    return this.http.get<ApiResponse<StaffEventInfo[]>>(`${this.apiUrl}/staff/events`);
  }

  getAvailableStaff(idLocation: number, day: string): Observable<ApiResponse<StaffResource[]>> {
    return this.http.get<ApiResponse<StaffResource[]>>(`${this.apiUrl}/staff`, {
    params: {
      idLocation,
      day
    }
  });
  }

  getLocationsByCapacity(capacity: number): Observable<LocationsResponse> {
    return this.http.get<LocationsResponse>(`${this.apiUrl}/location`, {
        params: {
          capacity: capacity
        }
    });  
  }
  getLocationsByCapacityAndDate(day: string, capacity: number): Observable<ApiResponse<LocationResource[]>> {
    return this.http.get<ApiResponse<LocationResource[]>>(`${this.apiUrl}/location`,{
      params: {
        day: day,
        capacity: capacity
      }
    });
  }
  getFreeDatesByLocation(idLocation: number): Observable<LocationFreeDatesResponse> {
    return this.http.get<LocationFreeDatesResponse>(`${this.apiUrl}/location/free-dates`, { 
      params: { 
        id:  idLocation
      }
    });
  }
  getEventDetail(idEvento: number): Observable<EventDetailResponse> {
    return this.http.get<EventDetailResponse>(`${this.apiUrl}/event/${idEvento}`);
  }
  createEvent(eventData: EventDraft, loc: LocationResource, staff: StaffResource[], date: string, price: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/create`, 
      {
        event: eventData,
        location: loc,
        staff,
        date,
        price,
      }
    );
  }
}
