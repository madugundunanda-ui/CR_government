import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SupervisorService } from '../../core/services/supervisor.service';
import { ComplaintService, ComplaintResponse } from '../../core/services/complaint.service';
import { environment } from '../../../environments/environment';
import { DepartmentStatsResponse, OfficerPerformanceResponse } from '../../core/models/models';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="app-layout">
    <!-- Supervisor Sidebar -->
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark">CG</div>
        <div class="brand-text">
          <div class="brand-name">CivicConnect</div>
          <div class="brand-sub">Department Head</div>
        </div>
      </div>
      <div class="sidebar-user-block">
        <div class="sub-avatar">{{ initials }}</div>
        <div class="sub-info">
          <div class="sub-name">{{ auth.currentUser()?.name }}</div>
          <div class="sub-role">Supervisor</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-group-label">Workspace</div>
        <a routerLink="/supervisor/dashboard" class="nav-link is-active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Department Console
        </a>
        <button class="nav-link" [class.is-active]="activeTab==='mytasks'" (click)="activeTab='mytasks'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          My Assigned Tasks
          <span *ngIf="myPendingCount>0" style="margin-left:auto;background:#b91c1c;color:white;font-size:0.58rem;font-weight:700;padding:1px 5px;border-radius:10px;">{{ myPendingCount }}</span>
        </button>
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
            <h2>Department Console</h2>
            <p>Manage complaints and officers within your department.</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-ghost btn-sm" (click)="load()">Refresh</button>
            <button class="btn btn-primary btn-sm" (click)="exportCsv()" [disabled]="exporting">
              {{ exporting ? 'Preparing…' : 'Export CSV' }}
            </button>
          </div>
        </div>

        <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
        <div *ngIf="error"      class="alert alert-danger">{{ error }}</div>
        <div *ngIf="loading"    class="loading-row"><div class="spinner"></div></div>

        <ng-container *ngIf="!loading">
          <!-- KPI strip -->
          <div *ngIf="stats" class="kpi-row" style="margin-bottom:16px;">
            <div class="kpi-card kpi-blue">
              <div class="kpi-num">{{ stats.totalComplaints }}</div>
              <div class="kpi-label">Total</div>
            </div>
            <div class="kpi-card kpi-amber">
              <div class="kpi-num">{{ stats.pending }}</div>
              <div class="kpi-label">Pending</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-num">{{ stats.inProgress }}</div>
              <div class="kpi-label">In Progress</div>
            </div>
            <div class="kpi-card kpi-green">
              <div class="kpi-num">{{ stats.resolved + stats.closed }}</div>
              <div class="kpi-label">Resolved</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-num">{{ officerUsers.length }}</div>
              <div class="kpi-label">Officers</div>
            </div>
            <div class="kpi-card kpi-red" *ngIf="stats.slaBreached > 0">
              <div class="kpi-num">{{ stats.slaBreached }}</div>
              <div class="kpi-label">SLA Breach</div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tab-strip">
            <button class="tab-item" [class.active]="activeTab==='complaints'" (click)="activeTab='complaints'">
              Complaints <span class="tab-badge">{{ complaints.length }}</span>
            </button>
            <button class="tab-item" [class.active]="activeTab==='officers'" (click)="activeTab='officers'">
              Officers <span class="tab-badge">{{ officerUsers.length }}</span>
            </button>
            <button class="tab-item" [class.active]="activeTab==='mytasks'" (click)="activeTab='mytasks'">
              My Tasks
              <span class="tab-badge" [class.danger]="myPendingCount>0">{{ myTasks.length }}</span>
            </button>
          </div>

          <!-- ── Complaints Tab ── -->
          <ng-container *ngIf="activeTab==='complaints'">
            <div class="filter-bar">
              <input class="form-control" style="max-width:240px;" [(ngModel)]="complaintSearch" placeholder="Search complaints…" />
              <select class="form-control" style="width:auto;" [(ngModel)]="filterStatus">
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <span class="text-muted" style="font-size:0.75rem;margin-left:auto;">{{ filteredComplaints.length }} record(s)</span>
            </div>

            <div *ngIf="filteredComplaints.length===0" class="empty-state">No complaints match the filter.</div>

            <div *ngIf="filteredComplaints.length>0" class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width:70px;">Ref.</th>
                    <th>Title</th>
                    <th>Citizen</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>SLA Date</th>
                    <th style="text-align:right;min-width:320px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of filteredComplaints">
                    <td style="font-size:0.7rem;font-weight:700;color:var(--text-500);">GRV-{{ c.id }}</td>
                    <td>
                      <div style="font-size:0.8rem;font-weight:600;color:var(--text-900);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ c.title }}</div>
                    </td>
                    <td style="font-size:0.78rem;color:var(--text-500);">{{ c.citizenName }}</td>
                    <td><span class="badge badge-{{ c.priority }}">{{ c.priority }}</span></td>
                    <td><span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span></td>
                    <td style="font-size:0.78rem;">{{ c.assignedOfficerName || '—' }}</td>
                    <td style="font-size:0.72rem;" [class.text-danger]="isSlaBreached(c)" [class.fw-600]="isSlaBreached(c)">
                      {{ c.slaDeadline ? (c.slaDeadline | date:'dd/MM/yy') : '—' }}
                    </td>
                    <td style="text-align:right;">
                      <div style="display:flex;gap:6px;justify-content:flex-end;align-items:center;">
                        <select class="form-control" [(ngModel)]="assignSelection[c.id]"
                          style="width:auto;min-width:130px;font-size:0.72rem;padding:4px 8px;">
                          <option [ngValue]="null">Assign officer…</option>
                          <option *ngFor="let o of officers" [ngValue]="o.officerId">{{ o.officerName }}</option>
                        </select>
                        <button class="btn btn-ghost btn-xs" (click)="reassign(c)" [disabled]="!assignSelection[c.id]">Assign</button>
                        <button class="btn btn-primary btn-xs" (click)="openStatusModal(c)">Status</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="table-footer"><span>{{ filteredComplaints.length }} complaint(s)</span></div>
            </div>
          </ng-container>

          <!-- ── Officers Tab ── -->
          <ng-container *ngIf="activeTab==='officers'">
            <div class="filter-bar">
              <input class="form-control" style="max-width:240px;" [(ngModel)]="officerSearch" placeholder="Search officers…" />
            </div>

            <div *ngIf="filteredOfficerUsers.length===0" class="empty-state">No officers in your department.</div>

            <div *ngIf="filteredOfficerUsers.length>0" class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Officer</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th style="text-align:right;">Assigned</th>
                    <th style="text-align:right;">Resolved</th>
                    <th style="text-align:right;">SLA%</th>
                    <th style="text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of filteredOfficerUsers">
                    <td>
                      <div style="display:flex;align-items:center;gap:8px;">
                        <div class="user-avatar" style="font-size:0.68rem;">{{ u.name[0] }}</div>
                        <div>
                          <div style="font-size:0.8rem;font-weight:600;color:var(--text-900);">{{ u.name }}</div>
                        </div>
                      </div>
                    </td>
                    <td style="font-size:0.78rem;color:var(--text-500);">{{ u.email }}</td>
                    <td style="font-size:0.78rem;">{{ u.contactNumber || '—' }}</td>
                    <td style="text-align:right;font-size:0.8rem;font-weight:600;">{{ getOfficerPerf(u.id)?.totalAssigned || 0 }}</td>
                    <td style="text-align:right;font-size:0.8rem;font-weight:600;" class="text-success">{{ (getOfficerPerf(u.id)?.resolved || 0) + (getOfficerPerf(u.id)?.closed || 0) }}</td>
                    <td style="text-align:right;">
                      <span style="font-size:0.78rem;font-weight:700;"
                        [style.color]="(getOfficerPerf(u.id)?.slaCompliancePct ?? 100) < 80 ? 'var(--danger)' : 'var(--success)'">
                        {{ getOfficerPerf(u.id)?.slaCompliancePct ?? 100 }}%
                      </span>
                    </td>
                    <td style="text-align:right;">
                      <button class="btn btn-ghost btn-xs" (click)="openOfficerEdit(u)" id="sv-edit-{{ u.id }}">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ng-container>

          <!-- ── My Tasks Tab ── -->
          <ng-container *ngIf="activeTab==='mytasks'">
            <div *ngIf="myTasks.length===0" class="empty-state">No complaints are currently assigned to you personally.</div>
            <div *ngIf="myTasks.length>0" class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width:70px;">Ref.</th>
                    <th>Title</th>
                    <th>Citizen</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>SLA Date</th>
                    <th style="text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of myTasks">
                    <td style="font-size:0.7rem;font-weight:700;color:var(--text-500);">GRV-{{ c.id }}</td>
                    <td>
                      <div style="font-size:0.8rem;font-weight:600;color:var(--text-900);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ c.title }}</div>
                      <div style="font-size:0.67rem;color:var(--text-500);">{{ c.category || 'General' }}</div>
                    </td>
                    <td style="font-size:0.78rem;color:var(--text-500);">{{ c.citizenName }}</td>
                    <td><span class="badge badge-{{ c.priority }}">{{ c.priority }}</span></td>
                    <td><span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span></td>
                    <td style="font-size:0.72rem;" [class.text-danger]="isSlaBreached(c)" [class.fw-600]="isSlaBreached(c)">
                      {{ c.slaDeadline ? (c.slaDeadline | date:'dd/MM/yy') : '—' }}
                    </td>
                    <td style="text-align:right;">
                      <button *ngIf="c.status==='ASSIGNED' || c.status==='PENDING'"
                        class="btn btn-secondary btn-xs" (click)="changeMyTaskStatus(c,'IN_PROGRESS')">Start</button>
                      <button *ngIf="c.status==='IN_PROGRESS'"
                        class="btn btn-primary btn-xs" (click)="changeMyTaskStatus(c,'RESOLVED')">Resolve</button>
                      <span *ngIf="c.status==='RESOLVED' || c.status==='CLOSED'"
                        style="font-size:0.72rem;color:var(--success);font-weight:600;">Done</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="table-footer"><span>{{ myTasks.length }} task(s)</span></div>
            </div>
          </ng-container>
        </ng-container>
      </div>
    </div>
  </div>

  <!-- ── Status Update Modal ── -->
  <div class="modal-overlay" *ngIf="statusModalComplaint" (click)="closeStatusModal()">
    <div class="modal-box modal-sm" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h4>Update Status — GRV-{{ statusModalComplaint?.id }}</h4>
        <button class="modal-close-btn" (click)="closeStatusModal()">&#215;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>New Status <span class="required">*</span></label>
          <select class="form-control" [(ngModel)]="statusEdit">
            <option value="">— Select —</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div class="form-group">
          <label>Remarks <span style="font-weight:400;color:var(--text-500);">(optional)</span></label>
          <textarea class="form-control" [(ngModel)]="statusRemarks" rows="3" placeholder="Notes about this status change…"></textarea>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost btn-sm" (click)="closeStatusModal()" [disabled]="saving">Cancel</button>
        <button class="btn btn-primary btn-sm" (click)="submitStatusUpdate()" [disabled]="saving || !statusEdit">
          {{ saving ? 'Updating…' : 'Update Status' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ── Edit Officer Modal ── -->
  <div class="modal-overlay" *ngIf="editingOfficer" (click)="cancelOfficerEdit()">
    <div class="modal-box" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h4>Edit Officer — {{ editingOfficer.name }}</h4>
        <button class="modal-close-btn" (click)="cancelOfficerEdit()">&#215;</button>
      </div>
      <div class="modal-body">
        <div class="form-grid-2">
          <div class="form-group">
            <label>Full Name <span class="required">*</span></label>
            <input class="form-control" [(ngModel)]="officerEdit.name" />
          </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input class="form-control" [(ngModel)]="officerEdit.email" type="email" />
          </div>
          <div class="form-group span-2">
            <label>Contact Number</label>
            <input class="form-control" [(ngModel)]="officerEdit.contactNumber" />
          </div>
          <div class="form-group span-2">
            <label>Address</label>
            <textarea class="form-control" [(ngModel)]="officerEdit.address" rows="2"></textarea>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost btn-sm" (click)="cancelOfficerEdit()" [disabled]="saving">Cancel</button>
        <button class="btn btn-primary btn-sm" (click)="saveOfficerEdit()" [disabled]="saving">
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
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
export class SupervisorDashboardComponent implements OnInit {
  loading = false;
  error = '';
  successMsg = '';
  saving = false;
  exporting = false;
  activeTab = 'complaints';

  stats: DepartmentStatsResponse | null = null;
  complaints: ComplaintResponse[] = [];
  myTasks: ComplaintResponse[] = [];
  officers: OfficerPerformanceResponse[] = [];
  officerUsers: UserResponse[] = [];

  complaintSearch = '';
  filterStatus = '';
  officerSearch = '';
  assignSelection: Record<number, number | null> = {};

  statusModalComplaint: ComplaintResponse | null = null;
  statusEdit = '';
  statusRemarks = '';

  editingOfficer: UserResponse | null = null;
  officerEdit: { name: string; email: string; contactNumber?: string; address?: string } = { name: '', email: '' };

  get initials(): string {
    return (this.auth.currentUser()?.name ?? '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'S';
  }

  constructor(
    public auth: AuthService,
    private supervisorService: SupervisorService,
    private userService: UserService,
    private complaintService: ComplaintService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      stats:       this.supervisorService.getDepartmentStats(),
      officers:    this.supervisorService.getDepartmentOfficers(),
      officerUsers:this.supervisorService.getDepartmentOfficerUsers(),
      complaints:  this.supervisorService.getDepartmentComplaints(),
      myTasks:     this.complaintService.getMyTasks(),
    }).subscribe({
      next: ({ stats, officers, officerUsers, complaints, myTasks }) => {
        this.stats = stats;
        this.officers = officers;
        this.officerUsers = officerUsers;
        this.complaints = complaints;
        this.myTasks = myTasks;
        for (const c of complaints) {
          this.assignSelection[c.id] = c.assignedOfficerId ?? null;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load department data.';
        this.loading = false;
      }
    });
  }

  get filteredComplaints(): ComplaintResponse[] {
    let list = this.complaints;
    if (this.filterStatus) list = list.filter(c => c.status === this.filterStatus);
    if (this.complaintSearch) {
      const q = this.complaintSearch.toLowerCase();
      list = list.filter(c => c.title?.toLowerCase().includes(q) || c.citizenName?.toLowerCase().includes(q));
    }
    return list;
  }

  get filteredOfficerUsers(): UserResponse[] {
    if (!this.officerSearch) return this.officerUsers;
    const q = this.officerSearch.toLowerCase();
    return this.officerUsers.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  getOfficerPerf(userId: number): OfficerPerformanceResponse | undefined {
    return this.officers.find(o => o.officerId === userId);
  }

  isSlaBreached(c: ComplaintResponse): boolean {
    return !!c.slaDeadline && c.status !== 'RESOLVED' && c.status !== 'CLOSED' && new Date(c.slaDeadline) < new Date();
  }

  get myPendingCount(): number {
    return this.myTasks.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED').length;
  }

  changeMyTaskStatus(c: ComplaintResponse, status: string): void {
    this.complaintService.updateTaskStatus(c.id, status).subscribe({
      next: (updated) => {
        const idx = this.myTasks.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.myTasks[idx] = updated;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Status update failed.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  reassign(c: ComplaintResponse): void {
    const officerId = this.assignSelection[c.id];
    if (!officerId) return;
    this.supervisorService.reassignComplaint(c.id, officerId).subscribe({
      next: () => {
        this.successMsg = 'Complaint reassigned.';
        setTimeout(() => this.successMsg = '', 3000);
        // Partial reload: just reload complaints
        this.supervisorService.getDepartmentComplaints().subscribe({ next: list => this.complaints = list });
      },
      error: (err) => { this.error = err?.error?.message || 'Reassignment failed.'; setTimeout(() => this.error = '', 4000); }
    });
  }

  openStatusModal(c: ComplaintResponse): void { this.statusModalComplaint = c; this.statusEdit = ''; this.statusRemarks = ''; }
  closeStatusModal(): void { this.statusModalComplaint = null; this.statusEdit = ''; this.statusRemarks = ''; }

  submitStatusUpdate(): void {
    if (!this.statusModalComplaint || !this.statusEdit) return;
    this.saving = true;
    this.supervisorService.updateStatus(this.statusModalComplaint.id, this.statusEdit, this.statusRemarks || undefined).subscribe({
      next: () => {
        this.saving = false;
        this.closeStatusModal();
        this.successMsg = 'Status updated.';
        setTimeout(() => this.successMsg = '', 3000);
        // In-place update — reload only complaints
        this.supervisorService.getDepartmentComplaints().subscribe({ next: list => this.complaints = list });
        this.supervisorService.getDepartmentStats().subscribe({ next: s => this.stats = s });
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'Failed to update status.';
        setTimeout(() => this.error = '', 4000);
      }
    });
  }

  formatStatus(s: string): string { return ComplaintService.formatStatus(s); }

  openOfficerEdit(user: UserResponse): void {
    this.editingOfficer = user;
    this.officerEdit = { name: user.name, email: user.email, contactNumber: user.contactNumber, address: user.address };
  }
  cancelOfficerEdit(): void { this.editingOfficer = null; this.officerEdit = { name: '', email: '' }; }

  saveOfficerEdit(): void {
    if (!this.editingOfficer) return;
    this.saving = true;
    this.userService.updateOfficerBySupervisor(this.editingOfficer.id, this.officerEdit).subscribe({
      next: (updated) => {
        this.saving = false;
        const idx = this.officerUsers.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.officerUsers[idx] = updated;
        this.cancelOfficerEdit();
        this.successMsg = 'Officer updated.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'Failed to update officer.';
        setTimeout(() => this.error = '', 4000);
      }
    });
  }

  exportCsv(): void {
    this.exporting = true;
    const token = this.auth.getToken();
    fetch(this.supervisorService.getExportCsvUrl(), { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.blob(); })
      .then(blob => {
        const a = document.createElement('a'); a.href = window.URL.createObjectURL(blob);
        a.download = 'department_complaints.csv'; document.body.appendChild(a); a.click(); a.remove();
        this.exporting = false;
      })
      .catch(() => { this.exporting = false; this.error = 'Export failed.'; setTimeout(() => this.error = '', 4000); });
  }
}
