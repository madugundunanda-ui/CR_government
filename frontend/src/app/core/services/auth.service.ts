import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();

  readonly demoCredentials = [
    { email: 'citizen@demo.com', password: 'demo123', role: 'citizen' as UserRole },
    { email: 'officer@demo.com', password: 'demo123', role: 'officer' as UserRole },
    { email: 'admin@demo.com',   password: 'demo123', role: 'admin'   as UserRole },
  ];

  constructor(private router: Router, private mockData: MockDataService) {
    const stored = sessionStorage.getItem('civic_user');
    if (stored) {
      try { this._currentUser.set(JSON.parse(stored)); } catch {}
    }
  }

  login(email: string, password: string, role: UserRole): { success: boolean; message: string } {
    const cred = this.demoCredentials.find(c => c.email === email && c.password === password && c.role === role);
    if (!cred) return { success: false, message: 'Invalid credentials. Please check your email, password and role.' };

    const user = this.mockData.mockUsers.find(u => u.email === email);
    if (!user) return { success: false, message: 'User not found.' };

    this._currentUser.set(user);
    sessionStorage.setItem('civic_user', JSON.stringify(user));

    const routes: Record<UserRole, string> = {
      citizen: '/citizen/dashboard',
      officer: '/officer/dashboard',
      admin: '/admin/dashboard',
    };
    this.router.navigate([routes[role]]);
    return { success: true, message: 'Login successful!' };
  }

  register(data: { name: string; email: string; phone: string; address: string }): { success: boolean; message: string } {
    const exists = this.mockData.mockUsers.find(u => u.email === data.email);
    if (exists) return { success: false, message: 'An account with this email already exists.' };
    return { success: true, message: 'Registration successful! You can now log in with your credentials.' };
  }

  logout(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem('civic_user');
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean { return this._currentUser() !== null; }
  getRole(): UserRole | null { return this._currentUser()?.role ?? null; }
}
