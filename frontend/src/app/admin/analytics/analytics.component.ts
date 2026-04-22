import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ComplaintService } from '../../core/services/complaint.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';
import { AdminService } from '../../core/services/admin.service';
import { ComplaintStatsResponse, DepartmentStatsResponse, OfficerPerformanceResponse } from '../../core/models/models';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

function pct(val: number, total: number): number {
  return total === 0 ? 0 : Math.round((val / total) * 100);
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminLayoutComponent],
  template: `
  <app-admin-layout active="analytics">
    <div class="page-wrap">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Analytics &amp; Reports</h2>
          <p>Live complaint resolution KPIs, department performance and priority breakdown.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-ghost btn-sm" (click)="load()" [disabled]="loading">Refresh</button>
          <button class="btn btn-primary btn-sm" (click)="exportCsv()" [disabled]="exporting">
            {{ exporting ? 'Preparing…' : 'Export CSV' }}
          </button>
        </div>
      </div>

      <div *ngIf="exportMsg" class="alert alert-success">{{ exportMsg }}</div>
      <div *ngIf="error"     class="alert alert-danger">{{ error }}</div>
      <div *ngIf="loading"   class="loading-row"><div class="spinner"></div></div>

      <ng-container *ngIf="!loading && stats">
        <!-- KPI Row -->
        <div class="kpi-row" style="margin-bottom:20px;">
          <div class="kpi-card kpi-blue">
            <div class="kpi-num">{{ stats.total }}</div>
            <div class="kpi-label">Total Complaints</div>
          </div>
          <div class="kpi-card kpi-green">
            <div class="kpi-num">{{ stats.resolved + stats.closed }}</div>
            <div class="kpi-label">Resolved / Closed</div>
            <div style="font-size:0.68rem;color:var(--success);font-weight:600;margin-top:4px;">{{ resolutionRate }}% rate</div>
          </div>
          <div class="kpi-card kpi-amber">
            <div class="kpi-num">{{ stats.pending }}</div>
            <div class="kpi-label">Pending</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-num">{{ stats.inProgress }}</div>
            <div class="kpi-label">In Progress</div>
          </div>
          <div class="kpi-card kpi-red">
            <div class="kpi-num">{{ stats.highPriority + stats.urgentPriority }}</div>
            <div class="kpi-label">High / Urgent</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-num">{{ stats.totalOfficers }}</div>
            <div class="kpi-label">Active Officers</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-num">{{ stats.totalCitizens }}</div>
            <div class="kpi-label">Registered Citizens</div>
          </div>
        </div>

        <!-- Charts row (pure CSS bar charts) -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">

          <!-- Status Distribution -->
          <div class="panel">
            <div class="panel-head"><h3>Status Distribution</h3></div>
            <div class="panel-body">
              <div *ngFor="let s of statusBars" style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <span style="font-size:0.72rem;font-weight:600;color:var(--text-700);">{{ s.label }}</span>
                  <span style="font-size:0.72rem;color:var(--text-500);">{{ s.count }} ({{ s.pct }}%)</span>
                </div>
                <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
                  <div [style.width.%]="s.pct" [style.background]="s.color" style="height:100%;border-radius:3px;transition:width 0.4s;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Priority Breakdown -->
          <div class="panel">
            <div class="panel-head"><h3>Priority Breakdown</h3></div>
            <div class="panel-body">
              <div *ngFor="let p of priorityBars" style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <span style="font-size:0.72rem;font-weight:600;color:var(--text-700);">{{ p.label }}</span>
                  <span style="font-size:0.72rem;color:var(--text-500);">{{ p.count }} ({{ p.pct }}%)</span>
                </div>
                <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
                  <div [style.width.%]="p.pct" [style.background]="p.color" style="height:100%;border-radius:3px;transition:width 0.4s;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Department Performance Table -->
        <div class="panel" style="margin-bottom:16px;">
          <div class="panel-head"><h3>Department Performance</h3></div>
          <div class="table-container" style="border:none;border-radius:0;">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Head / Supervisor</th>
                  <th style="text-align:right;">Total</th>
                  <th style="text-align:right;">Resolved</th>
                  <th style="text-align:right;">Pending</th>
                  <th style="text-align:right;">In Progress</th>
                  <th style="text-align:right;">SLA Breach</th>
                  <th style="min-width:130px;">Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of deptStats">
                  <td class="fw-600" style="font-size:0.8rem;">{{ d.departmentName }}</td>
                  <td style="font-size:0.75rem;color:var(--text-500);">{{ d.headName || '—' }}</td>
                  <td style="text-align:right;font-size:0.8rem;">{{ d.totalComplaints }}</td>
                  <td style="text-align:right;font-size:0.8rem;" class="text-success fw-600">{{ d.resolved + d.closed }}</td>
                  <td style="text-align:right;font-size:0.8rem;">{{ d.pending }}</td>
                  <td style="text-align:right;font-size:0.8rem;">{{ d.inProgress }}</td>
                  <td style="text-align:right;font-size:0.8rem;" [class.text-danger]="d.slaBreached > 0" [class.fw-600]="d.slaBreached > 0">{{ d.slaBreached }}</td>
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
                  <td colspan="8" class="text-muted" style="text-align:center;padding:20px;font-size:0.8rem;">No department data available.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Officer Performance Table -->
        <div class="panel">
          <div class="panel-head">
            <h3>Officer Performance</h3>
            <a routerLink="/admin/officers" class="btn btn-ghost btn-xs">Manage Officers</a>
          </div>
          <div class="table-container" style="border:none;border-radius:0;">
            <table>
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Department</th>
                  <th style="text-align:right;">Assigned</th>
                  <th style="text-align:right;">In Progress</th>
                  <th style="text-align:right;">Resolved</th>
                  <th style="text-align:right;">SLA Compliance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let o of officerPerf">
                  <td>
                    <div style="display:flex;align-items:center;gap:7px;">
                      <div class="user-avatar" style="width:26px;height:26px;font-size:0.62rem;">{{ o.officerName[0] }}</div>
                      <div>
                        <div style="font-size:0.8rem;font-weight:600;color:var(--text-900);">{{ o.officerName }}</div>
                        <div style="font-size:0.67rem;color:var(--text-500);">{{ o.officerEmail }}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-size:0.75rem;color:var(--text-500);">{{ o.departmentName || '—' }}</td>
                  <td style="text-align:right;font-size:0.8rem;">{{ o.totalAssigned }}</td>
                  <td style="text-align:right;font-size:0.8rem;">{{ o.inProgress }}</td>
                  <td style="text-align:right;font-size:0.8rem;" class="text-success fw-600">{{ o.resolved + o.closed }}</td>
                  <td style="text-align:right;">
                    <span style="font-size:0.78rem;font-weight:700;"
                      [style.color]="o.slaCompliancePct >= 85 ? 'var(--success)' : o.slaCompliancePct >= 70 ? 'var(--warning)' : 'var(--danger)'">
                      {{ o.slaCompliancePct }}%
                    </span>
                  </td>
                </tr>
                <tr *ngIf="officerPerf.length === 0">
                  <td colspan="6" class="text-muted" style="text-align:center;padding:20px;font-size:0.8rem;">No officer data available.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  </app-admin-layout>
  `
})
export class AnalyticsComponent implements OnInit {
  stats: ComplaintStatsResponse | null = null;
  deptStats: DepartmentStatsResponse[] = [];
  officerPerf: OfficerPerformanceResponse[] = [];
  loading = false;
  error = '';
  exporting = false;
  exportMsg = '';

  constructor(
    public auth: AuthService,
    private complaintService: ComplaintService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      stats:   this.complaintService.getStats(),
      dept:    this.adminService.getDepartmentStats(),
      officers: this.adminService.getOfficerPerformance(),
    }).subscribe({
      next: ({ stats, dept, officers }) => {
        this.stats = stats;
        this.deptStats = dept;
        this.officerPerf = officers;
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load analytics data.'; this.loading = false; }
    });
  }

  exportCsv(): void {
    this.exporting = true;
    const token = localStorage.getItem('civic_jwt_token');
    fetch(`${environment.apiUrl}/admin/reports/export-csv`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        this.exporting = false;
        this.exportMsg = 'CSV downloaded.';
        setTimeout(() => this.exportMsg = '', 3000);
      })
      .catch(() => { this.exporting = false; this.error = 'Export failed.'; });
  }

  get resolutionRate(): number {
    if (!this.stats || this.stats.total === 0) return 0;
    return Math.round(((this.stats.resolved + this.stats.closed) / this.stats.total) * 100);
  }

  get statusBars() {
    if (!this.stats) return [];
    const t = this.stats.total || 1;
    return [
      { label: 'Pending',     count: this.stats.pending,    pct: pct(this.stats.pending,    t), color: '#f59e0b' },
      { label: 'Assigned',    count: this.stats.assigned,   pct: pct(this.stats.assigned,   t), color: '#3b82f6' },
      { label: 'In Progress', count: this.stats.inProgress, pct: pct(this.stats.inProgress, t), color: '#8b5cf6' },
      { label: 'Resolved',    count: this.stats.resolved,   pct: pct(this.stats.resolved,   t), color: '#15803d' },
      { label: 'Closed',      count: this.stats.closed,     pct: pct(this.stats.closed,     t), color: '#6b7280' },
    ];
  }

  get priorityBars() {
    if (!this.stats) return [];
    const t = this.stats.total || 1;
    return [
      { label: 'Urgent', count: this.stats.urgentPriority, pct: pct(this.stats.urgentPriority, t), color: '#7c3aed' },
      { label: 'High',   count: this.stats.highPriority,   pct: pct(this.stats.highPriority,   t), color: '#ef4444' },
      { label: 'Medium', count: t - this.stats.highPriority - this.stats.urgentPriority,
        pct: pct(t - this.stats.highPriority - this.stats.urgentPriority, t), color: '#f59e0b' },
    ];
  }
}