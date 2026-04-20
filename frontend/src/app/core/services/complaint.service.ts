import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ComplaintStatsResponse } from '../models/models';

export interface ComplaintRequest {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  citizenId?: number;
  assignedOfficerId?: number;
  departmentId?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface ComplaintResponse {
  id: number;
  title: string;
  description: string;
  status: string;         // PENDING | ASSIGNED | IN_PROGRESS | RESOLVED | CLOSED
  priority: string;       // LOW | MEDIUM | HIGH | URGENT
  category?: string;
  citizenId: number;
  citizenName: string;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  departmentId?: number;
  departmentName?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  createdAt: string;
  updatedAt?: string;
  slaDeadline: string;
  resolvedAt?: string;
}

export interface FeedbackRequest {
  complaintId: number;
  rating: number;
  comments?: string;
}

export interface FeedbackResponse {
  id: number;
  complaintId: number;
  complaintTitle: string;
  citizenId: number;
  citizenName: string;
  rating: number;
  comments?: string;
  createdAt: string;
}

export interface AssignOfficerRequest {
  officerId: number;
}

export interface UpdateStatusRequest {
  status: string;
  remarks?: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ─── CITIZEN ────────────────────────────────────────────────────────────────

  createComplaint(data: ComplaintRequest): Observable<ComplaintResponse> {
    return this.http.post<ComplaintResponse>(`${this.base}/citizen/complaints`, data)
      .pipe(catchError(err => throwError(() => err)));
  }

  getMyComplaints(): Observable<ComplaintResponse[]> {
    return this.http.get<ComplaintResponse[]>(`${this.base}/citizen/my-complaints`)
      .pipe(catchError(err => throwError(() => err)));
  }

  submitFeedback(data: FeedbackRequest): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(`${this.base}/citizen/feedback`, data)
      .pipe(catchError(err => throwError(() => err)));
  }

  getFeedback(complaintId: number): Observable<FeedbackResponse> {
    return this.http.get<FeedbackResponse>(`${this.base}/citizen/feedback/${complaintId}`)
      .pipe(catchError(err => throwError(() => err)));
  }

  // ─── OFFICER ────────────────────────────────────────────────────────────────

  getMyTasks(): Observable<ComplaintResponse[]> {
    return this.http.get<ComplaintResponse[]>(`${this.base}/officer/my-tasks`)
      .pipe(catchError(err => throwError(() => err)));
  }

  updateTaskStatus(id: number, status: string, remarks?: string): Observable<ComplaintResponse> {
    const body: UpdateStatusRequest = { status, remarks };
    return this.http.put<ComplaintResponse>(`${this.base}/officer/tasks/${id}/status`, body)
      .pipe(catchError(err => throwError(() => err)));
  }

  // ─── ADMIN ──────────────────────────────────────────────────────────────────

  getAllComplaints(): Observable<ComplaintResponse[]> {
    return this.http.get<ComplaintResponse[]>(`${this.base}/admin/complaints`)
      .pipe(catchError(err => throwError(() => err)));
  }

  assignOfficer(complaintId: number, officerId: number): Observable<ComplaintResponse> {
    const body: AssignOfficerRequest = { officerId };
    return this.http.put<ComplaintResponse>(`${this.base}/admin/complaints/${complaintId}/assign`, body)
      .pipe(catchError(err => throwError(() => err)));
  }

  updateComplaintStatus(complaintId: number, status: string, remarks?: string): Observable<ComplaintResponse> {
    const body: UpdateStatusRequest = { status, remarks };
    return this.http.put<ComplaintResponse>(`${this.base}/admin/complaints/${complaintId}/status`, body)
      .pipe(catchError(err => throwError(() => err)));
  }

  getStats(): Observable<ComplaintStatsResponse> {
    return this.http.get<ComplaintStatsResponse>(`${this.base}/admin/reports/stats`)
      .pipe(catchError(err => throwError(() => err)));
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  /** Convert backend STATUS to human-readable display string */
  static formatStatus(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pending',
      ASSIGNED: 'Assigned',
      IN_PROGRESS: 'In Progress',
      RESOLVED: 'Resolved',
      CLOSED: 'Closed',
    };
    return map[status] ?? status;
  }

  /** Returns CSS badge class for a given status */
  static statusBadgeClass(status: string): string {
    return `badge-${status}`;
  }
}
