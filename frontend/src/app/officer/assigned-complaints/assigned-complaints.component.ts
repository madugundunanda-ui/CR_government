import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintResponse, ComplaintService } from '../../core/services/complaint.service';

@Component({
  selector: 'app-assigned-complaints',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
  <div class="app-layout">
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark">CG</div>
        <div class="brand-text">
          <div class="brand-name">CivicConnect</div>
          <div class="brand-sub">{{ isSupervisor ? 'Supervisor' : 'Field Officer' }}</div>
        </div>
      </div>
      <div class="sidebar-user-block">
        <div class="sub-avatar">{{ initials }}</div>
        <div class="sub-info">
          <div class="sub-name">{{ auth.currentUser()?.name }}</div>
          <div class="sub-role">{{ isSupervisor ? 'Supervisor' : 'Field Officer' }}</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-group-label">Workspace</div>
        <a [routerLink]="isSupervisor ? '/supervisor/dashboard' : '/officer/dashboard'" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a routerLink="/officer/assigned-complaints" class="nav-link is-active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          My Complaints
        </a>
        <div class="nav-group-label">Account</div>
        <a routerLink="/profile" class="nav-link">
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
      <div class="page-wrap">
        <div class="page-header">
          <div class="page-header-left">
            <h2>My Assigned Complaints</h2>
            <p>All complaints currently assigned to you — update status directly from this list.</p>
          </div>
        </div>

        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <!-- Filter bar -->
        <div class="filter-bar">
          <input class="form-control" style="max-width:240px;" [(ngModel)]="searchQ" placeholder="Search title or ID…" />
          <select class="form-control" style="width:auto;" [(ngModel)]="filterStatus">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select class="form-control" style="width:auto;" [(ngModel)]="filterPriority">
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <span class="text-muted" style="font-size:0.75rem;margin-left:auto;">{{ filtered.length }} record(s)</span>
        </div>

        <div *ngIf="loading" class="loading-row"><div class="spinner"></div></div>

        <div *ngIf="!loading && filtered.length === 0" class="empty-state">
          No complaints match the current filter.
        </div>

        <div *ngIf="!loading && filtered.length > 0" class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width:72px;">Ref.</th>
                <th>Title</th>
                <th>Citizen</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Deadline</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filtered">
                <td style="font-size:0.7rem;font-weight:700;color:var(--text-500);">GRV-{{ c.id }}</td>
                <td>
                  <div style="font-size:0.8rem;font-weight:600;color:var(--text-900);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ c.title }}</div>
                </td>
                <td style="font-size:0.78rem;color:var(--text-500);">{{ c.citizenName }}</td>
                <td style="font-size:0.75rem;color:var(--text-500);">{{ c.category || 'General' }}</td>
                <td><span class="badge badge-{{ c.priority }}">{{ c.priority }}</span></td>
                <td><span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span></td>
                <td style="font-size:0.72rem;" [class.text-danger]="isSlaBreached(c)" [class.fw-600]="isSlaBreached(c)">
                  {{ c.slaDeadline ? (c.slaDeadline | date:'dd MMM yyyy, HH:mm') : '—' }}
                  <span *ngIf="isSlaBreached(c)" style="font-size:0.62rem;"> &#9888; Breached</span>
                </td>
                <td style="text-align:right;">
                  <button *ngIf="c.status === 'ASSIGNED' || c.status === 'PENDING'"
                    class="btn btn-secondary btn-xs" (click)="changeStatus(c, 'IN_PROGRESS')">Start</button>
                  <button *ngIf="c.status === 'IN_PROGRESS'"
                    class="btn btn-primary btn-xs" (click)="changeStatus(c, 'RESOLVED')">Resolve</button>
                  <span *ngIf="c.status === 'RESOLVED' || c.status === 'CLOSED'"
                    style="font-size:0.72rem;color:var(--success);font-weight:600;">Done</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-footer"><span>{{ filtered.length }} complaint(s)</span></div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .sub-avatar { width:30px;height:30px;border-radius:50%;background:#374151;border:1px solid rgba(255,255,255,0.15);
      display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;color:rgba(255,255,255,0.9);flex-shrink:0; }
    .sub-name { font-size:0.78rem;font-weight:600;color:rgba(255,255,255,0.9); }
    .sub-role { font-size:0.62rem;color:rgba(255,255,255,0.4); }
    .sidebar-user-block { display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:6px; }
    .sidebar-brand { display:flex;align-items:center;gap:10px;padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,0.08); }
    .brand-mark { width:32px;height:32px;background:#2563eb;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:800;color:white;flex-shrink:0; }
    .brand-name { font-size:0.875rem;font-weight:700;color:white;line-height:1.2; }
    .brand-sub  { font-size:0.62rem;color:rgba(255,255,255,0.45); }
    .nav-group-label { font-size:0.58rem;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,255,255,0.3);padding:10px 8px 4px; }
    .nav-link { display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:5px;font-size:0.8rem;font-weight:500;
      color:rgba(255,255,255,0.6);text-decoration:none;transition:background 0.15s,color 0.15s;cursor:pointer;border:none;background:none;
      font-family:inherit;width:100%;text-align:left;margin-bottom:1px;
      svg { flex-shrink:0;opacity:0.7; }
      &:hover { background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.9); svg { opacity:1; } }
      &.is-active { background:#2563eb;color:white;font-weight:600; svg { opacity:1; } } }
    .nav-signout { color:rgba(255,255,255,0.4);margin-top:8px; &:hover { color:#ef4444;background:rgba(239,68,68,0.1); } }
    .sidebar-nav { padding:0 8px 16px;flex:1; }
    .app-sidebar { width:220px;flex-shrink:0;background:#1e2a3b;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto; }
  `]
})
export class AssignedComplaintsComponent implements OnInit {
  complaints: ComplaintResponse[] = [];
  loading = false;
  error = '';
  searchQ = '';
  filterStatus = '';
  filterPriority = '';

  get isSupervisor(): boolean { return this.auth.currentUser()?.role === 'SUPERVISOR'; }
  get initials(): string {
    return (this.auth.currentUser()?.name ?? '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'O';
  }

  constructor(public auth: AuthService, private complaintService: ComplaintService) {}

  ngOnInit(): void {
    this.loading = true;
    this.complaintService.getMyTasks().subscribe({
      next: (tasks) => { this.complaints = tasks; this.loading = false; },
      error: () => { this.error = 'Failed to load tasks.'; this.loading = false; }
    });
  }

  get filtered(): ComplaintResponse[] {
    return this.complaints.filter(c => {
      const s = !this.filterStatus   || c.status   === this.filterStatus;
      const p = !this.filterPriority || c.priority === this.filterPriority;
      const q = !this.searchQ || c.title.toLowerCase().includes(this.searchQ.toLowerCase()) || String(c.id).includes(this.searchQ);
      return s && p && q;
    });
  }

  changeStatus(c: ComplaintResponse, status: string): void {
    this.complaintService.updateTaskStatus(c.id, status).subscribe({
      next: (updated) => {
        const idx = this.complaints.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.complaints[idx] = updated;
      },
      error: (err) => { this.error = err?.error?.message || 'Update failed.'; setTimeout(() => this.error = '', 3000); }
    });
  }

  isSlaBreached(c: ComplaintResponse): boolean {
    return !!c.slaDeadline && new Date(c.slaDeadline) < new Date() && c.status !== 'RESOLVED' && c.status !== 'CLOSED';
  }

  formatStatus(s: string): string { return ComplaintService.formatStatus(s); }
}