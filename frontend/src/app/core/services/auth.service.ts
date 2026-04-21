import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserRole } from '../models/models';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approved: boolean;
  departmentId?: number;
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest {
  name: string; email: string; password: string;
  role: UserRole; contactNumber?: string; address: string;
}
export interface AuthResponse {
  message: string; token?: string;
  userId: number; name: string; email: string;
  role: UserRole; approved: boolean;
}

const JWT_KEY  = 'civic_jwt_token';
const USER_KEY = 'civic_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;
  private _currentUser = signal<CurrentUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor(private router: Router, private http: HttpClient) {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as CurrentUser;
        if (!this.isTokenExpired()) {
          this._currentUser.set(user);
        } else {
          this.clearSession();
        }
      } catch { this.clearSession(); }
    }
  }

  login(email: string, password: string, selectedRole: UserRole): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.base}/login`, body).pipe(
      tap((res) => {
        // SUPERVISOR logs in under OFFICER role selector
        const effectiveSelected = selectedRole === 'SUPERVISOR' ? 'OFFICER' : selectedRole;
        const effectiveRole = res.role === 'SUPERVISOR' ? 'OFFICER' : res.role;
        if (effectiveRole !== effectiveSelected) {
          throw new Error('Selected role does not match this account.');
        }

        if (res.token) localStorage.setItem(JWT_KEY, res.token);

        const user: CurrentUser = {
          id: String(res.userId),
          name: res.name,
          email: res.email,
          role: res.role,   // Keep actual role (SUPERVISOR preserved)
          approved: res.approved,
        };
        this._currentUser.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Routing: SUPERVISOR → officer dashboard (with elevated nav)
        const routes: Record<UserRole, string> = {
          CITIZEN:    '/citizen/dashboard',
          OFFICER:    '/officer/dashboard',
          SUPERVISOR: '/officer/dashboard',
          ADMIN:      '/admin/dashboard',
        };
        this.router.navigate([routes[res.role]]);
      }),
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, data);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return this._currentUser() !== null && !this.isTokenExpired();
  }

  getRole(): UserRole | null {
    return this._currentUser()?.role ?? null;
  }

  isSupervisor(): boolean {
    return this._currentUser()?.role === 'SUPERVISOR';
  }

  isAdmin(): boolean {
    return this._currentUser()?.role === 'ADMIN';
  }

  getToken(): string | null {
    return localStorage.getItem(JWT_KEY);
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem(JWT_KEY);
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch { return true; }
  }

  private clearSession(): void {
    this._currentUser.set(null);
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private normalizeError(err: any): Error {
    const msg = err?.error?.message || err?.message || 'Something went wrong.';
    return new Error(msg);
  }
}
