import { ApiResponse } from './api.interface';

export interface LocationResource {
  id: number;
  nome: string;
  indirizzo: string;
  citta: string;
  descrizione: string;
  capienza: number;
  lat: number | null;
  lng: number | null;
  linkSito: string | null;
  costo: number;
  url: string | null;

  custom?: boolean;
  inizio?: string;
  fine?: string;
  usedDates?: string[];
}

export interface DateLocation {
  id: number;
  idLocation: number;
  dataInizio: string;
  dataFine: string;
}

export interface UsedDate {
  data: string;
}

export type LocationsResponse = ApiResponse<LocationResource[]>;

export interface LocationFreeDatesResponse {
  success: boolean;
  freeDates?: DateLocation;
  usedDates?: UsedDate[];
  message?: string;
  error?: string;
}