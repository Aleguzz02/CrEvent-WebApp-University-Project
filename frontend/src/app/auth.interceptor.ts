import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const API_URL = 'http://localhost:3000';

const PUBLIC_ENDPOINTS = [
  '/api/login',
  '/api/register',
  '/api/browse'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  let apiReq = req;

  if (req.url.startsWith('/api/')) {
    apiReq = req.clone({
      url: `${API_URL}${req.url}`
    });
  }

  const isBackendRequest = apiReq.url.startsWith(API_URL);
  const path = apiReq.url.replace(API_URL, '');
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
    path.startsWith(endpoint)
  );

  const token = localStorage.getItem('token');

  if (token && isBackendRequest && !isPublicEndpoint) {
    apiReq = apiReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userNome');

        // Nel tuo progetto non esiste /login, quindi meglio una route esistente.
        router.navigate(['/tabs/tab2']);
      }

      return throwError(() => error);
    })
  );
};