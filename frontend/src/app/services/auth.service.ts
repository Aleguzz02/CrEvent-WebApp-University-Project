import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';     // Reactive eXtensions for JavaScript per flusso dati async

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  private authState = new BehaviorSubject<boolean>(this.isTokenValid());
  isAuthenticated$ = this.authState.asObservable();

  get isAuthenticated(): boolean {
    return this.authState.getValue();
  }

  constructor(private http: HttpClient) { }

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
      tap((res: any) => {
        if (res && res.token) {
          // Salva token e email nel localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('userEmail', res.userEmail);
          // Imposta lo stato a true dopo accesso avvenuto
          this.authState.next(true);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = error.error?.message || "";
        return throwError(() => new Error(errorMessage));
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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.authState.next(false);
  }

  refreshAuthState(): void {
    this.authState.next(this.isTokenValid());
  }

}