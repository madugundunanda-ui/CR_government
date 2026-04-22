import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/** Shared layout wrapper for all Admin pages.
 *  Usage: wrap your page content inside <app-admin-layout [active]="'officers'">
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
  <div class="app-layout">
    <aside class="app-sidebar">
      <!-- Branding -->
      <div class="sidebar-brand">
        <div class="brand-mark">CG</div>
        <div class="brand-text">
          <div class="brand-name">CivicConnect</div>
          <div class="brand-sub">Grievance Management</div>
        </div>
      </div>

      <!-- User info -->
      <div class="sidebar-user-block">
        <div class="sub-avatar">{{ (auth.currentUser()?.name || 'A')[0].toUpperCase() }}</div>
        <div class="sub-info">
          <div class="sub-name">{{ auth.currentUser()?.name }}</div>
          <div class="sub-role">Administrator</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <div class="nav-group-label">Main</div>
        <a routerLink="/admin/dashboard"      class="nav-link" [class.is-active]="active==='dashboard'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a routerLink="/admin/all-complaints" class="nav-link" [class.is-active]="active==='complaints'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Complaints
        </a>
        <a routerLink="/admin/analytics"      class="nav-link" [class.is-active]="active==='analytics'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Analytics
        </a>

        <div class="nav-group-label">Management</div>
        <a routerLink="/admin/citizens"    class="nav-link" [class.is-active]="active==='citizens'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Citizens
        </a>
        <a routerLink="/admin/officers"    class="nav-link" [class.is-active]="active==='officers'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
          Officers
        </a>
        <a routerLink="/admin/departments" class="nav-link" [class.is-active]="active==='departments'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Departments
        </a>

        <div class="nav-group-label">System</div>
        <a routerLink="/admin/audit-logs" class="nav-link" [class.is-active]="active==='audit'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Audit Logs
        </a>
        <a routerLink="/profile"          class="nav-link" [class.is-active]="active==='profile'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
          My Profile
        </a>
        <button class="nav-link nav-signout" (click)="auth.logout()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </nav>
    </aside>

    <div class="app-main">
      <ng-content></ng-content>
    </div>
  </div>
  `,
  styles: [`
    :host { display: contents; }

    .app-layout {
      display: flex;
      min-height: 100vh;
      background: #f4f5f7;
    }

    /* ── Sidebar ── */
    .app-sidebar {
      width: 220px;
      flex-shrink: 0;
      background: #1e2a3b;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 18px 16px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand-mark {
      width: 32px; height: 32px;
      background: #2563eb;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 800; color: white;
      flex-shrink: 0;
    }
    .brand-name { font-size: 0.875rem; font-weight: 700; color: white; line-height: 1.2; }
    .brand-sub  { font-size: 0.62rem;  color: rgba(255,255,255,0.45); letter-spacing: 0.3px; }

    .sidebar-user-block {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 6px;
    }
    .sub-avatar {
      width: 30px; height: 30px;
      border-radius: 50%;
      background: #374151;
      border: 1px solid rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.9);
      flex-shrink: 0;
    }
    .sub-name { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.9); }
    .sub-role { font-size: 0.62rem; color: rgba(255,255,255,0.4); }

    .sidebar-nav { padding: 0 8px 16px; flex: 1; }

    .nav-group-label {
      font-size: 0.58rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: rgba(255,255,255,0.3);
      padding: 10px 8px 4px;
      margin-top: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 7px 10px;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
      cursor: pointer;
      border: none;
      background: none;
      font-family: inherit;
      width: 100%;
      text-align: left;
      margin-bottom: 1px;

      svg { flex-shrink: 0; opacity: 0.7; }

      &:hover {
        background: rgba(255,255,255,0.07);
        color: rgba(255,255,255,0.9);
        svg { opacity: 1; }
      }

      &.is-active {
        background: #2563eb;
        color: white;
        font-weight: 600;
        svg { opacity: 1; }
      }
    }

    .nav-signout {
      color: rgba(255,255,255,0.4);
      margin-top: 8px;
      &:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
    }

    /* ── Main content area ── */
    .app-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class AdminLayoutComponent {
  @Input() active = '';
  constructor(public auth: AuthService) {}
}
