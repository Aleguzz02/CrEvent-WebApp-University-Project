export interface UserProfile {
  nome: string;
  cognome: string;
  email: string;
  dataNascita: string;
  telefono: string;
  urlFotoProfilo: string | null;
}

// Payload per le richieste
export interface UpdatePhoneRequest {
  telefono: string;
}

export interface UpdatePasswordRequest {
  passwordCorrente: string;
  nuovaPassword: string;
}

export interface DeleteAccountRequest {
  password: string;                         // Richiesta per confermare l'identità
}

// Risposta standard del backend
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;                                 // Presente solo se success = true
  message?: string;                         // Messaggio descrittivo (es. "Profilo aggiornato")
  error?: string;                           // Dettaglio errore se success = false
}

// Risposta per l'upload foto
export interface ProfilePictureResponse {
  urlFotoProfilo: string;                   // URL o percorso della nuova immagine
}

// Costanti per validazioni
export const PHONE_REGEX = /^[0-9]{10}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const PASSWORD_REQUIREMENTS = 'Minimo 8 caratteri, 1 maiuscola, 1 minuscola e 1 numero';