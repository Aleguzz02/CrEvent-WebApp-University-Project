import { ApiResponse } from './api.interface';
import { LocationResource } from './location.interface';
import { StaffResource } from './staff.interface';

export interface EventoBase {
  id: number;
  data: string;
  nome: string;
  prezzoTotale: number;
  invitati: number;
  emailUtente: string;
  idLocation: number | null;
}

export interface Evento extends EventoBase {
  svolto: 0 | 1;
  url: string | null;
  nomeLocazione: string;
  citta: string;
  lat: number | null;
  lng: number | null;
}

export interface EventoDettaglio extends EventoBase {
  location: LocationResource | null;
  staff: StaffResource[];
}

export interface EventDraft {
  name: string;
  capacity: number;
}

export type UserEventsResponse = ApiResponse<Evento[]>;
export type EventDetailResponse = ApiResponse<EventoDettaglio>;