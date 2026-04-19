import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { Complaint } from '../../core/models/models';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-user">
          <div class="avatar">AV</div>
          <div class="user-name">{{ auth.currentUser()?.name }}</div>
          <div class="user-role">Field Officer · Roads Dept.</div>
        </div>

        <nav class="nav-menu">
          <div class="nav-section-title">Workspace</div>
          <a routerLink="/officer/dashboard" class="nav-item active">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">📋</span> Assigned Complaints
            <span class="badge-count">{{ assignedComplaints.length }}</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">✅</span> Resolved Cases
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">🗺️</span> Field Map View
          </a>
          <div class="nav-section-title">Reports</div>
          <a href="#" class="nav-item">
            <span class="nav-icon">📈</span> My Performance
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">🕒</span> SLA Report
          </a>
          <div class="nav-section-title">Account</div>
          <a href="#" class="nav-item">
            <span class="nav-icon">⚙️</span> Settings
          </a>
          <button class="nav-item logout-btn" (click)="auth.logout()">
            <span class="nav-icon">🚪</span> Sign Out
          </button>
        </nav>
      </aside>

      <main class="main-content">
        <!-- Header -->
        <div class="officer-header">
          <div>
            <div class="oh-greeting">Welcome back, {{ auth.currentUser()?.name?.split(' ')?.[0] }}</div>
            <h2>Officer Dashboard</h2>
            <div class="oh-meta">
              <span>📅 {{ today | date:'EEEE, dd MMMM yyyy' }}</span>
              <span>🏢 Roads & Infrastructure Department</span>
              <span>🆔 EMP ID: BBMP/R/2019/0041</span>
            </div>
          </div>
          <div class="oh-actions">
            <div class="sla-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>2 SLA Breaches Risk</span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row" style="grid-template-columns: repeat(5,1fr); margin-bottom: 28px;">
          <div class="stat-card">
            <div class="stat-icon" style="background:#e8f4fd; color:#1f3c88;">📥</div>
            <div class="stat-info"><h3>{{ assignedComplaints.length }}</h3><p>Total Assigned</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7; color:#b45309;">⏳</div>
            <div class="stat-info"><h3>{{ pendingCount }}</h3><p>Pending Action</p></div>
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
              <h3>Assigned Complaints</h3>
              <div class="panel-filters">
                <input type="text" [(ngModel)]="searchQ" placeholder="Search..." class="mini-search" />
                <select [(ngModel)]="filterStatus" class="filter-select">
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div class="complaint-list">
              <div *ngFor="let c of filteredComplaints" class="complaint-row" [class]="'pri-' + c.priority.toLowerCase()" (click)="selectComplaint(c)">
                  <div class="cr-left">
                    <div class="cr-priority-dot" [class]="'dot-' + c.priority.toLowerCase()"></div>
                    <div class="cr-info">
                      <div class="cr-ticket">{{ c.ticketNo }}</div>
                      <div class="cr-title">{{ c.title }}</div>
                      <div class="cr-meta">
                        <span>🏷️ {{ c.category }}</span>
                        <span>📍 {{ c.ward }}</span>
                        <span>👤 {{ c.citizenName }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="cr-right">
                    <span class="badge" [class]="'badge-' + c.status">{{ formatStatus(c.status) }}</span>
                    <span class="badge" [class]="'badge-' + c.priority.toLowerCase()">{{ c.priority }}</span>
                    <div class="cr-date">{{ c.createdAt | date:'dd MMM' }}</div>
                    <div class="cr-actions">
                      <button *ngIf="c.status === 'open'" class="btn btn-secondary btn-sm" (click)="$event.stopPropagation(); updateStatus(c, 'in-progress')">Start Work</button>
                      <button *ngIf="c.status === 'in-progress'" class="btn btn-primary btn-sm" (click)="$event.stopPropagation(); updateStatus(c, 'resolved')">Mark Resolved</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel -->
          <div class="right-panel">
            <!-- Detail View -->
            <div *ngIf="selected; else selectHint" class="detail-card">
              <div class="dc-header">
                <div class="dc-ticket">{{ selected!.ticketNo }}</div>
                <button class="dc-close" (click)="setSelected(null)">✕</button>
              </div>
              <h4 class="dc-title">{{ selected!.title }}</h4>

              <div class="dc-badges">
                <span class="badge" [class]="'badge-' + selected!.status">{{ formatStatus(selected!.status) }}</span>
                <span class="badge" [class]="'badge-' + selected!.priority.toLowerCase()">{{ selected!.priority }}</span>
              </div>

              <div class="dc-field"><span class="df-label">Category</span><span>{{ selected!.category }}</span></div>
              <div class="dc-field"><span class="df-label">Citizen</span><span>{{ selected!.citizenName }}</span></div>
              <div class="dc-field"><span class="df-label">Location</span><span>{{ selected!.address }}</span></div>
              <div class="dc-field"><span class="df-label">Ward</span><span>{{ selected!.ward }}</span></div>
              <div class="dc-field"><span class="df-label">Filed</span><span>{{ selected!.createdAt | date:'dd MMM yyyy' }}</span></div>

              <div class="dc-desc">
                <div class="df-label">Description</div>
                <p>{{ selected!.description }}</p>
              </div>

              <div *ngIf="selected!.imageUrl" class="dc-img">
                <img [src]="selected!.imageUrl" alt="Evidence" loading="lazy" />
              </div>

              <a *ngIf="selected!.latitude" href="#" class="btn btn-outline btn-sm" style="margin-top:8px;width:100%;justify-content:center;">
                🗺️ View on Map
              </a>

              <div class="dc-update-section">
                <div class="df-label">Add Update</div>
                <textarea [(ngModel)]="officerNote" class="form-control" rows="3"
                  placeholder="Enter field update or action taken..."></textarea>
                <button class="btn btn-primary btn-sm" style="margin-top:8px;width:100%;justify-content:center;"
                  [disabled]="!officerNote.trim()">
                  Post Update
                </button>
              </div>
            </div>
            <ng-template #selectHint>
              <div class="select-hint">
                <div class="sh-icon">👆</div>
                <p>Select a complaint from the list to view details and take action.</p>
              </div>
            </ng-template>

            <!-- Performance Card -->
            <div class="perf-card">
              <h4>📈 My Performance (March 2024)</h4>
              <div class="perf-items">
                <div class="perf-item">
                  <span>Avg. Resolution Time</span>
                  <strong>3.2 days</strong>
                </div>
                <div class="perf-item">
                  <span>SLA Compliance</span>
                  <strong style="color: var(--secondary);">94%</strong>
                </div>
                <div class="perf-item">
                  <span>Citizen Rating</span>
                  <strong>4.7 ⭐</strong>
                </div>
                <div class="perf-item">
                  <span>Cases This Month</span>
                  <strong>18</strong>
                </div>
              </div>
            </div>
          </div>
        
  `,
  styles: [`
    .officer-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 24px; gap: 16px;

      .oh-greeting { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-bottom: 4px; }
      h2 { margin-bottom: 8px; }
      .oh-meta {
        display: flex; gap: 16px; flex-wrap: wrap;
        font-size: 0.8rem; color: var(--text-muted);
        span { display: flex; align-items: center; gap: 4px; }
      }

      .sla-alert {
        background: #fff7ed; border: 1px solid #fed7aa;
        border-radius: var(--radius); padding: 10px 16px;
        display: flex; align-items: center; gap: 8px;
        font-size: 0.82rem; font-weight: 600; color: #c2410c;
        white-space: nowrap;
      }
    }

    .stats-row {
      display: grid;
      gap: 16px;
      @media (max-width: 1100px) { grid-template-columns: repeat(3,1fr) !important; }
      @media (max-width: 600px)  { grid-template-columns: repeat(2,1fr) !important; }
    }

    .officer-grid {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 20px;
      align-items: flex-start;

      @media (max-width: 1100px) { grid-template-columns: 1fr; }
    }

    .complaints-panel {
      background: white; border-radius: var(--radius-md);
      border: 1px solid var(--border); overflow: hidden;

      .panel-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        flex-wrap: wrap;
        h3 { font-size: 1rem; margin: 0; }

        .panel-filters { display: flex; gap: 8px; }

        .mini-search {
          padding: 7px 12px; border: 1.5px solid var(--border);
          border-radius: var(--radius); font-size: 0.82rem; font-family: var(--font);
          outline: none; width: 160px;
          &:focus { border-color: var(--primary); }
        }

        .filter-select {
          padding: 7px 12px; border: 1.5px solid var(--border);
          border-radius: var(--radius); font-size: 0.82rem; font-family: var(--font);
          cursor: pointer; outline: none; background: white;
        }
      }

      .complaint-list { display: flex; flex-direction: column; }
    }

    .complaint-row {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      border-left: 4px solid transparent;
      cursor: pointer; transition: background 0.15s;
      flex-wrap: wrap;

      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg-muted); }

      &.pri-high    { border-left-color: var(--danger); }
      &.pri-medium  { border-left-color: var(--warning); }
      &.pri-low     { border-left-color: var(--secondary); }
      &.pri-urgent  { border-left-color: #7c3aed; }

      .cr-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; }

      .cr-priority-dot {
        width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
        &.dot-high   { background: var(--danger); }
        &.dot-medium { background: var(--warning); }
        &.dot-low    { background: var(--secondary); }
        &.dot-urgent { background: #7c3aed; }
      }

      .cr-info {
        .cr-ticket { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); margin-bottom: 2px; font-family: monospace; }
        .cr-title  { font-size: 0.875rem; font-weight: 700; color: var(--text-primary); margin-bottom: 5px; line-height: 1.35; }
        .cr-meta   { display: flex; gap: 10px; flex-wrap: wrap; font-size: 0.72rem; color: var(--text-muted); font-weight: 500; }
      }

      .cr-right {
        display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0;
        .cr-date { font-size: 0.72rem; color: var(--text-light); }
        .cr-actions { display: flex; gap: 6px; }
      }
    }

    /* Right panel */
    .right-panel { display: flex; flex-direction: column; gap: 16px; }

    .detail-card {
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 20px;

      .dc-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 8px;
        .dc-ticket { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); font-family: monospace; }
        .dc-close  { background: var(--bg-muted); border: none; border-radius: 50%;
                     width: 28px; height: 28px; cursor: pointer; font-size: 0.75rem; }
      }

      .dc-title { font-size: 1rem; margin-bottom: 12px; color: var(--text-primary); line-height: 1.35; }
      .dc-badges { display: flex; gap: 6px; margin-bottom: 14px; }

      .dc-field {
        display: flex; gap: 8px; font-size: 0.8rem;
        padding: 7px 0; border-bottom: 1px solid var(--border);
        &:last-of-type { border-bottom: none; }
        .df-label { color: var(--text-muted); font-weight: 700; min-width: 70px; flex-shrink: 0; font-size: 0.72rem; text-transform: uppercase; }
      }

      .dc-desc {
        margin-top: 12px;
        .df-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
        p { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.65; margin: 0; }
      }

      .dc-img {
        margin-top: 12px;
        img { width: 100%; height: 140px; object-fit: cover; border-radius: var(--radius); }
      }

      .dc-update-section {
        margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);
        .df-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
      }
    }

    .select-hint {
      background: white; border: 1px dashed var(--border);
      border-radius: var(--radius-md); padding: 32px 20px;
      text-align: center;
      .sh-icon { font-size: 2rem; margin-bottom: 10px; }
      p { font-size: 0.82rem; color: var(--text-muted); margin: 0; }
    }

    .perf-card {
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 20px;
      h4 { font-size: 0.95rem; margin-bottom: 16px; }
      .perf-items { display: flex; flex-direction: column; gap: 10px; }
      .perf-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 8px 0; border-bottom: 1px solid var(--border);
        &:last-child { border: none; }
        span  { font-size: 0.8rem; color: var(--text-muted); }
        strong { font-size: 0.9rem; color: var(--text-primary); }
      }
    }

    .logout-btn {
      background: none; border: none; width: 100%;
      text-align: left; color: rgba(255,255,255,0.75);
      cursor: pointer; font-family: var(--font); font-size: 0.875rem;
    }
  `]
})
export class OfficerDashboardComponent {
  assignedComplaints: Complaint[];
  selected: Complaint | null = null;
  today = new Date();
  searchQ = '';
  filterStatus = 'all';
  officerNote = '';

  constructor(public auth: AuthService, private mockData: MockDataService) {
    this.assignedComplaints = this.mockData.officerComplaints.filter(c => c.assignedOfficerId === 'u3');
  }

  get filteredComplaints(): Complaint[] {
    return this.assignedComplaints.filter(c => {
      const matchStatus = this.filterStatus === 'all' || c.status === this.filterStatus;
      const matchSearch = !this.searchQ || c.title.toLowerCase().includes(this.searchQ.toLowerCase()) || c.ticketNo.toLowerCase().includes(this.searchQ.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  get pendingCount()    { return this.assignedComplaints.filter(c => c.status === 'open' || c.status === 'pending').length; }
  get inProgressCount() { return this.assignedComplaints.filter(c => c.status === 'in-progress').length; }
  get resolvedCount()   { return this.assignedComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length; }
  get resolutionRate()  {
    const r = this.resolvedCount;
    return this.assignedComplaints.length ? Math.round((r / this.assignedComplaints.length) * 100) : 0;
  }

  formatStatus(s: string) { return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

  updateStatus(c: Complaint, status: any) {
    c.status = status;
    c.updatedAt = new Date().toISOString();
    if (status === 'resolved') c.resolvedAt = new Date().toISOString();
  }

  selectComplaint(c: Complaint) { this.selected = c; }
  setSelected(c: Complaint | null) { this.selected = c; }
}
