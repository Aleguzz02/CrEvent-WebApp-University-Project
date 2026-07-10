import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';

export interface UploadResponse {
  url: string;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  /**
   * @param file
   * @param type
   */
  uploadImage(file: File, type: 'profile' | 'location' | 'staff'): Observable<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<UploadResponse>>(
      `${this.apiUrl}/upload?type=${type}`,
      formData
    );
  }

  deleteImage(url: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiUrl}/upload?url=${encodeURIComponent(url)}`
    );
  } 
}