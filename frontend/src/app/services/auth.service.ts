import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';     // Reactive eXtensions for JavaScript per flusso dati async

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
    return this.http.post(`${this.apiUrl}/api/register`, userData);
  }

  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/login`, userData).pipe(
      tap((res: any) => {
        if (res && res.token) {
          // Salva token e email nel localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('userEmail', res.userEmail);
          // Imposta lo stato a true dopo accesso avvenuto
          this.authState.next(true);
        }
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


}