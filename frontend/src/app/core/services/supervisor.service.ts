import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DepartmentStatsResponse,
  OfficerPerformanceResponse,
  ComplaintHistoryResponse
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class SupervisorService {
  private base = `${environment.apiUrl}/supervisor`;

  constructor(private http: HttpClient) {}

  getDepartmentComplaints(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/department/complaints`);
  }

  getDepartmentStats(): Observable<DepartmentStatsResponse> {
    return this.http.get<DepartmentStatsResponse>(`${this.base}/department/stats`);
  }

  getDepartmentOfficers(): Observable<OfficerPerformanceResponse[]> {
    return this.http.get<OfficerPerformanceResponse[]>(`${this.base}/department/officers`);
  }

  reassignComplaint(complaintId: number, officerId: number): Observable<any> {
    return this.http.put(`${this.base}/complaints/${complaintId}/assign`, { officerId });
  }

  updateStatus(complaintId: number, status: string, remarks?: string): Observable<any> {
    return this.http.put(`${this.base}/complaints/${complaintId}/status`, { status, remarks });
  }

  getComplaintHistory(complaintId: number): Observable<ComplaintHistoryResponse[]> {
    return this.http.get<ComplaintHistoryResponse[]>(`${this.base}/complaints/${complaintId}/history`);
  }
}
