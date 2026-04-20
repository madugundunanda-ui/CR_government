import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/models';

type BackendRole = 'ADMIN' | 'CITIZEN' | 'OFFICER' | 'SUPERVISOR';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: BackendRole;
  contactNumber: string;
  address: string;
}

export interface AuthResponse {
  message: string;
  userId: number;
  name: string;
  email: string;
  role: BackendRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();

  constructor(private router: Router, private http: HttpClient) {
    const stored = sessionStorage.getItem('civic_user');
    if (stored) {
      try { this._currentUser.set(JSON.parse(stored)); } catch {}
    }
  }

  login(email: string, password: string, selectedRole: UserRole): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.base}/login`, body).pipe(
      map((response) => {
        const userRole = this.toFrontendRole(response.role);
        if (userRole !== selectedRole) {
          throw new Error('Selected role does not match this account.');
        }
        return response;
      }),
      tap((response) => {
        const user = this.toUserModel(response);
        this._currentUser.set(user);
        sessionStorage.setItem('civic_user', JSON.stringify(user));

        const routes: Record<UserRole, string> = {
          citizen: '/citizen/dashboard',
          officer: '/officer/dashboard',
          admin: '/admin/dashboard',
        };
        this.router.navigate([routes[user.role]]);
      }),
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  register(data: { name: string; email: string; password: string; contactNumber: string; address: string; role?: BackendRole }): Observable<any> {
    const body: RegisterRequest = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? 'CITIZEN',
      contactNumber: data.contactNumber,
      address: data.address,
    };

    return this.http.post<any>(`${this.base}/register`, body);
  }

  logout(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem('civic_user');
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean { return this._currentUser() !== null; }
  getRole(): UserRole | null { return this._currentUser()?.role ?? null; }

  private toFrontendRole(role: BackendRole): UserRole {
    const map: Record<BackendRole, UserRole> = {
      CITIZEN: 'citizen',
      OFFICER: 'officer',
      ADMIN: 'admin',
      SUPERVISOR: 'officer',
    };
    return map[role];
  }

  private toBackendRole(role: UserRole): BackendRole {
    const map: Record<UserRole, BackendRole> = {
      citizen: 'CITIZEN',
      officer: 'OFFICER',
      admin: 'ADMIN',
    };
    return map[role];
  }

  private toUserModel(response: AuthResponse): User {
    return {
      id: String(response.userId),
      name: response.name,
      email: response.email,
      role: this.toFrontendRole(response.role),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
  }

  private normalizeError(err: any): Error {
    const message = err?.error?.message || err?.message || 'Something went wrong. Please try again.';
    return new Error(message);
  }
}
