import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DepartmentStatsResponse,
  OfficerPerformanceResponse,
  AuditLogResponse,
  DepartmentResponse,
  UserResponse,
  ComplaintHistoryResponse,
  ComplaintStatsResponse
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ── Stats & Analytics ────────────────────────────────────────────────────
  getStats(): Observable<ComplaintStatsResponse> {
    return this.http.get<ComplaintStatsResponse>(`${this.base}/reports/stats`);
  }

  getDepartmentStats(): Observable<DepartmentStatsResponse[]> {
    return this.http.get<DepartmentStatsResponse[]>(`${this.base}/reports/department-stats`);
  }

  getOfficerPerformance(): Observable<OfficerPerformanceResponse[]> {
    return this.http.get<OfficerPerformanceResponse[]>(`${this.base}/reports/officer-performance`);
  }

  getAuditLogs(limit = 100): Observable<AuditLogResponse[]> {
    return this.http.get<AuditLogResponse[]>(`${this.base}/audit-logs?limit=${limit}`);
  }

  // ── Departments ──────────────────────────────────────────────────────────
  getDepartments(): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>(`${environment.apiUrl}/departments`);
  }

  assignDepartmentHead(deptId: number, userId: number): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse>(`${this.base}/departments/${deptId}/head/${userId}`, {});
  }

  createDepartment(name: string, description: string, contactEmail?: string): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>(`${this.base}/departments`, { name, description, contactEmail });
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.base}/departments/${id}`);
  }

  // ── Users ────────────────────────────────────────────────────────────────
  getUsersByRole(role: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.base}/users?role=${role}`);
  }

  getPendingOfficers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.base}/users/pending-officers`);
  }

  approveOfficer(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.base}/users/${id}/approve`, {});
  }

  // ── Complaints ───────────────────────────────────────────────────────────
  assignOfficer(complaintId: number, officerId: number): Observable<any> {
    return this.http.put(`${this.base}/complaints/${complaintId}/assign`, { officerId });
  }

  updateComplaintStatus(complaintId: number, status: string, remarks?: string): Observable<any> {
    return this.http.put(`${this.base}/complaints/${complaintId}/status`, { status, remarks });
  }

  getComplaintHistory(complaintId: number): Observable<ComplaintHistoryResponse[]> {
    return this.http.get<ComplaintHistoryResponse[]>(`${this.base}/complaints/${complaintId}/history`);
  }

  exportCsv(): string {
    return `${this.base}/reports/export-csv`;
  }
}
