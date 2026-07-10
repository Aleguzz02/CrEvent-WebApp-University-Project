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

export interface StaffEventInfo {
  id: number;
  nome: string;
  data: string;
  invitati: number;
  emailUtente: string;
  svolto: 0 | 1;
  nomeCliente: string;
  cognomeCliente: string;
  telefonoCliente: string;
  emailCliente: string;
  urlFotoProfiloCliente: string | null;
  idLocation?: number | null;
  nomeLocation?: string | null;
  indirizzoLocation?: string | null;
  cittaLocation?: string | null;
  lat?: number | null;
  lng?: number | null;
  customLocation?: 0 | 1 | null;
  urlLocation?: string | null;
  idStaff?: number | null;
  nomeStaff?: string | null;
  cognomeStaff?: string | null;
  linkSitoStaff?: string | null;
  tipoStaff?: StaffResource['tipo'] | null;
  descrizioneStaff?: string | null;
  genereMusicaleStaff?: string | null;
  genereFotograficoStaff?: string | null;
  mansioneStaff?: string | null;
  urlStaff?: string | null;
}

export type UserEventsResponse = ApiResponse<Evento[]>;
export type EventDetailResponse = ApiResponse<EventoDettaglio>;
export type StaffEventsResponse = ApiResponse<StaffEventInfo[]>;
