import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationItem } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAll(): Observable<NotificationItem[]> {
        return this.http.get<NotificationItem[]>(`${this.base}/notifications`)
            .pipe(catchError(err => throwError(() => err)));
    }

    getUnreadCount(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.base}/notifications/unread-count`)
            .pipe(catchError(err => throwError(() => err)));
    }

    markAsRead(id: number): Observable<NotificationItem> {
        return this.http.put<NotificationItem>(`${this.base}/notifications/${id}/read`, {})
            .pipe(catchError(err => throwError(() => err)));
    }

    markAllAsRead(): Observable<void> {
        return this.http.put<void>(`${this.base}/notifications/read-all`, {})
            .pipe(catchError(err => throwError(() => err)));
    }
}
