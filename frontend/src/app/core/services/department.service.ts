import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DepartmentResponse } from '../models/models';

export interface DepartmentRequest {
    name: string;
    description?: string;
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
    private base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAll(): Observable<DepartmentResponse[]> {
        return this.http.get<DepartmentResponse[]>(`${this.base}/departments`)
            .pipe(catchError(err => throwError(() => err)));
    }

    getById(id: number): Observable<DepartmentResponse> {
        return this.http.get<DepartmentResponse>(`${this.base}/departments/${id}`)
            .pipe(catchError(err => throwError(() => err)));
    }

    create(data: DepartmentRequest): Observable<DepartmentResponse> {
        return this.http.post<DepartmentResponse>(`${this.base}/admin/departments`, data)
            .pipe(catchError(err => throwError(() => err)));
    }

    update(id: number, data: DepartmentRequest): Observable<DepartmentResponse> {
        return this.http.put<DepartmentResponse>(`${this.base}/admin/departments/${id}`, data)
            .pipe(catchError(err => throwError(() => err)));
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.base}/admin/departments/${id}`)
            .pipe(catchError(err => throwError(() => err)));
    }
}