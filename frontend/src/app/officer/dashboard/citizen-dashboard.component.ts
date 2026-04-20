import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintResponse, ComplaintService } from '../../core/services/complaint.service';

@Component({
    selector: 'app-citizen-dashboard',
    standalone: true,
    imports: [RouterLink, CommonModule],
    template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="sidebar-user">
          <div class="avatar">{{ getInitials() }}</div>
          <div class="user-name">{{ auth.currentUser()?.name }}</div>
          <div class="user-role">Citizen Portal</div>
        </div>
        <nav class="nav-menu">
          <div class="nav-section-title">Main Menu</div>
          <a routerLink="/citizen/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="/citizen/raise-complaint" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">➕</span> Raise Complaint
          </a>
          <a routerLink="/citizen/complaint-history" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span> My Complaints
            <span class="badge-count">{{ complaints.length }}</span>
          </a>
          <div class="nav-section-title">Account</div>
          <a routerLink="/profile" class="nav-item"><span class="nav-icon">👤</span> My Profile</a>
          <button class="nav-item logout-btn" (click)="auth.logout()">
            <span class="nav-icon">🚪</span> Sign Out
          </button>
        </nav>
      </aside>

      <main class="main-content">
        <div class="welcome-banner">
          <div class="welcome-left">
            <div class="welcome-greeting">Good Day, {{ firstName }}! 👋</div>
            <h2>Your Civic Dashboard</h2>
            <p>Track your complaints and monitor resolution progress.</p>
          </div>
          <div class="welcome-cta">
            <a routerLink="/citizen/raise-complaint" class="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              Raise New Complaint
            </a>
          </div>
        </div>

        <div *ngIf="loading" style="text-align:center; padding:32px;">
          <div class="spinner"></div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon" style="background:#e8f4fd; color:#1f3c88;">📋</div>
            <div class="stat-info"><h3>{{ complaints.length }}</h3><p>Total Complaints</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7; color:#b45309;">🕐</div>
            <div class="stat-info"><h3>{{ pendingCount }}</h3><p>Pending / Assigned</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#e8fdf8; color:#2a9d8f;">⚙️</div>
            <div class="stat-info"><h3>{{ inProgressCount }}</h3><p>In Progress</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5; color:#065f46;">✅</div>
            <div class="stat-info"><h3>{{ resolvedCount }}</h3><p>Resolved</p></div>
          </div>
        </div>

        <div class="section-header-row">
          <h3>Recent Complaints</h3>
          <a routerLink="/citizen/complaint-history" class="btn btn-outline btn-sm">View All →</a>
        </div>

        <div *ngIf="!loading && complaints.length === 0" class="empty-card">
          <div style="font-size:2rem; margin-bottom:12px;">📝</div>
          <h3>No complaints yet</h3>
          <p>You haven't raised any complaints yet.</p>
          <a routerLink="/citizen/raise-complaint" class="btn btn-primary" style="margin-top:12px;">Raise Your First Complaint</a>
        </div>

        <div class="complaints-grid">
          <div *ngFor="let c of recentComplaints" class="complaint-card" [class]="'priority-' + c.priority.toLowerCase()">
            <div class="cc-header">
              <div class="cc-meta">
                <span class="cc-ticket">GRV-{{ c.id }}</span>
                <span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span>
              </div>
              <span class="badge badge-{{ c.priority }}">{{ c.priority }}</span>
            </div>
            <h4 class="cc-title">{{ c.title }}</h4>
            <p class="cc-desc">{{ c.description | slice:0:120 }}{{ c.description.length > 120 ? '...' : '' }}</p>
            <div class="cc-tags">
              <span class="cc-tag cat">🏷️ {{ c.category || 'Others' }}</span>
              <span *ngIf="c.address" class="cc-tag loc">📍 {{ c.address | slice:0:30 }}</span>
            </div>
            <div *ngIf="c.assignedOfficerName" class="cc-officer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Officer: <strong>{{ c.assignedOfficerName }}</strong>
            </div>
            <div class="cc-footer">
              <span class="cc-date">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ c.createdAt | date:'dd MMM yyyy' }}
              </span>
              <span *ngIf="c.resolvedAt" class="cc-resolved-date">✅ Resolved {{ c.resolvedAt | date:'dd MMM' }}</span>
            </div>
          </div>
        </div>

        <!-- Notice Board (static) -->
        <div class="notice-board">
          <div class="nb-header"><h3>📢 Notice Board</h3></div>
          <div class="nb-items">
            <div class="nb-item nb-info">
              <div class="nb-icon">🔧</div>
              <div class="nb-content">
                <div class="nb-title">System Operational</div>
                <div class="nb-body">All services are running normally. Submit complaints 24/7.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
    styles: [`
    .welcome-banner { background: linear-gradient(135deg, var(--primary), var(--primary-light));
      border-radius: var(--radius-lg); padding: 28px 32px; display: flex; align-items: center;
      justify-content: space-between; gap: 24px; margin-bottom: 24px;
      .welcome-greeting { font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 6px; }
      h2 { color: white; font-size: 1.5rem; margin-bottom: 6px; }
      p  { color: rgba(255,255,255,0.7); font-size: 0.875rem; margin: 0; }
      @media (max-width: 768px) { flex-direction: column; align-items: flex-start; } }
    .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px;
      @media (max-width: 900px) { grid-template-columns: repeat(2,1fr); }
      @media (max-width: 480px) { grid-template-columns: 1fr; } }
    .section-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; h3 { font-size: 1.15rem; } }
    .complaints-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; margin-bottom: 28px;
      @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .empty-card { text-align: center; padding: 48px; background: white; border-radius: var(--radius-md); border: 1px solid var(--border); margin-bottom: 24px; }
    .complaint-card { background: white; border-radius: var(--radius-md); padding: 20px; border: 1px solid var(--border);
      transition: all 0.2s; border-left: 4px solid var(--border);
      &.priority-HIGH    { border-left-color: var(--danger); }
      &.priority-URGENT  { border-left-color: #7c3aed; }
      &.priority-MEDIUM  { border-left-color: var(--warning); }
      &.priority-LOW     { border-left-color: var(--secondary); }
      &:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
      .cc-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px;
        .cc-meta { display: flex; align-items: center; gap: 8px; }
        .cc-ticket { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); } }
      .cc-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; line-height: 1.35; }
      .cc-desc  { font-size: 0.82rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 12px; }
      .cc-tags  { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
      .cc-tag   { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px;
        &.cat { background: #e8f4fd; color: #1f3c88; } &.loc { background: #f0fdf4; color: #166534; } }
      .cc-officer { font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; margin-bottom: 12px; }
      .cc-footer { display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-light);
        .cc-date { display: flex; align-items: center; gap: 4px; }
        .cc-resolved-date { color: var(--secondary); font-weight: 600; } } }
    .notice-board { background: white; border-radius: var(--radius-md); border: 1px solid var(--border); overflow: hidden;
      .nb-header { padding: 16px 20px; border-bottom: 1px solid var(--border); h3 { font-size: 1rem; margin: 0; } }
      .nb-items { display: flex; flex-direction: column; }
      .nb-item { display: flex; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border);
        &:last-child { border-bottom: none; } &.nb-info { border-left: 3px solid var(--info); }
        .nb-icon { font-size: 1.4rem; flex-shrink: 0; }
        .nb-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
        .nb-body  { font-size: 0.8rem; color: var(--text-muted); } } }
    .logout-btn { background: none; border: none; width: 100%; text-align: left; color: rgba(255,255,255,0.75); cursor: pointer; font-family: var(--font); font-size: 0.875rem; }
  `]
})
export class CitizenDashboardComponent implements OnInit {
    complaints: ComplaintResponse[] = [];
    loading = false;

    constructor(public auth: AuthService, private complaintService: ComplaintService) { }

    ngOnInit(): void {
        this.loading = true;
        this.complaintService.getMyComplaints().subscribe({
            next: (list) => { this.complaints = list; this.loading = false; },
            error: () => this.loading = false
        });
    }

    get recentComplaints(): ComplaintResponse[] { return this.complaints.slice(0, 4); }
    get pendingCount(): number { return this.complaints.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED').length; }
    get inProgressCount(): number { return this.complaints.filter(c => c.status === 'IN_PROGRESS').length; }
    get resolvedCount(): number { return this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length; }
    get firstName(): string { return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Citizen'; }
    getInitials(): string {
        const name = this.auth.currentUser()?.name ?? '';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    formatStatus(s: string): string { return ComplaintService.formatStatus(s); }
}