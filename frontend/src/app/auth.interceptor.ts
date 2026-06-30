import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Prende il token dal localStorage
    const token = localStorage.getItem('token');

    // Se il token esiste, clona la richiesta e lo aggiunge nell'Authorization header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Gestione risposta server
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se errore 401 (Unauthorized), redirect a tabs -> tab2
        if (error.status === 401) {
          localStorage.removeItem('token');     // Elimina eventuale token scaduto
          this.authService.logout();            // Effettua logout
          this.router.navigate(['/tabs']);      // Naviga a tab2 (Homepage)
        }
        return throwError(() => error);
      })
    );
  }
}