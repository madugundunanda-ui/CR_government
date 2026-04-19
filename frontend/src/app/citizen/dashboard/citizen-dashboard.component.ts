import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { Complaint } from '../../core/models/models';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
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
          <a href="#" class="nav-item">
            <span class="nav-icon">👤</span> My Profile
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">🔔</span> Notifications
            <span class="badge-count">2</span>
          </a>
          <a href="#" class="nav-item">
            <span class="nav-icon">⚙️</span> Settings
          </a>
          <button class="nav-item logout-btn" (click)="auth.logout()">
            <span class="nav-icon">🚪</span> Sign Out
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <div class="welcome-left">
            <div class="welcome-greeting">Good Day, {{ firstName }}! 👋</div>
            <h2>Your Civic Dashboard</h2>
            <p>Track your complaints, monitor resolution progress and stay updated on civic issues in your area.</p>
          </div>
          <div class="welcome-cta">
            <a routerLink="/citizen/raise-complaint" class="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              Raise New Complaint
            </a>
            <div class="ward-info">
              📍 {{ auth.currentUser()?.address }}
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon" style="background:#e8f4fd; color:#1f3c88;">📋</div>
            <div class="stat-info">
              <h3>{{ complaints.length }}</h3>
              <p>Total Complaints</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7; color:#b45309;">🕐</div>
            <div class="stat-info">
              <h3>{{ pendingCount }}</h3>
              <p>Pending / Open</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#e8fdf8; color:#2a9d8f;">⚙️</div>
            <div class="stat-info">
              <h3>{{ inProgressCount }}</h3>
              <p>In Progress</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5; color:#065f46;">✅</div>
            <div class="stat-info">
              <h3>{{ resolvedCount }}</h3>
              <p>Resolved</p>
            </div>
          </div>
        </div>

        <!-- Complaints Grid -->
        <div class="section-header-row">
          <h3>Recent Complaints</h3>
          <a routerLink="/citizen/complaint-history" class="btn btn-outline btn-sm">View All →</a>
        </div>

        <div class="complaints-grid">
          <div *ngFor="let c of recentComplaints" class="complaint-card" [class]="'priority-' + c.priority.toLowerCase()">
              <div class="cc-header">
                <div class="cc-meta">
                  <span class="cc-ticket">{{ c.ticketNo }}</span>
                  <span class="badge" [class]="'badge-' + c.status">{{ formatStatus(c.status) }}</span>
                </div>
                <span class="badge" [class]="'badge-' + c.priority.toLowerCase()">{{ c.priority }}</span>
              </div>

              <h4 class="cc-title">{{ c.title }}</h4>
              <p class="cc-desc">{{ c.description | slice:0:120 }}{{ c.description.length > 120 ? '...' : '' }}</p>

              <div class="cc-tags">
                <span class="cc-tag cat">🏷️ {{ c.category }}</span>
                <span class="cc-tag loc">📍 {{ c.ward }}</span>
              </div>

              <div *ngIf="c.assignedOfficerName" class="cc-officer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Assigned to: <strong>{{ c.assignedOfficerName }}</strong>
                </div>

              <!-- Timeline progress -->
              <div class="cc-progress">
                <div class="progress-steps">
                  <div *ngFor="let step of statusSteps" class="ps-item" [class.done]="isStepDone(c.status, step.key)" [class.current]="c.status === step.key">
                    <div class="ps-dot"></div>
                    <div class="ps-label">{{ step.label }}</div>
                  </div>
                </div>
              </div>

              <div class="cc-footer">
                <span class="cc-date">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ c.createdAt | date:'dd MMM yyyy' }}
                </span>
                <span *ngIf="c.status === 'resolved' || c.status === 'closed'" class="cc-resolved-date">
                  ✅ Resolved {{ c.resolvedAt | date:'dd MMM' }}
                </span>
              </div>

              <!-- Rating for resolved -->
              <div *ngIf="(c.status === 'resolved' || c.status === 'closed') && c.rating" class="cc-rating">
                <span *ngFor="let s of [1,2,3,4,5]" class="star" [class.filled]="s <= c.rating!">★</span>
                <span class="rating-val">{{ c.rating }}/5</span>
              </div>
            </div>
          </div>

        <!-- Notice Board -->
        <div class="notice-board">
          <div class="nb-header">
            <h3>📢 Notice Board</h3>
            <a href="#">View All</a>
          </div>
          <div class="nb-items">
            <div *ngFor="let notice of notices" class="nb-item" [class]="'nb-' + notice.type">
              <div class="nb-icon">{{ notice.icon }}</div>
              <div class="nb-content">
                <div class="nb-title">{{ notice.title }}</div>
                <div class="nb-body">{{ notice.body }}</div>
                <div class="nb-date">{{ notice.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .welcome-banner {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      border-radius: var(--radius-lg);
      padding: 28px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
      overflow: hidden;
      position: relative;

      &::before {
        content: '';
        position: absolute; right: -40px; top: -40px;
        width: 200px; height: 200px;
        border-radius: 50%;
        background: rgba(255,255,255,0.05);
      }

      .welcome-left {
        .welcome-greeting { font-size: 0.85rem; color: rgba(255,255,255,0.7); font-weight: 500; margin-bottom: 6px; }
        h2 { color: white; font-size: 1.5rem; margin-bottom: 6px; }
        p  { color: rgba(255,255,255,0.7); font-size: 0.875rem; margin: 0; max-width: 420px; }
      }

      .welcome-cta {
        display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
        flex-shrink: 0;

        .ward-info {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.6);
          max-width: 200px;
          text-align: right;
          line-height: 1.4;
        }
      }

      @media (max-width: 768px) {
        flex-direction: column; align-items: flex-start;
        .welcome-cta { align-items: flex-start; }
      }
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;

      @media (max-width: 900px)  { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px)  { grid-template-columns: 1fr; }
    }

    .section-header-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
      h3 { font-size: 1.15rem; color: var(--text-primary); }
    }

    .complaints-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 28px;

      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .complaint-card {
      background: white;
      border-radius: var(--radius-md);
      padding: 20px;
      border: 1px solid var(--border);
      transition: all 0.2s;
      border-left: 4px solid var(--border);
      position: relative;

      &.priority-high   { border-left-color: var(--danger); }
      &.priority-medium { border-left-color: var(--warning); }
      &.priority-low    { border-left-color: var(--secondary); }
      &.priority-urgent { border-left-color: #7c3aed; }

      &:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

      .cc-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px; margin-bottom: 10px;

        .cc-meta { display: flex; align-items: center; gap: 8px; }

        .cc-ticket {
          font-size: 0.72rem; font-weight: 700; color: var(--text-muted);
          letter-spacing: 0.3px;
        }
      }

      .cc-title {
        font-size: 0.95rem; font-weight: 700; color: var(--text-primary);
        margin-bottom: 8px; line-height: 1.35;
      }

      .cc-desc {
        font-size: 0.82rem; color: var(--text-muted);
        line-height: 1.6; margin-bottom: 12px;
      }

      .cc-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }

      .cc-tag {
        font-size: 0.72rem; font-weight: 600;
        padding: 3px 10px; border-radius: 20px;
        &.cat { background: #e8f4fd; color: #1f3c88; }
        &.loc { background: #f0fdf4; color: #166534; }
      }

      .cc-officer {
        font-size: 0.78rem; color: var(--text-muted);
        display: flex; align-items: center; gap: 5px;
        margin-bottom: 12px;
        strong { color: var(--text-secondary); }
      }

      .cc-progress { margin-bottom: 12px; }

      .progress-steps {
        display: flex; align-items: center;

        .ps-item {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          position: relative;

          &:not(:last-child)::after {
            content: '';
            position: absolute; top: 6px; left: 50%; right: -50%;
            height: 2px; background: var(--border);
          }

          &.done::after, &.done.current::after { background: var(--secondary); }

          &.done .ps-dot { background: var(--secondary); border-color: var(--secondary); }
          &.current .ps-dot { background: var(--primary); border-color: var(--primary); box-shadow: 0 0 0 3px rgba(31,60,136,0.15); }

          .ps-dot {
            width: 12px; height: 12px; border-radius: 50%;
            background: white; border: 2px solid var(--border);
            position: relative; z-index: 1; transition: all 0.2s;
          }

          .ps-label {
            font-size: 0.6rem; color: var(--text-muted); margin-top: 4px;
            text-align: center; font-weight: 500; white-space: nowrap;
          }
        }
      }

      .cc-footer {
        display: flex; align-items: center; justify-content: space-between;
        font-size: 0.75rem; color: var(--text-light);
        display: flex; align-items: center; gap: 4px;

        .cc-date { display: flex; align-items: center; gap: 4px; }
        .cc-resolved-date { color: var(--secondary); font-weight: 600; }
      }

      .cc-rating {
        margin-top: 10px; padding-top: 10px;
        border-top: 1px solid var(--border);
        display: flex; align-items: center; gap: 2px;

        .star { font-size: 0.9rem; color: #d1d5db; }
        .star.filled { color: #f59e0b; }
        .rating-val { font-size: 0.75rem; color: var(--text-muted); margin-left: 4px; }
      }
    }

    /* Notice Board */
    .notice-board {
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      overflow: hidden;

      .nb-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
        display: flex; align-items: center; justify-content: space-between;
        h3 { font-size: 1rem; margin: 0; }
        a  { font-size: 0.82rem; color: var(--primary); font-weight: 600; text-decoration: none; }
      }

      .nb-items { display: flex; flex-direction: column; }

      .nb-item {
        display: flex; gap: 14px; padding: 16px 20px;
        border-bottom: 1px solid var(--border); transition: background 0.15s;
        &:last-child { border-bottom: none; }
        &:hover { background: var(--bg-muted); }

        &.nb-info    { border-left: 3px solid var(--info); }
        &.nb-warning { border-left: 3px solid var(--warning); }
        &.nb-success { border-left: 3px solid var(--secondary); }

        .nb-icon { font-size: 1.4rem; flex-shrink: 0; }

        .nb-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
        .nb-body  { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 4px; }
        .nb-date  { font-size: 0.72rem; color: var(--text-light); }
      }
    }

    .logout-btn {
      background: none; border: none; width: 100%;
      text-align: left; color: rgba(255,255,255,0.75);
      cursor: pointer; font-family: var(--font); font-size: 0.875rem;
    }
  `]
})
export class CitizenDashboardComponent {
  complaints: Complaint[];
  recentComplaints: Complaint[];

  statusSteps = [
    { key: 'pending',     label: 'Submitted' },
    { key: 'open',        label: 'Reviewed' },
    { key: 'in-progress', label: 'Working' },
    { key: 'resolved',    label: 'Resolved' },
  ];

  notices = [
    { icon: '🔧', type: 'warning', title: 'Scheduled Maintenance', body: 'BWSSB water supply will be disrupted in Zones 2–4 on Sunday, 10 March from 6 AM to 2 PM.', date: '07 Mar 2024' },
    { icon: '📢', type: 'info',    title: 'New Garbage Collection Schedule', body: 'Updated garbage collection timings for HSR Layout and Koramangala effective from 15 March 2024.', date: '05 Mar 2024' },
    { icon: '✅', type: 'success', title: 'Ward 81 Road Repair Completed', body: 'All reported potholes on 5th Main, 8th Cross and 12th Main have been repaired successfully.', date: '01 Mar 2024' },
  ];

  constructor(public auth: AuthService, private mockData: MockDataService) {
    this.complaints = this.mockData.getComplaintsByUser('u1');
    this.recentComplaints = this.complaints.slice(0, 4);
  }

  get firstName(): string {
    return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Citizen';
  }

  get pendingCount(): number {
    return this.complaints.filter(c => c.status === 'pending' || c.status === 'open').length;
  }

  get inProgressCount(): number {
    return this.complaints.filter(c => c.status === 'in-progress').length;
  }

  get resolvedCount(): number {
    return this.complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  }

  getInitials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase();
  }

  formatStatus(status: string): string {
    return status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  isStepDone(currentStatus: string, stepKey: string): boolean {
    const order = ['pending', 'open', 'in-progress', 'resolved', 'closed'];
    return order.indexOf(currentStatus) >= order.indexOf(stepKey);
  }
}
