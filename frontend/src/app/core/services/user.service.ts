import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
    private base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getProfile(): Observable<UserResponse> {
        return this.http.get<UserResponse>(`${this.base}/users/me`)
            .pipe(catchError(err => throwError(() => err)));
    }

    updateProfile(data: { name?: string; email?: string; contactNumber?: string; address?: string }): Observable<UserResponse> {
        return this.http.put<UserResponse>(`${this.base}/users/me`, data)
            .pipe(catchError(err => throwError(() => err)));
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    getUsersByRole(role: 'CITIZEN' | 'OFFICER' | 'ADMIN' | 'SUPERVISOR'): Observable<UserResponse[]> {
        return this.http.get<UserResponse[]>(`${this.base}/admin/users?role=${role}`)
            .pipe(catchError(err => throwError(() => err)));
    }

    getPendingOfficers(): Observable<UserResponse[]> {
        return this.http.get<UserResponse[]>(`${this.base}/admin/users/pending-officers`)
            .pipe(catchError(err => throwError(() => err)));
    }

    approveOfficer(userId: number): Observable<UserResponse> {
        return this.http.put<UserResponse>(`${this.base}/admin/users/${userId}/approve`, {})
            .pipe(catchError(err => throwError(() => err)));
    }

    updateOfficerByAdmin(userId: number, data: {
        name?: string;
        email?: string;
        contactNumber?: string;
        address?: string;
        departmentId?: number;
        role?: 'OFFICER' | 'SUPERVISOR';
        approved?: boolean;
    }): Observable<UserResponse> {
        return this.http.put<UserResponse>(`${this.base}/admin/users/${userId}`, data)
            .pipe(catchError(err => throwError(() => err)));
    }

    updateCitizenByAdmin(userId: number, data: {
        name?: string;
        email?: string;
        contactNumber?: string;
        address?: string;
        approved?: boolean;
    }): Observable<UserResponse> {
        return this.http.put<UserResponse>(`${this.base}/admin/users/${userId}`, data)
            .pipe(catchError(err => throwError(() => err)));
    }

    getDepartmentOfficerUsersBySupervisor(): Observable<UserResponse[]> {
        return this.http.get<UserResponse[]>(`${this.base}/supervisor/department/officer-users`)
            .pipe(catchError(err => throwError(() => err)));
    }

    updateOfficerBySupervisor(userId: number, data: {
        name?: string;
        email?: string;
        contactNumber?: string;
        address?: string;
    }): Observable<UserResponse> {
        return this.http.put<UserResponse>(`${this.base}/supervisor/officers/${userId}`, data)
            .pipe(catchError(err => throwError(() => err)));
    }
}