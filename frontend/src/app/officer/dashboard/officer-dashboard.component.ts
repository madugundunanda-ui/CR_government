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
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-user">
          <div class="avatar">{{ getInitials() }}</div>
          <div class="user-name">{{ auth.currentUser()?.name }}</div>
          <div class="user-role">Field Officer</div>
        </div>
        <nav class="nav-menu">
          <div class="nav-section-title">Workspace</div>
          <a routerLink="/officer/dashboard" class="nav-item active">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="/officer/assigned-complaints" class="nav-item">
            <span class="nav-icon">📋</span> Assigned Complaints
            <span class="badge-count">{{ assignedComplaints.length }}</span>
          </a>
          <div class="nav-section-title">Account</div>
          <a routerLink="/profile" class="nav-item"><span class="nav-icon">👤</span> My Profile</a>
          <button class="nav-item logout-btn" (click)="auth.logout()">
            <span class="nav-icon">🚪</span> Sign Out
          </button>
        </nav>
      </aside>

      <main class="main-content">
        <div class="officer-header">
          <div>
            <div class="oh-greeting">Welcome back, {{ firstName }}!</div>
            <h2>Officer Dashboard</h2>
            <div class="oh-meta">
              <span>📅 {{ today | date:'EEEE, dd MMMM yyyy' }}</span>
            </div>
          </div>
          <div class="oh-actions">
            <div *ngIf="urgentCount > 0" class="sla-alert">
              <span>⚠️ {{ urgentCount }} Urgent Task{{ urgentCount > 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Loading / Error -->
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div><p>Loading your tasks...</p>
        </div>
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <!-- Stats -->
        <div class="stats-row" style="grid-template-columns: repeat(5,1fr); margin-bottom: 28px;">
          <div class="stat-card">
            <div class="stat-icon" style="background:#e8f4fd; color:#1f3c88;">📥</div>
            <div class="stat-info"><h3>{{ assignedComplaints.length }}</h3><p>Total Assigned</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7; color:#b45309;">⏳</div>
            <div class="stat-info"><h3>{{ pendingCount }}</h3><p>Pending</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#dbeafe; color:#1d4ed8;">⚙️</div>
            <div class="stat-info"><h3>{{ inProgressCount }}</h3><p>In Progress</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5; color:#065f46;">✅</div>
            <div class="stat-info"><h3>{{ resolvedCount }}</h3><p>Resolved</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#f0fdf4; color:#166534;">📊</div>
            <div class="stat-info"><h3>{{ resolutionRate }}%</h3><p>Resolution Rate</p></div>
          </div>
        </div>

        <div class="officer-grid">
          <!-- Complaints Table -->
          <div class="complaints-panel">
            <div class="panel-header">
              <h3>My Assigned Complaints</h3>
              <div class="panel-filters">
                <input type="text" [(ngModel)]="searchQ" placeholder="Search..." class="mini-search" />
                <select [(ngModel)]="filterStatus" class="filter-select">
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            <div *ngIf="!loading && filteredComplaints.length === 0" class="empty-panel">
              <div style="padding:32px; text-align:center; color:var(--text-muted);">
                <div style="font-size:2rem; margin-bottom:8px;">📭</div>
                <p>No complaints assigned to you yet.</p>
              </div>
            </div>

            <div class="complaint-list">
              <div *ngFor="let c of filteredComplaints" class="complaint-row"
                [class]="'pri-' + c.priority.toLowerCase()" (click)="selectComplaint(c)">
                <div class="cr-left">
                  <div class="cr-priority-dot" [class]="'dot-' + c.priority.toLowerCase()"></div>
                  <div class="cr-info">
                    <div class="cr-ticket">GRV-{{ c.id }}</div>
                    <div class="cr-title">{{ c.title }}</div>
                    <div class="cr-meta">
                      <span>🏷️ {{ c.category || 'Others' }}</span>
                      <span *ngIf="c.address">📍 {{ c.address }}</span>
                      <span>👤 {{ c.citizenName }}</span>
                    </div>
                  </div>
                </div>
                <div class="cr-right">
                  <span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span>
                  <span class="badge badge-{{ c.priority }}">{{ c.priority }}</span>
                  <div class="cr-date">{{ c.createdAt | date:'dd MMM' }}</div>
                  <div class="cr-actions">
                    <button *ngIf="c.status === 'ASSIGNED' || c.status === 'PENDING'"
                      class="btn btn-secondary btn-sm"
                      (click)="$event.stopPropagation(); changeStatus(c, 'IN_PROGRESS')">
                      Start Work
                    </button>
                    <button *ngIf="c.status === 'IN_PROGRESS'"
                      class="btn btn-primary btn-sm"
                      (click)="$event.stopPropagation(); changeStatus(c, 'RESOLVED')">
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detail Panel -->
          <div class="right-panel">
            <div *ngIf="selected; else selectHint" class="detail-card">
              <div class="dc-header">
                <div class="dc-ticket">GRV-{{ selected!.id }}</div>
                <button class="dc-close" (click)="selected = null">✕</button>
              </div>
              <h4 class="dc-title">{{ selected!.title }}</h4>
              <div class="dc-badges">
                <span class="badge badge-{{ selected!.status }}">{{ formatStatus(selected!.status) }}</span>
                <span class="badge badge-{{ selected!.priority }}">{{ selected!.priority }}</span>
              </div>
              <div class="dc-field"><span class="df-label">Category</span><span>{{ selected!.category || 'Others' }}</span></div>
              <div class="dc-field"><span class="df-label">Citizen</span><span>{{ selected!.citizenName }}</span></div>
              <div class="dc-field" *ngIf="selected!.address"><span class="df-label">Location</span><span>{{ selected!.address }}</span></div>
              <div class="dc-field"><span class="df-label">SLA Deadline</span><span>{{ selected!.slaDeadline | date:'dd MMM yyyy, h:mm a' }}</span></div>
              <div class="dc-field"><span class="df-label">Filed</span><span>{{ selected!.createdAt | date:'dd MMM yyyy' }}</span></div>
              <div class="dc-desc">
                <div class="df-label">Description</div>
                <p>{{ selected!.description }}</p>
              </div>
              <div class="dc-update-section">
                <div class="df-label">Update Status</div>
                <select class="form-control" style="margin-bottom:8px;" [(ngModel)]="pendingStatus">
                  <option value="">— select new status —</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <textarea [(ngModel)]="officerNote" class="form-control" rows="2"
                  placeholder="Optional remarks..."></textarea>
                <button class="btn btn-primary btn-sm" style="margin-top:8px;width:100%;justify-content:center;"
                  [disabled]="!pendingStatus || updatingStatus"
                  (click)="submitStatusUpdate()">
                  {{ updatingStatus ? 'Updating...' : 'Submit Update' }}
                </button>
                <div *ngIf="updateError" class="alert alert-danger" style="margin-top:8px;">{{ updateError }}</div>
              </div>
            </div>
            <ng-template #selectHint>
              <div class="select-hint">
                <div class="sh-icon">👆</div>
                <p>Select a complaint to view details and update status.</p>
              </div>
            </ng-template>

            <div class="perf-card">
              <h4>📈 My Performance</h4>
              <div class="perf-items">
                <div class="perf-item"><span>Assigned</span><strong>{{ assignedComplaints.length }}</strong></div>
                <div class="perf-item"><span>Resolved</span><strong style="color:var(--secondary)">{{ resolvedCount }}</strong></div>
                <div class="perf-item"><span>In Progress</span><strong>{{ inProgressCount }}</strong></div>
                <div class="perf-item"><span>Resolution Rate</span><strong>{{ resolutionRate }}%</strong></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .officer-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 24px; gap: 16px;
      .oh-greeting { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-bottom: 4px; }
      h2 { margin-bottom: 8px; }
      .oh-meta { font-size: 0.8rem; color: var(--text-muted); }
      .sla-alert { background: #fff7ed; border: 1px solid #fed7aa; border-radius: var(--radius);
        padding: 10px 16px; font-size: 0.82rem; font-weight: 600; color: #c2410c; }
    }
    .stats-row { display: grid; gap: 16px;
      @media (max-width: 1100px) { grid-template-columns: repeat(3,1fr) !important; }
      @media (max-width: 600px)  { grid-template-columns: repeat(2,1fr) !important; }
    }
    .loading-state { text-align:center; padding: 40px; color: var(--text-muted); .spinner { margin: 0 auto 12px; } }
    .officer-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: flex-start;
      @media (max-width: 1100px) { grid-template-columns: 1fr; }
    }
    .complaints-panel { background: white; border-radius: var(--radius-md); border: 1px solid var(--border); overflow: hidden;
      .panel-header { padding: 16px 20px; border-bottom: 1px solid var(--border);
        display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
        h3 { font-size: 1rem; margin: 0; }
        .panel-filters { display: flex; gap: 8px; }
        .mini-search { padding: 7px 12px; border: 1.5px solid var(--border); border-radius: var(--radius);
          font-size: 0.82rem; font-family: var(--font); outline: none; width: 160px;
          &:focus { border-color: var(--primary); } }
        .filter-select { padding: 7px 12px; border: 1.5px solid var(--border); border-radius: var(--radius);
          font-size: 0.82rem; font-family: var(--font); cursor: pointer; outline: none; background: white; }
      }
      .complaint-list { display: flex; flex-direction: column; }
    }
    .complaint-row { display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 14px 20px; border-bottom: 1px solid var(--border); border-left: 4px solid transparent;
      cursor: pointer; transition: background 0.15s; flex-wrap: wrap;
      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg-muted); }
      &.pri-high    { border-left-color: var(--danger); }
      &.pri-medium  { border-left-color: var(--warning); }
      &.pri-low     { border-left-color: var(--secondary); }
      &.pri-urgent  { border-left-color: #7c3aed; }
      .cr-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; }
      .cr-priority-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
        &.dot-high   { background: var(--danger); }
        &.dot-medium { background: var(--warning); }
        &.dot-low    { background: var(--secondary); }
        &.dot-urgent { background: #7c3aed; } }
      .cr-info {
        .cr-ticket { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); margin-bottom: 2px; font-family: monospace; }
        .cr-title  { font-size: 0.875rem; font-weight: 700; color: var(--text-primary); margin-bottom: 5px; line-height: 1.35; }
        .cr-meta   { display: flex; gap: 10px; flex-wrap: wrap; font-size: 0.72rem; color: var(--text-muted); } }
      .cr-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0;
        .cr-date { font-size: 0.72rem; color: var(--text-light); }
        .cr-actions { display: flex; gap: 6px; } }
    }
    .right-panel { display: flex; flex-direction: column; gap: 16px; }
    .detail-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px;
      .dc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
        .dc-ticket { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); font-family: monospace; }
        .dc-close  { background: var(--bg-muted); border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; } }
      .dc-title { font-size: 1rem; margin-bottom: 12px; color: var(--text-primary); line-height: 1.35; }
      .dc-badges { display: flex; gap: 6px; margin-bottom: 14px; }
      .dc-field { display: flex; gap: 8px; font-size: 0.8rem; padding: 7px 0; border-bottom: 1px solid var(--border);
        .df-label { color: var(--text-muted); font-weight: 700; min-width: 80px; flex-shrink: 0; font-size: 0.72rem; text-transform: uppercase; } }
      .dc-desc { margin-top: 12px;
        .df-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
        p { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.65; margin: 0; } }
      .dc-update-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);
        .df-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; } }
    }
    .select-hint { background: white; border: 1px dashed var(--border); border-radius: var(--radius-md);
      padding: 32px 20px; text-align: center;
      .sh-icon { font-size: 2rem; margin-bottom: 10px; }
      p { font-size: 0.82rem; color: var(--text-muted); margin: 0; } }
    .perf-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px;
      h4 { font-size: 0.95rem; margin-bottom: 16px; }
      .perf-items { display: flex; flex-direction: column; gap: 10px; }
      .perf-item { display: flex; justify-content: space-between; align-items: center;
        padding: 8px 0; border-bottom: 1px solid var(--border); &:last-child { border: none; }
        span { font-size: 0.8rem; color: var(--text-muted); }
        strong { font-size: 0.9rem; color: var(--text-primary); } } }
    .logout-btn { background: none; border: none; width: 100%; text-align: left; color: rgba(255,255,255,0.75); cursor: pointer; font-family: var(--font); font-size: 0.875rem; }
  `]
})
export class OfficerDashboardComponent implements OnInit {
  assignedComplaints: ComplaintResponse[] = [];
  selected: ComplaintResponse | null = null;
  today = new Date();
  searchQ = '';
  filterStatus = 'all';
  officerNote = '';
  pendingStatus = '';
  loading = false;
  error = '';
  updatingStatus = false;
  updateError = '';

  constructor(public auth: AuthService, private complaintService: ComplaintService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';
    this.complaintService.getMyTasks().subscribe({
      next: (tasks) => { this.assignedComplaints = tasks; this.loading = false; },
      error: (err) => {
        this.error = 'Failed to load tasks. Please refresh.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  get filteredComplaints(): ComplaintResponse[] {
    return this.assignedComplaints.filter(c => {
      const matchStatus = this.filterStatus === 'all' || c.status === this.filterStatus;
      const matchSearch = !this.searchQ ||
        c.title.toLowerCase().includes(this.searchQ.toLowerCase()) ||
        String(c.id).includes(this.searchQ);
      return matchStatus && matchSearch;
    });
  }

  get pendingCount() { return this.assignedComplaints.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED').length; }
  get inProgressCount() { return this.assignedComplaints.filter(c => c.status === 'IN_PROGRESS').length; }
  get resolvedCount() { return this.assignedComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length; }
  get urgentCount() { return this.assignedComplaints.filter(c => c.priority === 'URGENT' || c.priority === 'HIGH').length; }
  get resolutionRate() {
    const r = this.resolvedCount;
    return this.assignedComplaints.length ? Math.round((r / this.assignedComplaints.length) * 100) : 0;
  }

  changeStatus(c: ComplaintResponse, status: string): void {
    this.complaintService.updateTaskStatus(c.id, status).subscribe({
      next: (updated) => {
        const idx = this.assignedComplaints.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.assignedComplaints[idx] = updated;
        if (this.selected?.id === updated.id) this.selected = updated;
      },
      error: (err) => console.error('Status update failed', err)
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
      error: (err) => {
        this.updateError = err?.error?.message || 'Update failed. You may not be authorized.';
        this.updatingStatus = false;
      }
    });
  }

  selectComplaint(c: ComplaintResponse): void { this.selected = c; this.pendingStatus = ''; this.updateError = ''; }
  formatStatus(s: string): string { return ComplaintService.formatStatus(s); }
  getInitials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
  get firstName(): string { return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Officer'; }
}