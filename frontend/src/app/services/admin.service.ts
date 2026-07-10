import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUser {
  email: string;
  nome: string;
  cognome: string;
  telefono: string;
  dataNascita: string;
  urlFotoProfilo: string | null;
  tipoUtente: number;
  idStaff: number | null;
  idLocation: number | null;
}

export interface AdminEvent {
  id: number;
  data: string;
  nome: string;
  invitati: number;
  emailUtente: string;
  idLocation: number | null;
  nomeUtente: string | null;
  cognomeUtente: string | null;
  telefonoUtente: string | null;
  nomeLocation: string | null;
  indirizzoLocation: string | null;
  cittaLocation: string | null;
  descrizioneLocation: string | null;
  capienzaLocation: number | null;
  lat: number | null;
  lng: number | null;
  linkSitoLocation: string | null;
  costoLocation: number | null;
  staffCoinvolto: string | null;
}

export interface CreateLocationRequest {
  nome: string;
  indirizzo: string;
  citta: string;
  descrizione: string;
  capienza: number | null;
  costo: number | null;
  dataInizio: string;
  dataFine: string;
  urlImg: string;
  linkSito?: string | null;
  lat?: number | null;
  lng?: number | null;
  accountEmail: string;
  gestoreNome?: string | null;
  gestoreCognome?: string | null;
}

export interface CreateStaffRequest {
  nome: string;
  cognome: string;
  linkSito?: string | null;
  tipo: 'catering' | 'intrattenimento' | 'fotografo' | 'altro';
  costo: number | null;
  descrizione: string;
  genereMusicale?: string | null;
  genereFotografico?: string | null;
  mansione?: string | null;
  dataInizio: string;
  dataFine: string;
  urlImg: string;
  locationIds: number[];
  accountEmail: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  changes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiResponse<AdminUser[]>> {
    return this.http.get<ApiResponse<AdminUser[]>>(`${this.apiUrl}/users`);
  }

  deleteUser(email: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/users/${encodeURIComponent(email)}`);
  }

  getEvents(): Observable<ApiResponse<AdminEvent[]>> {
    return this.http.get<ApiResponse<AdminEvent[]>>(`${this.apiUrl}/events`);
  }

  deleteEvent(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/events/${id}`);
  }

  createLocation(data: CreateLocationRequest): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.apiUrl}/locations`, data);
  }

  deleteLocation(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/locations/${id}`);
  }

  createStaff(data: CreateStaffRequest): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.apiUrl}/staff`, data);
  }

  deleteStaff(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/staff/${id}`);
  }

  getUserEventsCount(email: string): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/users/${encodeURIComponent(email)}/events-count`);
  }
}
