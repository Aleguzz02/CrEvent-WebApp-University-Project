import { ApiResponse } from './api.interface';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userEmail: string;
  userNome: string;
}

export interface SignupRequest {
  nome: string;
  cognome: string;
  dataNascita: string;
  email: string;
  telefono: string;
  password: string;
  confermaPassword: string;
}

export interface RegisterResponse extends ApiResponse {
  emailError?: boolean;
}