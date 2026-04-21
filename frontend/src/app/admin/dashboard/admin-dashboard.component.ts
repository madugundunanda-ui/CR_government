import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintService } from '../../core/services/complaint.service';
import { AdminService } from '../../core/services/admin.service';
import { ComplaintStatsResponse, DepartmentStatsResponse, OfficerPerformanceResponse } from '../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-user">
          <div class="avatar" style="background: #e9c46a; color: #1a2340;">AD</div>
          <div class="user-name">{{ auth.currentUser()?.name }}</div>
          <div class="user-role">System Administrator</div>
        </div>
        <nav class="nav-menu">
          <div class="nav-section-title">Overview</div>
          <a routerLink="/admin/dashboard" class="nav-item active">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="/admin/all-complaints" class="nav-item">
            <span class="nav-icon">📋</span> All Complaints
            <span class="badge-count">{{ stats?.total || 0 }}</span>
          </a>
          <a routerLink="/admin/citizens" class="nav-item">
            <span class="nav-icon">👥</span> Citizens
          </a>
          <a routerLink="/admin/officers" class="nav-item">
            <span class="nav-icon">👮</span> Officers
          </a>
          <div class="nav-section-title">Management</div>
          <a routerLink="/admin/departments" class="nav-item">
            <span class="nav-icon">🏢</span> Departments
          </a>
          <a routerLink="/admin/notifications" class="nav-item">
            <span class="nav-icon">🔔</span> Notifications
          </a>
          <div class="nav-section-title">Reports</div>
          <a routerLink="/admin/analytics" class="nav-item">
            <span class="nav-icon">📈</span> Analytics
          </a>
          <a routerLink="/admin/audit-logs" class="nav-item">
            <span class="nav-icon">🔒</span> Audit Logs
          </a>
          <div class="nav-section-title">Account</div>
          <a routerLink="/profile" class="nav-item">
            <span class="nav-icon">👤</span> Profile
          </a>
          <button class="nav-item logout-btn" (click)="auth.logout()">
            <span class="nav-icon">🚪</span> Sign Out
          </button>
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
            <a routerLink="/admin/all-complaints" class="btn btn-outline btn-sm">📋 All Complaints</a>
            <a routerLink="/admin/officers" class="btn btn-primary btn-sm">👮 Manage Officers</a>
          </div>
        </div>

        <!-- KPI Stats -->
        <div class="kpi-grid">
          <div class="kpi-card blue">
            <div class="kpi-icon">📋</div>
            <div class="kpi-num">{{ stats?.total || 0 }}</div>
            <div class="kpi-label">Total Complaints</div>
          </div>
          <div class="kpi-card green">
            <div class="kpi-icon">✅</div>
            <div class="kpi-num">{{ (stats?.resolved || 0) + (stats?.closed || 0) }}</div>
            <div class="kpi-label">Resolved</div>
          </div>
          <div class="kpi-card yellow">
            <div class="kpi-icon">⏳</div>
            <div class="kpi-num">{{ stats?.pending || 0 }}</div>
            <div class="kpi-label">Pending</div>
          </div>
          <div class="kpi-card teal">
            <div class="kpi-icon">⚙️</div>
            <div class="kpi-num">{{ stats?.inProgress || 0 }}</div>
            <div class="kpi-label">In Progress</div>
          </div>
          <div class="kpi-card orange">
            <div class="kpi-icon">👮</div>
            <div class="kpi-num">{{ stats?.totalOfficers || 0 }}</div>
            <div class="kpi-label">Active Officers</div>
          </div>
          <div class="kpi-card purple">
            <div class="kpi-icon">👥</div>
            <div class="kpi-num">{{ stats?.totalCitizens || 0 }}</div>
            <div class="kpi-label">Registered Citizens</div>
          </div>
          <div class="kpi-card red">
            <div class="kpi-icon">🚨</div>
            <div class="kpi-num">{{ (stats?.highPriority || 0) + (stats?.urgentPriority || 0) }}</div>
            <div class="kpi-label">High / Urgent</div>
          </div>
          <div class="kpi-card cyan">
            <div class="kpi-icon">🔄</div>
            <div class="kpi-num">{{ stats?.assigned || 0 }}</div>
            <div class="kpi-label">Assigned</div>
          </div>
        </div>

        <div class="admin-grid">
          <!-- Department Performance (LIVE from DB) -->
          <div class="dept-panel">
            <div class="panel-header-row">
              <h3>Department Performance</h3>
              <a routerLink="/admin/analytics" class="btn btn-outline btn-sm">View Full Report</a>
            </div>
            <div class="dept-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Department</th><th>Head</th>
                    <th>Total</th><th>Resolved</th><th>Pending</th>
                    <th>SLA Breach</th><th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of deptStats">
                    <td><strong>{{ d.departmentName }}</strong></td>
                    <td>{{ d.headName || '—' }}</td>
                    <td>{{ d.totalComplaints }}</td>
                    <td style="color:var(--secondary); font-weight:600;">{{ d.resolved + d.closed }}</td>
                    <td style="color:var(--warning);">{{ d.pending }}</td>
                    <td style="color:var(--danger);font-weight:600;">{{ d.slaBreached }}</td>
                    <td>
                      <div class="rate-bar-wrapper">
                        <div class="rate-bar">
                          <div class="rate-fill"
                            [style.width.%]="getRate(d)"
                            [class]="getRateClass(d)"></div>
                        </div>
                        <span class="rate-pct">{{ getRate(d) }}%</span>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="!loading && deptStats.length === 0">
                    <td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">No department data yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column -->
          <div class="admin-right">
            <!-- Officers Performance Table (LIVE) -->
            <div class="card" style="margin-bottom:16px;">
              <div class="card-header">
                <h4>Officer Performance</h4>
                <a routerLink="/admin/officers" class="btn btn-primary btn-sm">Manage</a>
              </div>
              <div style="overflow-x:auto;">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Dept.</th>
                      <th>Total</th><th>Resolved</th><th>SLA%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let o of officerPerf">
                      <td>
                        <div class="officer-cell">
                          <div class="oc-avatar">{{ o.officerName[0] }}</div>
                          <div>
                            <div class="oc-name">{{ o.officerName }}</div>
                            <div class="oc-id">{{ o.officerEmail }}</div>
                          </div>
                        </div>
                      </td>
                      <td><span class="dept-chip">{{ (o.departmentName || 'N/A').split(' ')[0] }}</span></td>
                      <td>{{ o.totalAssigned }}</td>
                      <td style="color:var(--secondary);font-weight:600;">{{ o.resolved + o.closed }}</td>
                      <td>
                        <span [style.color]="o.slaCompliancePct >= 85 ? 'var(--secondary)' : o.slaCompliancePct >= 70 ? '#f59e0b' : 'var(--danger)'" style="font-weight:700;">
                          {{ o.slaCompliancePct }}%
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="officerPerf.length === 0">
                      <td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">No officers yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions-card">
              <h4>⚡ Quick Actions</h4>
              <div class="qa-list">
                <a routerLink="/admin/all-complaints" class="qa-item">
                  <span class="qa-icon">📋</span>
                  <div class="qa-text">
                    <div>View All Complaints</div>
                    <small>Assign officers, update status</small>
                  </div>
                </a>
                <a routerLink="/admin/officers" class="qa-item">
                  <span class="qa-icon">👮</span>
                  <div class="qa-text">
                    <div>Manage Officers</div>
                    <small>Approve pending registrations</small>
                  </div>
                </a>
                <a routerLink="/admin/departments" class="qa-item">
                  <span class="qa-icon">🏢</span>
                  <div class="qa-text">
                    <div>Manage Departments</div>
                    <small>Add, edit, delete departments</small>
                  </div>
                </a>
                <a routerLink="/admin/analytics" class="qa-item">
                  <span class="qa-icon">📊</span>
                  <div class="qa-text">
                    <div>Analytics & Reports</div>
                    <small>Resolution KPIs and trends</small>
                  </div>
                </a>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="card" style="margin-top:16px;">
              <div class="card-header"><h4>Recent System Activity</h4></div>
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
    .admin-header { display:flex; align-items:flex-start; justify-content:space-between;
      margin-bottom:24px; gap:16px;
      .ah-greeting { font-size:0.8rem; font-weight:700; text-transform:uppercase;
        letter-spacing:1px; color:var(--secondary); margin-bottom:4px; }
      h2 { margin-bottom:4px; }
      p  { font-size:0.875rem; color:var(--text-muted); margin:0; }
      .ah-actions { display:flex; gap:10px; flex-shrink:0; } }
    .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px;
      @media (max-width:900px) { grid-template-columns:repeat(2,1fr); }
      @media (max-width:480px) { grid-template-columns:1fr; } }
    .kpi-card { background:white; border-radius:var(--radius-md); border:1px solid var(--border);
      padding:20px 18px; position:relative; overflow:hidden; transition:all 0.2s;
      &:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
      &.blue   { border-top:3px solid var(--primary); }
      &.green  { border-top:3px solid var(--secondary); }
      &.yellow { border-top:3px solid #f59e0b; }
      &.teal   { border-top:3px solid #0891b2; }
      &.purple { border-top:3px solid #7c3aed; }
      &.orange { border-top:3px solid #ea580c; }
      &.red    { border-top:3px solid var(--danger); }
      &.cyan   { border-top:3px solid #06b6d4; }
      .kpi-icon { font-size:1.5rem; margin-bottom:8px; }
      .kpi-num  { font-size:1.6rem; font-weight:800; color:var(--text-primary); line-height:1; margin-bottom:4px; }
      .kpi-label { font-size:0.72rem; color:var(--text-muted); font-weight:600;
        text-transform:uppercase; letter-spacing:0.5px; } }
    .admin-grid { display:grid; grid-template-columns:1fr 340px; gap:20px; align-items:flex-start;
      @media (max-width:1150px) { grid-template-columns:1fr; } }
    .dept-panel { background:white; border-radius:var(--radius-md); border:1px solid var(--border); overflow:hidden;
      .panel-header-row { padding:16px 20px; border-bottom:1px solid var(--border);
        display:flex; align-items:center; justify-content:space-between;
        h3 { font-size:1rem; margin:0; } }
      .dept-table-wrapper { overflow-x:auto; } }
    .rate-bar-wrapper { display:flex; align-items:center; gap:8px;
      .rate-bar { flex:1; height:6px; background:var(--border); border-radius:6px; overflow:hidden;
        .rate-fill { height:100%; border-radius:6px; transition:width 0.3s;
          &.high   { background:var(--secondary); }
          &.medium { background:#f59e0b; }
          &.low    { background:var(--danger); } } }
      .rate-pct { font-size:0.75rem; font-weight:700; color:var(--text-secondary); white-space:nowrap; } }
    .officer-cell { display:flex; align-items:center; gap:8px;
      .oc-avatar { width:28px; height:28px; border-radius:50%; background:var(--primary); color:white;
        display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0; }
      .oc-name { font-size:0.82rem; font-weight:600; color:var(--text-primary); }
      .oc-id   { font-size:0.65rem; color:var(--text-muted); font-family:monospace; } }
    .dept-chip { font-size:0.68rem; font-weight:700; background:#e8f4fd; color:var(--primary); padding:2px 8px; border-radius:20px; }
    .status-dot { font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:20px;
      &.active   { background:#d1fae5; color:#065f46; }
      &.inactive { background:#fee2e2; color:#991b1b; } }
    .quick-actions-card { background:white; border:1px solid var(--border); border-radius:var(--radius-md); padding:20px;
      h4 { font-size:0.95rem; margin-bottom:14px; }
      .qa-list { display:flex; flex-direction:column; gap:8px; }
      .qa-item { display:flex; align-items:center; gap:12px; padding:12px 14px;
        border:1.5px solid var(--border); border-radius:var(--radius); background:white; text-decoration:none;
        cursor:pointer; font-family:var(--font); transition:all 0.15s;
        &:hover { border-color:var(--primary); background:#f0f4ff; }
        .qa-icon { font-size:1.2rem; flex-shrink:0; }
        .qa-text { div { font-size:0.85rem; font-weight:600; color:var(--text-primary); }
          small { font-size:0.72rem; color:var(--text-muted); } } } }
    .activity-list { display:flex; flex-direction:column; }
    .activity-item { display:flex; gap:12px; padding:12px 16px; border-bottom:1px solid var(--border);
      &:last-child { border:none; }
      .act-icon { font-size:1.1rem; flex-shrink:0; margin-top:1px; }
      .act-msg  { font-size:0.82rem; color:var(--text-secondary); margin-bottom:2px; }
      .act-time { font-size:0.72rem; color:var(--text-light); } }
    .logout-btn { background:none; border:none; width:100%; text-align:left;
      color:rgba(255,255,255,0.75); cursor:pointer; font-family:var(--font); font-size:0.875rem; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: ComplaintStatsResponse | null = null;
  deptStats: DepartmentStatsResponse[] = [];
  officerPerf: OfficerPerformanceResponse[] = [];
  loading = true;

  activities = [
    { icon: '✅', msg: 'System operational — all services running', time: 'Just now' },
    { icon: '📊', msg: 'Live stats loaded from database', time: '1 min ago' },
    { icon: '🏢', msg: 'Department analytics refreshed', time: '2 min ago' },
  ];

  constructor(
    public auth: AuthService,
    private complaintService: ComplaintService,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.complaintService.getStats().subscribe({
      next: (s) => { this.stats = s; },
      error: (err) => console.error('Stats load failed', err)
    });
    this.adminService.getDepartmentStats().subscribe({
      next: (d) => { this.deptStats = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.adminService.getOfficerPerformance().subscribe({
      next: (o) => this.officerPerf = o,
      error: () => {}
    });
  }

  getRate(d: DepartmentStatsResponse): number {
    return d.resolutionRatePct;
  }
  getRateClass(d: DepartmentStatsResponse): string {
    const r = d.resolutionRatePct;
    if (r >= 85) return 'high';
    if (r >= 70) return 'medium';
    return 'low';
  }
}