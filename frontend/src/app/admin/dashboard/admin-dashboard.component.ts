import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { ComplaintResponse, ComplaintService } from '../../core/services/complaint.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-user">
          <div class="avatar" style="background: #e9c46a; color: #1a2340;">SB</div>
          <div class="user-name">{{ auth.currentUser()?.name }}</div>
          <div class="user-role">System Administrator</div>
        </div>
        <nav class="nav-menu">
          <div class="nav-section-title">Overview</div>
          <a routerLink="/admin/dashboard" class="nav-item active"><span class="nav-icon">📊</span> Dashboard</a>
          <a routerLink="/admin/all-complaints" class="nav-item"><span class="nav-icon">📋</span> All Complaints <span class="badge-count">{{ totalComplaints }}</span></a>
          <a href="#" class="nav-item"><span class="nav-icon">👥</span> Citizens</a>
          <a href="#" class="nav-item"><span class="nav-icon">👮</span> Officers</a>
          <div class="nav-section-title">Management</div>
          <a href="#" class="nav-item"><span class="nav-icon">🏢</span> Departments</a>
          <a href="#" class="nav-item"><span class="nav-icon">🗺️</span> Ward Management</a>
          <a href="#" class="nav-item"><span class="nav-icon">⚙️</span> SLA Configuration</a>
          <a href="#" class="nav-item"><span class="nav-icon">🔔</span> Notifications</a>
          <div class="nav-section-title">Reports</div>
          <a href="#" class="nav-item"><span class="nav-icon">📈</span> Analytics</a>
          <a href="#" class="nav-item"><span class="nav-icon">📥</span> Export Reports</a>
          <a href="#" class="nav-item"><span class="nav-icon">🔒</span> Audit Logs</a>
          <div class="nav-section-title">System</div>
          <a href="#" class="nav-item"><span class="nav-icon">⚙️</span> System Settings</a>
          <button class="nav-item logout-btn" (click)="auth.logout()"><span class="nav-icon">🚪</span> Sign Out</button>
        </nav>
      </aside>

      <main class="main-content">
        <!-- Header -->
        <div class="admin-header">
          <div>
            <div class="ah-greeting">Admin Panel</div>
            <h2>System Overview</h2>
            <p>Real-time stats across all wards, departments and citizen complaints.</p>
          </div>
          <div class="ah-actions">
            <button class="btn btn-outline btn-sm">📥 Export Report</button>
            <button class="btn btn-primary btn-sm">➕ Add Officer</button>
          </div>
        </div>

        <!-- KPI Stats -->
        <div class="kpi-grid">
          <div class="kpi-card blue">
            <div class="kpi-icon">📋</div>
            <div class="kpi-num">{{ totalComplaints.toLocaleString() }}</div>
            <div class="kpi-label">Total Complaints (YTD)</div>
            <div class="kpi-trend">↑ 12% vs last month</div>
          </div>
          <div class="kpi-card green">
            <div class="kpi-icon">✅</div>
            <div class="kpi-num">{{ resolvedComplaints.length.toLocaleString() }}</div>
            <div class="kpi-label">Resolved Complaints</div>
            <div class="kpi-trend">↑ 8% vs last month</div>
          </div>
          <div class="kpi-card yellow">
            <div class="kpi-icon">⏳</div>
            <div class="kpi-num">{{ pendingComplaints.length.toLocaleString() }}</div>
            <div class="kpi-label">Pending Resolution</div>
            <div class="kpi-trend">↓ 5% vs last month</div>
          </div>
          <div class="kpi-card teal">
            <div class="kpi-icon">⚡</div>
            <div class="kpi-num">92%</div>
            <div class="kpi-label">SLA Compliance Rate</div>
            <div class="kpi-trend">↑ 4.2% vs last year</div>
          </div>
          <div class="kpi-card purple">
            <div class="kpi-icon">👥</div>
            <div class="kpi-num">1,24,892</div>
            <div class="kpi-label">Registered Citizens</div>
            <div class="kpi-trend">↑ 8,200 this quarter</div>
          </div>
          <div class="kpi-card orange">
            <div class="kpi-icon">👮</div>
            <div class="kpi-num">{{ officers.length }}</div>
            <div class="kpi-label">Active Officers</div>
            <div class="kpi-trend">Across {{ departments.length }} departments</div>
          </div>
          <div class="kpi-card red">
            <div class="kpi-icon">🚨</div>
            <div class="kpi-num">47</div>
            <div class="kpi-label">SLA Breaches (Month)</div>
            <div class="kpi-trend">↓ 18% vs last month</div>
          </div>
          <div class="kpi-card cyan">
            <div class="kpi-icon">⭐</div>
            <div class="kpi-num">4.6/5</div>
            <div class="kpi-label">Avg. Citizen Rating</div>
            <div class="kpi-trend">Based on 22,410 ratings</div>
          </div>
        </div>

        <div class="admin-grid">
          <!-- Department Performance -->
          <div class="dept-panel">
            <div class="panel-header-row">
              <h3>Department Performance</h3>
              <button class="btn btn-outline btn-sm">View Full Report</button>
            </div>

            <div class="dept-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Head</th>
                    <th>Total</th>
                    <th>Resolved</th>
                    <th>Pending</th>
                    <th>Avg Days</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of departments">
                    <td><strong>{{ d.name }}</strong></td>
                    <td>{{ d.head }}</td>
                    <td>{{ d.totalComplaints.toLocaleString() }}</td>
                    <td style="color: var(--secondary); font-weight:600;">{{ d.resolved.toLocaleString() }}</td>
                    <td style="color: var(--warning);">{{ d.pending.toLocaleString() }}</td>
                    <td>{{ d.avgResolutionDays }}d</td>
                    <td>
                      <div class="rate-bar-wrapper">
                        <div class="rate-bar">
                          <div class="rate-fill" [style.width.%]="getRate(d)" [class]="getRateClass(d)"></div>
                        </div>
                        <span class="rate-pct">{{ getRate(d) }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column -->
          <div class="admin-right">
            <!-- Officers Table -->
            <div class="card" style="margin-bottom:16px;">
              <div class="card-header">
                <h4>Field Officers</h4>
                <button class="btn btn-primary btn-sm">+ Add</button>
              </div>
              <div style="overflow-x:auto;">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Dept.</th>
                      <th>Open</th>
                      <th>Done</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let o of officers">
                      <td>
                        <div class="officer-cell">
                          <div class="oc-avatar">{{ o.name[0] }}</div>
                          <div>
                            <div class="oc-name">{{ o.name }}</div>
                            <div class="oc-id">{{ o.employeeId }}</div>
                          </div>
                        </div>
                      </td>
                      <td><span class="dept-chip">{{ o.department.split(' ')[0] }}</span></td>
                      <td>{{ o.assignedComplaints }}</td>
                      <td style="color:var(--secondary);font-weight:600;">{{ o.resolvedComplaints }}</td>
                      <td>
                        <span class="status-dot" [class.active]="o.isActive" [class.inactive]="!o.isActive">
                          {{ o.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions-card">
              <h4>⚡ Quick Actions</h4>
              <div class="qa-list">
                <button class="qa-item">
                  <span class="qa-icon">📢</span>
                  <div class="qa-text">
                    <div>Broadcast Notice</div>
                    <small>Send notice to all citizens</small>
                  </div>
                </button>
                <button class="qa-item">
                  <span class="qa-icon">🔄</span>
                  <div class="qa-text">
                    <div>Reassign Complaints</div>
                    <small>Bulk reassign by dept/ward</small>
                  </div>
                </button>
                <button class="qa-item">
                  <span class="qa-icon">⚠️</span>
                  <div class="qa-text">
                    <div>Escalate SLA Breaches</div>
                    <small>47 complaints near breach</small>
                  </div>
                </button>
                <button class="qa-item">
                  <span class="qa-icon">📊</span>
                  <div class="qa-text">
                    <div>Generate Monthly Report</div>
                    <small>PDF report for March 2024</small>
                  </div>
                </button>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="card" style="margin-top:16px;">
              <div class="card-header">
                <h4>Recent System Activity</h4>
              </div>
              <div class="activity-list">
                <div *ngFor="let a of activities" class="activity-item">
                  <div class="act-icon">{{ a.icon }}</div>
                  <div class="act-content">
                    <div class="act-msg">{{ a.msg }}</div>
                    <div class="act-time">{{ a.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 24px; gap: 16px;
      .ah-greeting { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--secondary); margin-bottom: 4px; }
      h2 { margin-bottom: 4px; }
      p  { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
      .ah-actions { display: flex; gap: 10px; flex-shrink: 0; }
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 24px;

      @media (max-width: 1200px) { grid-template-columns: repeat(4,1fr); }
      @media (max-width: 900px)  { grid-template-columns: repeat(2,1fr); }
      @media (max-width: 480px)  { grid-template-columns: 1fr; }
    }

    .kpi-card {
      background: white; border-radius: var(--radius-md);
      border: 1px solid var(--border); padding: 20px 18px;
      position: relative; overflow: hidden; transition: all 0.2s;

      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

      &::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 3px;
      }

      &.blue   ::before, &.blue   { border-top: 3px solid var(--primary); }
      &.green  { border-top: 3px solid var(--secondary); }
      &.yellow { border-top: 3px solid #f59e0b; }
      &.teal   { border-top: 3px solid #0891b2; }
      &.purple { border-top: 3px solid #7c3aed; }
      &.orange { border-top: 3px solid #ea580c; }
      &.red    { border-top: 3px solid var(--danger); }
      &.cyan   { border-top: 3px solid #06b6d4; }

      .kpi-icon { font-size: 1.5rem; margin-bottom: 8px; }
      .kpi-num  { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); line-height: 1; margin-bottom: 4px; }
      .kpi-label { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
      .kpi-trend { font-size: 0.72rem; color: #059669; font-weight: 600; }
    }

    .admin-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 20px;
      align-items: flex-start;

      @media (max-width: 1150px) { grid-template-columns: 1fr; }
    }

    .dept-panel {
      background: white; border-radius: var(--radius-md);
      border: 1px solid var(--border); overflow: hidden;

      .panel-header-row {
        padding: 16px 20px; border-bottom: 1px solid var(--border);
        display: flex; align-items: center; justify-content: space-between;
        h3 { font-size: 1rem; margin: 0; }
      }

      .dept-table-wrapper { overflow-x: auto; }
    }

    .rate-bar-wrapper {
      display: flex; align-items: center; gap: 8px;
      .rate-bar {
        flex: 1; height: 6px; background: var(--border);
        border-radius: 6px; overflow: hidden;
        .rate-fill {
          height: 100%; border-radius: 6px; transition: width 0.3s;
          &.high   { background: var(--secondary); }
          &.medium { background: #f59e0b; }
          &.low    { background: var(--danger); }
        }
      }
      .rate-pct { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); white-space: nowrap; }
    }

    .officer-cell {
      display: flex; align-items: center; gap: 8px;
      .oc-avatar {
        width: 28px; height: 28px; border-radius: 50%;
        background: var(--primary); color: white;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
      }
      .oc-name { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
      .oc-id   { font-size: 0.65rem; color: var(--text-muted); font-family: monospace; }
    }

    .dept-chip {
      font-size: 0.68rem; font-weight: 700;
      background: #e8f4fd; color: var(--primary);
      padding: 2px 8px; border-radius: 20px;
    }

    .status-dot {
      font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 20px;
      &.active   { background: #d1fae5; color: #065f46; }
      &.inactive { background: #fee2e2; color: #991b1b; }
    }

    .quick-actions-card {
      background: white; border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 20px;
      h4 { font-size: 0.95rem; margin-bottom: 14px; }
      .qa-list { display: flex; flex-direction: column; gap: 8px; }
      .qa-item {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 14px; border: 1.5px solid var(--border);
        border-radius: var(--radius); background: white;
        cursor: pointer; text-align: left; font-family: var(--font);
        transition: all 0.15s;
        &:hover { border-color: var(--primary); background: #f0f4ff; }
        .qa-icon { font-size: 1.2rem; flex-shrink: 0; }
        .qa-text {
          div  { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
          small { font-size: 0.72rem; color: var(--text-muted); }
        }
      }
    }

    .activity-list { display: flex; flex-direction: column; }

    .activity-item {
      display: flex; gap: 12px; padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      &:last-child { border: none; }
      .act-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
      .act-msg  { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 2px; }
      .act-time { font-size: 0.72rem; color: var(--text-light); }
    }

    .logout-btn {
      background: none; border: none; width: 100%;
      text-align: left; color: rgba(255,255,255,0.75);
      cursor: pointer; font-family: var(--font); font-size: 0.875rem;
    }
  `]
})
export class AdminDashboardComponent {
  complaints: ComplaintResponse[] = [];
  departments = this.mockData.departments;
  officers    = this.mockData.officers;

  get totalComplaints() {
    return this.complaints.length;
  }

  get pendingComplaints() {
    return this.complaints.filter(c => c.status === 'PENDING');
  }

  get resolvedComplaints() {
    return this.complaints.filter(c => c.status === 'RESOLVED');
  }

  activities = [
    { icon: '✅', msg: 'Complaint GRV-2024-00142 resolved by Anand Verma', time: '5 mins ago' },
    { icon: '➕', msg: 'New citizen registered: Pooja Mehta (Ward 81)', time: '12 mins ago' },
    { icon: '🔄', msg: '5 complaints reassigned to Water Dept. team', time: '28 mins ago' },
    { icon: '⚠️', msg: 'SLA breach alert: GRV-2024-00129 (8 days overdue)', time: '1 hr ago' },
    { icon: '📢', msg: 'System maintenance notice sent to all officers', time: '2 hrs ago' },
    { icon: '📊', msg: 'Monthly report for February generated', time: '3 hrs ago' },
  ];

  constructor(
    public auth: AuthService,
    private mockData: MockDataService,
    private complaintService: ComplaintService
  ) {
    this.complaintService.getAllComplaints().subscribe({
      next: (complaints) => {
        this.complaints = complaints;
      },
      error: (err) => {
        console.error('Unable to load admin complaint stats', err);
        this.complaints = [];
      }
    });
  }

  getRate(d: any): number {
    return Math.round((d.resolved / d.totalComplaints) * 100);
  }

  getRateClass(d: any): string {
    const r = this.getRate(d);
    if (r >= 85) return 'high';
    if (r >= 70) return 'medium';
    return 'low';
  }
}
