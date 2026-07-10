import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { 
  UserProfile, 
  ApiResponse, 
  UpdatePhoneRequest, 
  UpdatePasswordRequest, 
  DeleteAccountRequest, 
  ProfilePictureResponse 
} from '../interfaces/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000/api';

  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  profile$ = this.profileSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadProfile(): Observable<ApiResponse<UserProfile>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`)
      .pipe(
        tap(response => {
          this.loadingSubject.next(false);
          if (response.success && response.data) {
            this.profileSubject.next(response.data);
          }
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  updatePhone(telefono: string): Observable<ApiResponse<{ telefono: string }>> {
    this.loadingSubject.next(true);
    const payload: UpdatePhoneRequest = { telefono };
    return this.http.put<ApiResponse<{ telefono: string }>>(
      `${this.apiUrl}/profile/telefono`,
      payload
    ).pipe(
      tap(response => {
        this.loadingSubject.next(false);
        if (response.success && response.data) {
          const current = this.profileSubject.value;
          if (current) {
            this.profileSubject.next({
              ...current,
              telefono: response.data.telefono
            });
          }
        }
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  updatePassword(currentPassword: string, nuovaPassword: string): Observable<ApiResponse<null>> {
    this.loadingSubject.next(true);
    const payload: UpdatePasswordRequest = { passwordCorrente: currentPassword, nuovaPassword };
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/profile/password`, payload)
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError(error => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

uploadPicture(file: File): Observable<ApiResponse<ProfilePictureResponse>> {
  this.loadingSubject.next(true);
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<ApiResponse<ProfilePictureResponse>>(
    `${this.apiUrl}/profile/foto?type=profile`,
    formData
  ).pipe(
    tap(response => {
      this.loadingSubject.next(false);
      if (response.success && response.data) {
        const current = this.profileSubject.value;
        if (current) {
          this.profileSubject.next({
            ...current,
            urlFotoProfilo: response.data.urlFotoProfilo
          });
        }
      }
    }),
    catchError(error => {
      this.loadingSubject.next(false);
      return throwError(() => error);
    })
  );
}

  deletePicture(): Observable<ApiResponse<null>> {
    this.loadingSubject.next(true);
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/profile/foto`)
      .pipe(
        tap(response => {
          this.loadingSubject.next(false);
          if (response.success) {
            const current = this.profileSubject.value;
            if (current) {
              this.profileSubject.next({
                ...current,
                urlFotoProfilo: null
              });
            }
          }
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  deleteAccount(password: string): Observable<ApiResponse<null>> {
    this.loadingSubject.next(true);
    const payload: DeleteAccountRequest = { password };
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/profile`, {
      body: payload
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  resetProfile(): void {
    this.profileSubject.next(null);
    this.loadingSubject.next(false);
  }

  getCurrentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }
}