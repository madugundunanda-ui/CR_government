import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComplaintResponse, ComplaintService } from '../../core/services/complaint.service';
import { UserResponse } from '../../core/models/models';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-all-complaints',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/admin/dashboard">Dashboard</a>
          <span>›</span><span>All Complaints</span>
        </div>
        <h1>All Complaints</h1>
        <p>Manage, assign and update all civic complaints.</p>
      </div>
    </div>

    <div class="container" style="padding-top:28px; padding-bottom:48px;">
      <!-- Summary -->
      <div class="summary-row">
        <div class="summary-card"><div class="summary-num">{{ complaints.length }}</div><div class="summary-label">Total</div></div>
        <div class="summary-card"><div class="summary-num">{{ count('PENDING') }}</div><div class="summary-label">Pending</div></div>
        <div class="summary-card"><div class="summary-num">{{ count('ASSIGNED') }}</div><div class="summary-label">Assigned</div></div>
        <div class="summary-card"><div class="summary-num">{{ count('IN_PROGRESS') }}</div><div class="summary-label">In Progress</div></div>
        <div class="summary-card"><div class="summary-num">{{ count('RESOLVED') + count('CLOSED') }}</div><div class="summary-label">Resolved</div></div>
      </div>

      <!-- Filters -->
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px; align-items:center;">
        <input [(ngModel)]="searchQ" placeholder="Search title or ID..." class="form-control" style="max-width:240px;"/>
        <select [(ngModel)]="filterStatus" class="form-control" style="max-width:160px;">
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select [(ngModel)]="filterPriority" class="form-control" style="max-width:160px;">
          <option value="all">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <button class="btn btn-outline btn-sm" (click)="loadData()">🔄 Refresh</button>
      </div>

      <div *ngIf="loading" style="text-align:center; padding:40px;"><div class="spinner"></div></div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Citizen</th>
              <th>Priority</th><th>Status</th><th>Officer</th>
              <th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filtered">
              <td><code>GRV-{{ c.id }}</code></td>
              <td>
                <div style="font-weight:600; font-size:0.875rem; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  {{ c.title }}
                </div>
                <div style="font-size:0.7rem; color:var(--text-muted);">{{ c.category || 'Others' }}</div>
              </td>
              <td style="font-size:0.82rem;">{{ c.citizenName }}</td>
              <td><span class="badge badge-{{ c.priority }}">{{ c.priority }}</span></td>
              <td>
                <select class="inline-select badge badge-{{ c.status }}"
                  [value]="c.status"
                  (change)="onStatusChange(c, $any($event.target).value)">
                  <option value="PENDING">Pending</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </td>
              <td style="font-size:0.82rem;">
                <div *ngIf="c.assignedOfficerName" style="color:var(--secondary); font-weight:600;">
                  {{ c.assignedOfficerName }}
                </div>
                <div *ngIf="!c.assignedOfficerName" style="color:var(--text-light);">Unassigned</div>
              </td>
              <td style="font-size:0.78rem; color:var(--text-muted); white-space:nowrap;">{{ c.createdAt | date:'dd MMM yy' }}</td>
              <td>
                <button class="btn btn-outline btn-sm" (click)="openAssign(c)">
                  {{ c.assignedOfficerName ? '🔄 Reassign' : '👮 Assign' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="filtered.length === 0" style="padding:32px; text-align:center; color:var(--text-muted);">
          No complaints found matching the current filters.
        </div>
      </div>
    </div>

    <!-- Assign Officer Modal -->
    <div *ngIf="assignTarget" class="modal-backdrop" (click)="assignTarget = null">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>Assign Officer</h3>
            <div style="font-size:0.82rem; color:var(--text-muted);">{{ assignTarget!.title }}</div>
          </div>
          <button class="modal-close" (click)="assignTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <div class="ms-label">Current Officer</div>
            <div class="ms-value">{{ assignTarget!.assignedOfficerName || 'None' }}</div>
          </div>
          <div class="modal-section">
            <div class="ms-label">Select New Officer</div>
            <div *ngIf="officers.length === 0" style="color:var(--text-muted); font-size:0.85rem; margin-top:8px;">
              No officers available. Register officers first from Admin → Officers.
            </div>
            <div class="officer-list">
              <div *ngFor="let o of officers" class="officer-option"
                [class.selected]="selectedOfficerId === o.id"
                (click)="selectedOfficerId = o.id">
                <div class="oo-avatar">{{ o.name[0] }}</div>
                <div>
                  <div style="font-weight:600; font-size:0.875rem;">{{ o.name }}</div>
                  <div style="font-size:0.72rem; color:var(--text-muted);">{{ o.email }}</div>
                </div>
                <div *ngIf="selectedOfficerId === o.id" style="margin-left:auto; color:var(--secondary);">✓</div>
              </div>
            </div>
          </div>
          <div *ngIf="assignError" class="alert alert-danger">{{ assignError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline btn-sm" (click)="assignTarget = null">Cancel</button>
          <button class="btn btn-primary btn-sm" [disabled]="!selectedOfficerId || assigning" (click)="confirmAssign()">
            {{ assigning ? 'Assigning...' : 'Confirm Assignment' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-row { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:20px;
      @media (max-width:900px) { grid-template-columns:repeat(3,1fr); }
      @media (max-width:480px) { grid-template-columns:1fr; } }
    .summary-card { background:white; border:1px solid var(--border); border-radius:var(--radius-md); padding:18px; }
    .summary-num   { font-size:1.5rem; font-weight:800; color:var(--text-primary); line-height:1; margin-bottom:4px; }
    .summary-label { font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; }
    .table-wrapper { background:white; border:1px solid var(--border); border-radius:var(--radius-md); overflow:hidden; }
    .inline-select { border:none; background:transparent; cursor:pointer; font-family:var(--font); font-size:0.75rem;
      font-weight:600; padding:3px 6px; border-radius:20px; }
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:2000;
      display:flex; align-items:center; justify-content:center; padding:24px; }
    .modal-box { background:white; border-radius:var(--radius-xl); width:100%; max-width:480px; max-height:80vh;
      display:flex; flex-direction:column; box-shadow:var(--shadow-xl);
      .modal-header { display:flex; align-items:flex-start; justify-content:space-between; padding:20px 24px; border-bottom:1px solid var(--border);
        h3 { font-size:1.1rem; margin:0 0 4px; } .modal-close { background:var(--bg-muted); border:none; border-radius:50%; width:28px; height:28px; cursor:pointer; } }
      .modal-body { padding:20px 24px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:16px; }
      .modal-footer { padding:16px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px; background:var(--bg-muted); } }
    .modal-section { .ms-label { font-size:0.72rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px; }
      .ms-value { font-size:0.875rem; color:var(--text-secondary); } }
    .officer-list { display:flex; flex-direction:column; gap:8px; margin-top:8px; max-height:260px; overflow-y:auto; }
    .officer-option { display:flex; align-items:center; gap:12px; padding:12px; border:1.5px solid var(--border);
      border-radius:var(--radius); cursor:pointer; transition:all 0.15s;
      &:hover { border-color:var(--primary); background:#f0f4ff; }
      &.selected { border-color:var(--secondary); background:#f0fdf4; }
      .oo-avatar { width:32px; height:32px; border-radius:50%; background:var(--primary); color:white;
        display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.82rem; flex-shrink:0; } }
  `]
})
export class AdminAllComplaintsComponent implements OnInit {
  complaints: ComplaintResponse[] = [];
  officers: UserResponse[] = [];
  loading = false;
  error = '';
  searchQ = '';
  filterStatus = 'all';
  filterPriority = 'all';
  assignTarget: ComplaintResponse | null = null;
  selectedOfficerId: number | null = null;
  assigning = false;
  assignError = '';

  constructor(
    private complaintService: ComplaintService,
    private userService: UserService
  ) { }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.complaintService.getAllComplaints().subscribe({
      next: (list) => { this.complaints = list; this.loading = false; },
      error: () => { this.error = 'Failed to load complaints.'; this.loading = false; }
    });
    this.userService.getUsersByRole('OFFICER').subscribe({
      next: (list) => { this.officers = list.filter(o => o.approved); },
      error: () => { }
    });
  }

  get filtered(): ComplaintResponse[] {
    return this.complaints.filter(c => {
      const s = this.filterStatus === 'all' || c.status === this.filterStatus;
      const p = this.filterPriority === 'all' || c.priority === this.filterPriority;
      const q = !this.searchQ ||
        c.title.toLowerCase().includes(this.searchQ.toLowerCase()) ||
        String(c.id).includes(this.searchQ);
      return s && p && q;
    });
  }

  count(status: string): number { return this.complaints.filter(c => c.status === status).length; }

  onStatusChange(c: ComplaintResponse, newStatus: string): void {
    if (newStatus === c.status) return;
    this.complaintService.updateComplaintStatus(c.id, newStatus).subscribe({
      next: (updated) => {
        const idx = this.complaints.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.complaints[idx] = updated;
      },
      error: (err) => alert(err?.error?.message || 'Status update failed.')
    });
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
      },
      error: (err) => {
        this.assignError = err?.error?.message || 'Assignment failed.';
        this.assigning = false;
      }
    });
  }

  formatStatus(s: string): string { return ComplaintService.formatStatus(s); }
}