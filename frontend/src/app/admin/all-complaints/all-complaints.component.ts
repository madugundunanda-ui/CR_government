import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComplaintResponse, ComplaintService } from '../../core/services/complaint.service';
import { UserResponse } from '../../core/models/models';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-all-complaints',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminLayoutComponent],
  template: `
  <app-admin-layout active="complaints">
    <div class="page-wrap">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h2>Complaints Management</h2>
          <p>Assign officers, update statuses, and manage civic grievances.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-ghost btn-sm" (click)="loadData()">Refresh</button>
        </div>
      </div>

      <!-- Alerts -->
      <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
      <div *ngIf="error"      class="alert alert-danger">{{ error }}</div>

      <!-- Summary strip -->
      <div class="kpi-row" style="margin-bottom:14px;">
        <div class="kpi-card" [class.kpi-blue]="filterStatus===''" (click)="setFilter('')" style="cursor:pointer;">
          <div class="kpi-num">{{ complaints.length }}</div>
          <div class="kpi-label">Total</div>
        </div>
        <div class="kpi-card" [class.kpi-amber]="filterStatus==='PENDING'" (click)="setFilter('PENDING')" style="cursor:pointer;">
          <div class="kpi-num">{{ count('PENDING') }}</div>
          <div class="kpi-label">Pending</div>
        </div>
        <div class="kpi-card" (click)="setFilter('ASSIGNED')" style="cursor:pointer;" [class.kpi-blue]="filterStatus==='ASSIGNED'">
          <div class="kpi-num">{{ count('ASSIGNED') }}</div>
          <div class="kpi-label">Assigned</div>
        </div>
        <div class="kpi-card" (click)="setFilter('IN_PROGRESS')" style="cursor:pointer;" [class.kpi-amber]="filterStatus==='IN_PROGRESS'">
          <div class="kpi-num">{{ count('IN_PROGRESS') }}</div>
          <div class="kpi-label">In Progress</div>
        </div>
        <div class="kpi-card" [class.kpi-green]="filterStatus==='RESOLVED'" (click)="setFilter('RESOLVED')" style="cursor:pointer;">
          <div class="kpi-num">{{ count('RESOLVED') + count('CLOSED') }}</div>
          <div class="kpi-label">Resolved / Closed</div>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <input class="form-control" style="max-width:240px;" [(ngModel)]="searchQ" placeholder="Search by title, ID or citizen…" />
        <select class="form-control" style="width:auto;" [(ngModel)]="filterStatus">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select class="form-control" style="width:auto;" [(ngModel)]="filterPriority">
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <span class="text-muted" style="font-size:0.75rem;margin-left:auto;">{{ filtered.length }} record(s)</span>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-row"><div class="spinner"></div></div>

      <!-- Table -->
      <div *ngIf="!loading" class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width:72px;">Ref. No.</th>
              <th>Title / Category</th>
              <th>Citizen</th>
              <th>Department</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>SLA Date</th>
              <th>Filed On</th>
              <th style="text-align:right;width:80px;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filtered">
              <td style="font-size:0.7rem;font-weight:700;color:var(--text-500);">GRV-{{ c.id }}</td>
              <td>
                <div style="font-size:0.8rem;font-weight:600;color:var(--text-900);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ c.title }}</div>
                <div style="font-size:0.67rem;color:var(--text-500);">{{ c.category || 'General' }}</div>
              </td>
              <td style="font-size:0.78rem;">{{ c.citizenName }}</td>
              <td style="font-size:0.78rem;color:var(--text-500);">{{ c.departmentName || '—' }}</td>
              <td><span class="badge badge-{{ c.priority }}">{{ c.priority }}</span></td>
              <td><span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span></td>
              <td style="font-size:0.78rem;">
                <span *ngIf="c.assignedOfficerName" class="fw-600 text-success">{{ c.assignedOfficerName }}</span>
                <span *ngIf="!c.assignedOfficerName" class="text-muted">Unassigned</span>
              </td>
              <td style="font-size:0.72rem;"
                [class.text-danger]="isSlaBreached(c)"
                [class.fw-600]="isSlaBreached(c)">
                {{ c.slaDeadline ? (c.slaDeadline | date:'dd/MM/yy') : '—' }}
                <span *ngIf="isSlaBreached(c)" style="font-size:0.62rem;">&nbsp;&#9888;</span>
              </td>
              <td style="font-size:0.72rem;color:var(--text-500);">{{ c.createdAt | date:'dd/MM/yy' }}</td>
              <td style="text-align:right;">
                <button class="btn btn-ghost btn-xs" (click)="openAssign(c)" id="assign-{{ c.id }}">Assign</button>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="10" class="text-muted" style="text-align:center;padding:32px;font-size:0.8rem;">No complaints match the current filters.</td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">
          <span>Showing {{ filtered.length }} of {{ complaints.length }} complaints</span>
        </div>
      </div>
    </div>
  </app-admin-layout>

  <!-- Assign Officer Modal -->
  <div class="modal-overlay" *ngIf="assignTarget" (click)="assignTarget = null">
    <div class="modal-box" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h4>{{ assignTarget!.assignedOfficerName ? 'Reassign Officer' : 'Assign Officer' }} — GRV-{{ assignTarget!.id }}</h4>
        <button class="modal-close-btn" (click)="assignTarget = null">&#215;</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--th-bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:14px;font-size:0.78rem;">
          <div class="fw-600 text-900">{{ assignTarget!.title }}</div>
          <div class="text-muted" style="margin-top:3px;">
            Status: <span class="badge badge-{{ assignTarget!.status }}">{{ formatStatus(assignTarget!.status) }}</span>
            &nbsp; Priority: <span class="badge badge-{{ assignTarget!.priority }}">{{ assignTarget!.priority }}</span>
          </div>
          <div *ngIf="assignTarget!.assignedOfficerName" class="text-muted" style="margin-top:4px;">
            Currently assigned to: <strong>{{ assignTarget!.assignedOfficerName }}</strong>
          </div>
        </div>

        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-500);margin-bottom:8px;">Select Officer</div>

        <div *ngIf="officers.length === 0" class="text-muted" style="font-size:0.78rem;padding:12px 0;">
          No approved officers available. Go to Officers &rarr; approve registrations first.
        </div>

        <div class="officer-select-list">
          <div *ngFor="let o of officers"
            class="officer-row"
            [class.selected]="selectedOfficerId === o.id"
            (click)="selectedOfficerId = o.id">
            <div class="user-avatar" style="width:28px;height:28px;font-size:0.68rem;">{{ o.name[0] }}</div>
            <div>
              <div class="or-name">{{ o.name }}</div>
              <div class="or-email">{{ o.email }}&nbsp;·&nbsp;{{ o.departmentName || 'No dept.' }}</div>
            </div>
            <span *ngIf="selectedOfficerId === o.id" class="or-check">&#10003;</span>
          </div>
        </div>

        <div *ngIf="assignError" class="alert alert-danger" style="margin-top:10px;">{{ assignError }}</div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost btn-sm" (click)="assignTarget = null">Cancel</button>
        <button class="btn btn-primary btn-sm" [disabled]="!selectedOfficerId || assigning" (click)="confirmAssign()">
          {{ assigning ? 'Assigning…' : 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
  `
})
export class AdminAllComplaintsComponent implements OnInit, OnDestroy {
  complaints: ComplaintResponse[] = [];
  officers: UserResponse[] = [];
  loading = false;
  error = '';
  successMsg = '';
  searchQ = '';
  filterStatus = '';
  filterPriority = '';
  assignTarget: ComplaintResponse | null = null;
  selectedOfficerId: number | null = null;
  assigning = false;
  assignError = '';
  private routeSub?: Subscription;

  constructor(
    public auth: AuthService,
    private complaintService: ComplaintService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Honor query-param filters from dashboard links
    this.routeSub = this.route.queryParams.subscribe(p => {
      if (p['status'])   this.filterStatus   = p['status'];
      if (p['priority']) this.filterPriority = p['priority'];
    });
    this.loadData();
  }

  ngOnDestroy(): void { this.routeSub?.unsubscribe(); }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.complaintService.getAllComplaints().subscribe({
      next: (list) => { this.complaints = list; this.loading = false; },
      error: () => { this.error = 'Failed to load complaints.'; this.loading = false; }
    });
    // Load officers for assignment (only approved)
    this.userService.getUsersByRole('OFFICER').subscribe({
      next: (list) => {
        this.userService.getUsersByRole('SUPERVISOR').subscribe({
          next: (sv) => { this.officers = [...list, ...sv].filter(o => o.approved); },
          error: () => { this.officers = list.filter(o => o.approved); }
        });
      },
      error: () => {}
    });
  }

  setFilter(status: string): void { this.filterStatus = status; }

  get filtered(): ComplaintResponse[] {
    return this.complaints.filter(c => {
      const s = !this.filterStatus   || c.status   === this.filterStatus;
      const p = !this.filterPriority || c.priority === this.filterPriority;
      const q = !this.searchQ ||
        c.title.toLowerCase().includes(this.searchQ.toLowerCase()) ||
        String(c.id).includes(this.searchQ) ||
        (c.citizenName || '').toLowerCase().includes(this.searchQ.toLowerCase());
      return s && p && q;
    });
  }

  count(status: string): number { return this.complaints.filter(c => c.status === status).length; }

  isSlaBreached(c: ComplaintResponse): boolean {
    if (!c.slaDeadline || c.status === 'RESOLVED' || c.status === 'CLOSED') return false;
    return new Date(c.slaDeadline) < new Date();
  }

  openAssign(c: ComplaintResponse): void {
    this.assignTarget = c;
    this.selectedOfficerId = c.assignedOfficerId ?? null;
    this.assignError = '';
  }

  confirmAssign(): void {
    if (!this.assignTarget || !this.selectedOfficerId) return;
    this.assigning = true;
    this.assignError = '';
    this.complaintService.assignOfficer(this.assignTarget.id, this.selectedOfficerId).subscribe({
      next: (updated) => {
        const idx = this.complaints.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.complaints[idx] = updated;
        this.assignTarget = null;
        this.assigning = false;
        this.successMsg = 'Officer assigned successfully.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.assignError = err?.error?.message || 'Assignment failed.';
        this.assigning = false;
      }
    });
  }

  formatStatus(s: string): string { return ComplaintService.formatStatus(s); }
}