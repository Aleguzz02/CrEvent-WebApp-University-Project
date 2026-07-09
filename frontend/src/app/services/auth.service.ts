import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, switchMap, map, tap } from 'rxjs/operators';     // Reactive eXtensions for JavaScript per flusso dati async
import {
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse
} from '../interfaces/auth.interface';

export interface CurrentUser {
  email: string;
  nome: string;
  cognome: string;
  telefono: string;
  dataNascita: string;
  urlFotoProfilo: string | null;
  tipoUtente: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  private authState = new BehaviorSubject<boolean>(this.isTokenValid());
  isAuthenticated$ = this.authState.asObservable();

  private currentUserState = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUserState.asObservable();

  private adminState = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.adminState.asObservable();

  get isAuthenticated(): boolean {
    return this.authState.getValue();
  }

  get currentUser(): CurrentUser | null {
    return this.currentUserState.getValue();
  }

  get isAdmin(): boolean {
    return this.adminState.getValue();
  }

  constructor(private http: HttpClient) {
    if (this.isTokenValid()) {
      this.loadCurrentUser().subscribe();
    } else {
      this.clearAuthData();
    }
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/register`, userData).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = error.error?.message || "";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  login(userData: any): Observable<any> {
    return this.http.post(`/api/login`, userData).pipe(
      switchMap((res: any) => {
        if (res && res.token) {
          // Salva token e email nel localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('userEmail', res.userEmail);
          if (res.userNome) {
            localStorage.setItem('userNome', res.userNome);
          }

          return this.loadCurrentUser().pipe(
            map(() => res)
          );
        }

        return of(res);
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = error.error?.message || "";
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  requestOtp(data: RequestOtpRequest): Observable<RequestOtpResponse> {
    return this.http.post<RequestOtpResponse>('/api/request-otp', data).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || 'Errore nella richiesta OTP';
        return throwError(() => new Error(message));
      })
    );
  }

  verifyOtp(data: VerifyOtpRequest): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>('/api/verify-otp', data).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || 'Errore nella verifica OTP';
        return throwError(() => new Error(message));
      })
    );
  }

  resetPassword(data: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>('/api/reset-password', data).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || 'Errore nel reset della password';
        return throwError(() => new Error(message));
      })
    );
  }

  private isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  loadCurrentUser(): Observable<CurrentUser | null> {
    if (!this.isTokenValid()) {
      this.clearAuthData();
      return of(null);
    }

    return this.http.get<ApiResponse<CurrentUser>>('/api/me').pipe(
      map(response => response.data ?? null),
      tap(user => {
        if (user) {
          this.setCurrentUser(user);
        } else {
          this.clearAuthData();
        }
      }),
      catchError(() => {
        this.clearAuthData();
        return of(null);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
  }

  refreshAuthState(): void {
    if (this.isTokenValid()) {
      this.loadCurrentUser().subscribe();
    } else {
      this.clearAuthData();
    }
  }

  private setCurrentUser(user: CurrentUser): void {
    this.currentUserState.next(user);
    this.adminState.next(user.tipoUtente === 1);
    this.authState.next(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userNome');
    this.currentUserState.next(null);
    this.adminState.next(false);
    this.authState.next(false);
  }

}
