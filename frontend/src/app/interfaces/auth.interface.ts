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

export interface RequestOtpRequest {
  email: string;
}

export interface RequestOtpResponse extends ApiResponse {
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse extends ApiResponse {
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse extends ApiResponse {
}