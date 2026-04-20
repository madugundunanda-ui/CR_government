import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ComplaintRequest {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  citizenId: number;
  assignedOfficerId?: number;
  latitude?: number;
  longitude?: number;
}

export interface ComplaintResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  citizenId: number;
  citizenName: string;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  slaDeadline: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createComplaint(data: ComplaintRequest): Observable<ComplaintResponse> {
    return this.http.post<ComplaintResponse>(`${this.base}/complaints`, data).pipe(
      catchError(err => {
        console.error('createComplaint error', err);
        return throwError(() => err);
      })
    );
  }

  getAllComplaints(): Observable<ComplaintResponse[]> {
    return this.http.get<ComplaintResponse[]>(`${this.base}/complaints`).pipe(
      catchError(err => {
        console.error('getAllComplaints error', err);
        return throwError(() => err);
      })
    );
  }
}
