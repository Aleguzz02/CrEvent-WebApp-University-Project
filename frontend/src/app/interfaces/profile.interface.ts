export interface UserProfile {
  nome: string;
  cognome: string;
  email: string;
  dataNascita: string;
  telefono: string;
  urlFotoProfilo: string | null;
  tipoUtente: number;
  idStaff: number | null;
  idLocation: number | null;
}

export interface UpdatePhoneRequest {
  telefono: string;
}

export interface UpdatePasswordRequest {
  passwordCorrente: string;
  nuovaPassword: string;
}

export interface DeleteAccountRequest {
  password: string;                         
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;                                 
  message?: string;                         
  error?: string;                           
}

export interface ProfilePictureResponse {
  urlFotoProfilo: string;                   
}

export const PHONE_REGEX = /^[0-9]{10}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const PASSWORD_REQUIREMENTS = 'Minimo 8 caratteri, 1 maiuscola, 1 minuscola e 1 numero';
