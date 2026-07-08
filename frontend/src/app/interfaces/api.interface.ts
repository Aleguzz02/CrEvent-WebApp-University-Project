import { Evento, EventoDettaglio } from "./event.interface";
import { DateLocation, LocationResource, UsedDate } from "./location.interface"

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}


