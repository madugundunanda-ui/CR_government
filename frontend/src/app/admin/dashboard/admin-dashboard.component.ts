import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintService } from '../../core/services/complaint.service';
import { AdminService } from '../../core/services/admin.service';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';
import { ComplaintStatsResponse, DepartmentStatsResponse, OfficerPerformanceResponse } from '../../core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, AdminLayoutComponent],
  template: `
  <app-admin-layout active="dashboard">
    <div class="page-wrap">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Dashboard — System Overview</h2>
          <p>Live statistics across all departments and civic complaints.</p>
        </div>
        <div class="page-header-actions">
          <a routerLink="/admin/all-complaints" class="btn btn-primary btn-sm">View All Complaints</a>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-row"><div class="spinner"></div><div style="margin-top:10px;">Loading...</div></div>

      <ng-container *ngIf="!loading">
        <!-- KPI Row — clickable -->
        <div class="kpi-row">
          <a routerLink="/admin/all-complaints" class="kpi-card kpi-blue clickable">
            <div class="kpi-num">{{ stats?.total || 0 }}</div>
            <div class="kpi-label">Total Complaints</div>
          </a>
          <a routerLink="/admin/all-complaints" [queryParams]="{status:'PENDING'}" class="kpi-card kpi-amber clickable">
            <div class="kpi-num">{{ stats?.pending || 0 }}</div>
            <div class="kpi-label">Pending</div>
          </a>
          <a routerLink="/admin/all-complaints" [queryParams]="{status:'ASSIGNED'}" class="kpi-card clickable">
            <div class="kpi-num">{{ stats?.assigned || 0 }}</div>
            <div class="kpi-label">Assigned</div>
          </a>
          <a routerLink="/admin/all-complaints" [queryParams]="{status:'IN_PROGRESS'}" class="kpi-card clickable">
            <div class="kpi-num">{{ stats?.inProgress || 0 }}</div>
            <div class="kpi-label">In Progress</div>
          </a>
          <a routerLink="/admin/all-complaints" [queryParams]="{status:'RESOLVED'}" class="kpi-card kpi-green clickable">
            <div class="kpi-num">{{ (stats?.resolved || 0) + (stats?.closed || 0) }}</div>
            <div class="kpi-label">Resolved / Closed</div>
          </a>
          <a routerLink="/admin/officers" class="kpi-card clickable">
            <div class="kpi-num">{{ stats?.totalOfficers || 0 }}</div>
            <div class="kpi-label">Active Officers</div>
          </a>
          <a routerLink="/admin/citizens" class="kpi-card clickable">
            <div class="kpi-num">{{ stats?.totalCitizens || 0 }}</div>
            <div class="kpi-label">Registered Citizens</div>
          </a>
          <a routerLink="/admin/all-complaints" class="kpi-card kpi-red clickable">
            <div class="kpi-num">{{ (stats?.highPriority || 0) + (stats?.urgentPriority || 0) }}</div>
            <div class="kpi-label">High / Urgent</div>
          </a>
        </div>

        <!-- Main grid -->
        <div class="dash-grid">
          <!-- Department Performance -->
          <div class="panel">
            <div class="panel-head">
              <h3>Department Performance</h3>
              <a routerLink="/admin/analytics" class="btn btn-ghost btn-xs">Full Report</a>
            </div>
            <div class="table-container" style="border:none;border-radius:0;">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Head</th>
                    <th style="text-align:right;">Total</th>
                    <th style="text-align:right;">Resolved</th>
                    <th style="text-align:right;">Pending</th>
                    <th style="text-align:right;">SLA Breach</th>
                    <th style="min-width:120px;">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of deptStats">
                    <td class="fw-600">{{ d.departmentName }}</td>
                    <td class="text-muted">{{ d.headName || '—' }}</td>
                    <td style="text-align:right;">{{ d.totalComplaints }}</td>
                    <td style="text-align:right;" class="text-success fw-600">{{ d.resolved + d.closed }}</td>
                    <td style="text-align:right;">{{ d.pending }}</td>
                    <td style="text-align:right;" [class.text-danger]="d.slaBreached > 0">{{ d.slaBreached }}</td>
                    <td>
                      <div class="rate-cell">
                        <div class="rate-bar">
                          <div class="rate-fill"
                            [class]="d.resolutionRatePct >= 85 ? 'good' : d.resolutionRatePct >= 70 ? 'warn' : 'bad'"
                            [style.width.%]="d.resolutionRatePct"></div>
                        </div>
                        <span class="rate-pct">{{ d.resolutionRatePct }}%</span>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="deptStats.length === 0">
                    <td colspan="7" class="text-muted" style="text-align:center;padding:20px;">No department data yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column -->
          <div>
            <!-- Officer Performance -->
            <div class="panel" style="margin-bottom:12px;">
              <div class="panel-head">
                <h3>Officer Performance</h3>
                <a routerLink="/admin/officers" class="btn btn-ghost btn-xs">Manage</a>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Dept.</th>
                    <th style="text-align:right;">Done</th>
                    <th style="text-align:right;">SLA%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let o of officerPerf | slice:0:8">
                    <td>
                      <div style="display:flex;align-items:center;gap:7px;">
                        <div class="user-avatar" style="width:24px;height:24px;font-size:0.62rem;">{{ o.officerName[0] }}</div>
                        <div>
                          <div style="font-size:0.75rem;font-weight:600;color:var(--text-900);">{{ o.officerName }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style="font-size:0.67rem;background:var(--primary-lt);color:var(--primary);padding:1px 6px;border-radius:3px;font-weight:600;">
                        {{ (o.departmentName || 'N/A').split(' ')[0] }}
                      </span>
                    </td>
                    <td style="text-align:right;font-weight:600;font-size:0.75rem;">{{ o.resolved + o.closed }}</td>
                    <td style="text-align:right;">
                      <span style="font-size:0.75rem;font-weight:700;"
                        [style.color]="o.slaCompliancePct >= 85 ? 'var(--success)' : o.slaCompliancePct >= 70 ? '#b45309' : 'var(--danger)'">
                        {{ o.slaCompliancePct }}%
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="officerPerf.length === 0">
                    <td colspan="4" class="text-muted" style="text-align:center;padding:16px;font-size:0.75rem;">No officers yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Navigation shortcuts -->
            <div class="panel">
              <div class="panel-head"><h3>Quick Navigation</h3></div>
              <div style="padding:10px 12px;">
                <a routerLink="/admin/officers" [queryParams]="{tab:'pending'}" class="quick-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                  Pending Officer Approvals
                </a>
                <a routerLink="/admin/all-complaints" [queryParams]="{priority:'URGENT'}" class="quick-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Urgent / Unassigned Complaints
                </a>
                <a routerLink="/admin/departments" class="quick-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  Manage Departments
                </a>
                <a routerLink="/admin/analytics" class="quick-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  Analytics &amp; Reports
                </a>
                <a routerLink="/admin/audit-logs" class="quick-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Audit Log
                </a>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  </app-admin-layout>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: ComplaintStatsResponse | null = null;
  deptStats: DepartmentStatsResponse[] = [];
  officerPerf: OfficerPerformanceResponse[] = [];
  loading = true;

  constructor(
    public auth: AuthService,
    private complaintService: ComplaintService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    forkJoin({
      stats: this.complaintService.getStats(),
      dept: this.adminService.getDepartmentStats(),
      officers: this.adminService.getOfficerPerformance(),
    }).subscribe({
      next: ({ stats, dept, officers }) => {
        this.stats = stats;
        this.deptStats = dept;
        this.officerPerf = officers;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}