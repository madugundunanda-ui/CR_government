import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintResponse, ComplaintService } from '../../core/services/complaint.service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
  <div class="app-layout">
    <!-- Officer Sidebar -->
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark">CG</div>
        <div class="brand-text">
          <div class="brand-name">CivicConnect</div>
          <div class="brand-sub">Field Officer</div>
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
        <a routerLink="/officer/dashboard" class="nav-link is-active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a routerLink="/officer/assigned-complaints" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          My Complaints
          <span *ngIf="pendingCount > 0" style="margin-left:auto;background:#b91c1c;color:white;font-size:0.6rem;font-weight:700;padding:1px 6px;border-radius:10px;">{{ pendingCount }}</span>
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

    <!-- Main -->
    <div class="app-main">
      <div class="page-wrap">
        <div class="page-header">
          <div class="page-header-left">
            <h2>My Dashboard</h2>
            <p>{{ today | date:'EEEE, dd MMMM yyyy' }}</p>
          </div>
          <div class="page-header-actions">
            <ng-container *ngIf="urgentCount > 0">
              <span style="font-size:0.75rem;font-weight:600;color:var(--danger);background:var(--danger-lt);border:1px solid #fca5a5;padding:4px 10px;border-radius:3px;">
                {{ urgentCount }} Urgent / High Priority
              </span>
            </ng-container>
          </div>
        </div>

        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
        <div *ngIf="loading" class="loading-row"><div class="spinner"></div></div>

        <ng-container *ngIf="!loading">
          <!-- KPI strip -->
          <div class="kpi-row" style="margin-bottom:16px;">
            <div class="kpi-card kpi-blue">
              <div class="kpi-num">{{ assignedComplaints.length }}</div>
              <div class="kpi-label">Total Assigned</div>
            </div>
            <div class="kpi-card kpi-amber">
              <div class="kpi-num">{{ pendingCount }}</div>
              <div class="kpi-label">Pending / Assigned</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-num">{{ inProgressCount }}</div>
              <div class="kpi-label">In Progress</div>
            </div>
            <div class="kpi-card kpi-green">
              <div class="kpi-num">{{ resolvedCount }}</div>
              <div class="kpi-label">Resolved</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-num">{{ resolutionRate }}%</div>
              <div class="kpi-label">Resolution Rate</div>
            </div>
          </div>

          <!-- Split view -->
          <div style="display:grid;grid-template-columns:1fr 300px;gap:14px;align-items:flex-start;">

            <!-- Complaints list panel -->
            <div class="panel">
              <div class="panel-head">
                <h3>Assigned Complaints</h3>
                <div style="display:flex;gap:8px;">
                  <input class="form-control" style="max-width:180px;" [(ngModel)]="searchQ" placeholder="Search…" />
                  <select class="form-control" style="width:auto;" [(ngModel)]="filterStatus">
                    <option value="">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </div>

              <div *ngIf="filteredComplaints.length === 0" class="empty-state" style="border:none;">
                No complaints match the filter.
              </div>

              <table *ngIf="filteredComplaints.length > 0">
                <thead>
                  <tr>
                    <th style="width:70px;">Ref.</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>SLA</th>
                    <th style="text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of filteredComplaints" (click)="selectComplaint(c)"
                    style="cursor:pointer;" [style.background]="selected?.id===c.id ? 'var(--primary-lt)' : ''">
                    <td style="font-size:0.7rem;font-weight:700;color:var(--text-500);">GRV-{{ c.id }}</td>
                    <td>
                      <div style="font-size:0.8rem;font-weight:600;color:var(--text-900);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ c.title }}</div>
                      <div style="font-size:0.67rem;color:var(--text-500);">{{ c.citizenName }}</div>
                    </td>
                    <td><span class="badge badge-{{ c.priority }}">{{ c.priority }}</span></td>
                    <td><span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span></td>
                    <td style="font-size:0.72rem;" [class.text-danger]="isSlaBreached(c)" [class.fw-600]="isSlaBreached(c)">
                      {{ c.slaDeadline ? (c.slaDeadline | date:'dd/MM') : '—' }}
                    </td>
                    <td style="text-align:right;">
                      <button *ngIf="c.status === 'ASSIGNED' || c.status === 'PENDING'"
                        class="btn btn-secondary btn-xs" (click)="$event.stopPropagation(); changeStatus(c, 'IN_PROGRESS')">
                        Start
                      </button>
                      <button *ngIf="c.status === 'IN_PROGRESS'"
                        class="btn btn-primary btn-xs" (click)="$event.stopPropagation(); changeStatus(c, 'RESOLVED')">
                        Resolve
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Detail / Action panel -->
            <div style="display:flex;flex-direction:column;gap:12px;">
              <!-- Complaint Detail -->
              <div *ngIf="selected" class="panel">
                <div class="panel-head">
                  <h3 style="font-size:0.78rem;">GRV-{{ selected.id }}</h3>
                  <button class="modal-close-btn" (click)="selected = null">&#215;</button>
                </div>
                <div class="panel-body" style="font-size:0.78rem;">
                  <div style="font-weight:700;color:var(--text-900);margin-bottom:8px;line-height:1.4;">{{ selected.title }}</div>
                  <div style="display:flex;gap:6px;margin-bottom:10px;">
                    <span class="badge badge-{{ selected.status }}">{{ formatStatus(selected.status) }}</span>
                    <span class="badge badge-{{ selected.priority }}">{{ selected.priority }}</span>
                  </div>

                  <table style="width:100%;border-collapse:collapse;font-size:0.72rem;">
                    <tr style="border-bottom:1px solid var(--border);">
                      <td style="padding:5px 0;color:var(--text-500);font-weight:600;width:80px;">Citizen</td>
                      <td style="padding:5px 0;">{{ selected.citizenName }}</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border);">
                      <td style="padding:5px 0;color:var(--text-500);font-weight:600;">Category</td>
                      <td style="padding:5px 0;">{{ selected.category || 'General' }}</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border);" *ngIf="selected.address">
                      <td style="padding:5px 0;color:var(--text-500);font-weight:600;">Location</td>
                      <td style="padding:5px 0;">{{ selected.address }}</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border);">
                      <td style="padding:5px 0;color:var(--text-500);font-weight:600;">SLA</td>
                      <td style="padding:5px 0;" [class.text-danger]="isSlaBreached(selected)">
                        {{ selected.slaDeadline | date:'dd MMM yyyy, HH:mm' }}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;color:var(--text-500);font-weight:600;">Filed</td>
                      <td style="padding:5px 0;">{{ selected.createdAt | date:'dd MMM yyyy' }}</td>
                    </tr>
                  </table>

                  <div *ngIf="selected.description" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
                    <div style="font-size:0.68rem;font-weight:700;color:var(--text-500);text-transform:uppercase;margin-bottom:4px;">Description</div>
                    <p style="font-size:0.75rem;color:var(--text-700);line-height:1.5;margin:0;">{{ selected.description }}</p>
                  </div>

                  <!-- Status update -->
                  <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
                    <div style="font-size:0.68rem;font-weight:700;color:var(--text-500);text-transform:uppercase;margin-bottom:6px;">Update Status</div>
                    <select class="form-control" [(ngModel)]="pendingStatus" style="margin-bottom:6px;">
                      <option value="">— Select status —</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <textarea class="form-control" [(ngModel)]="officerNote" rows="2" placeholder="Remarks (optional)…" style="margin-bottom:6px;"></textarea>
                    <button class="btn btn-primary btn-sm" style="width:100%;justify-content:center;"
                      [disabled]="!pendingStatus || updatingStatus" (click)="submitStatusUpdate()">
                      {{ updatingStatus ? 'Updating…' : 'Submit Update' }}
                    </button>
                    <div *ngIf="updateError" class="alert alert-danger" style="margin-top:6px;font-size:0.72rem;">{{ updateError }}</div>
                  </div>
                </div>
              </div>

              <!-- No selection hint -->
              <div *ngIf="!selected" class="panel" style="text-align:center;padding:28px 16px;color:var(--text-500);font-size:0.78rem;">
                Click a complaint row to view details and update its status.
              </div>

              <!-- Performance summary -->
              <div class="panel">
                <div class="panel-head"><h3>My Performance</h3></div>
                <table style="width:100%;">
                  <tbody>
                    <tr style="border-bottom:1px solid var(--border);">
                      <td style="padding:8px 12px;font-size:0.75rem;color:var(--text-500);">Assigned</td>
                      <td style="padding:8px 12px;font-size:0.8rem;font-weight:700;text-align:right;">{{ assignedComplaints.length }}</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border);">
                      <td style="padding:8px 12px;font-size:0.75rem;color:var(--text-500);">Resolved</td>
                      <td style="padding:8px 12px;font-size:0.8rem;font-weight:700;color:var(--success);text-align:right;">{{ resolvedCount }}</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--border);">
                      <td style="padding:8px 12px;font-size:0.75rem;color:var(--text-500);">In Progress</td>
                      <td style="padding:8px 12px;font-size:0.8rem;font-weight:700;text-align:right;">{{ inProgressCount }}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 12px;font-size:0.75rem;color:var(--text-500);">Resolution Rate</td>
                      <td style="padding:8px 12px;font-size:0.8rem;font-weight:700;text-align:right;">{{ resolutionRate }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </ng-container>
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
export class OfficerDashboardComponent implements OnInit {
  assignedComplaints: ComplaintResponse[] = [];
  selected: ComplaintResponse | null = null;
  today = new Date();
  searchQ = '';
  filterStatus = '';
  officerNote = '';
  pendingStatus = '';
  loading = false;
  error = '';
  updatingStatus = false;
  updateError = '';

  get isSupervisor(): boolean { return this.auth.currentUser()?.role === 'SUPERVISOR'; }
  get initials(): string {
    return (this.auth.currentUser()?.name ?? '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'O';
  }

  constructor(public auth: AuthService, private complaintService: ComplaintService) {}

  ngOnInit(): void { this.loadTasks(); }

  loadTasks(): void {
    this.loading = true;
    this.error = '';
    this.complaintService.getMyTasks().subscribe({
      next: (tasks) => { this.assignedComplaints = tasks; this.loading = false; },
      error: () => { this.error = 'Failed to load tasks.'; this.loading = false; }
    });
  }

  get filteredComplaints(): ComplaintResponse[] {
    return this.assignedComplaints.filter(c => {
      const s = !this.filterStatus || c.status === this.filterStatus;
      const q = !this.searchQ || c.title.toLowerCase().includes(this.searchQ.toLowerCase()) || String(c.id).includes(this.searchQ);
      return s && q;
    });
  }

  get pendingCount()    { return this.assignedComplaints.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED').length; }
  get inProgressCount() { return this.assignedComplaints.filter(c => c.status === 'IN_PROGRESS').length; }
  get resolvedCount()   { return this.assignedComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length; }
  get urgentCount()     { return this.assignedComplaints.filter(c => c.priority === 'URGENT' || c.priority === 'HIGH').length; }
  get resolutionRate()  { const r = this.resolvedCount; return this.assignedComplaints.length ? Math.round((r / this.assignedComplaints.length) * 100) : 0; }

  isSlaBreached(c: ComplaintResponse): boolean {
    return !!c.slaDeadline && c.status !== 'RESOLVED' && c.status !== 'CLOSED' && new Date(c.slaDeadline) < new Date();
  }

  selectComplaint(c: ComplaintResponse): void { this.selected = c; this.pendingStatus = ''; this.updateError = ''; }

  changeStatus(c: ComplaintResponse, status: string): void {
    this.complaintService.updateTaskStatus(c.id, status).subscribe({
      next: (updated) => {
        const idx = this.assignedComplaints.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.assignedComplaints[idx] = updated;
        if (this.selected?.id === updated.id) this.selected = updated;
      },
      error: () => {}
    });
  }

  submitStatusUpdate(): void {
    if (!this.selected || !this.pendingStatus) return;
    this.updatingStatus = true;
    this.updateError = '';
    this.complaintService.updateTaskStatus(this.selected.id, this.pendingStatus, this.officerNote).subscribe({
      next: (updated) => {
        const idx = this.assignedComplaints.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.assignedComplaints[idx] = updated;
        this.selected = updated;
        this.pendingStatus = '';
        this.officerNote = '';
        this.updatingStatus = false;
      },
      error: (err) => { this.updateError = err?.error?.message || 'Update failed.'; this.updatingStatus = false; }
    });
  }

  formatStatus(s: string): string { return ComplaintService.formatStatus(s); }
}