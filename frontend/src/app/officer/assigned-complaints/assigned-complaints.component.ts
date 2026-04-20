import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintResponse, ComplaintService } from '../../core/services/complaint.service';

@Component({
    selector: 'app-assigned-complaints',
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule],
    template: `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/officer/dashboard">Dashboard</a>
          <span>›</span><span>Assigned Complaints</span>
        </div>
        <h1>My Assigned Complaints</h1>
        <p>Only complaints assigned to you are shown here.</p>
      </div>
    </div>
    <div class="container" style="padding-top:28px; padding-bottom:48px;">
      <div *ngIf="loading" style="text-align:center; padding:40px;">
        <div class="spinner"></div><p style="color:var(--text-muted)">Loading...</p>
      </div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
      <div *ngIf="!loading">
        <!-- Filters -->
        <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px;">
          <input [(ngModel)]="searchQ" placeholder="Search title..." class="form-control" style="max-width:240px;"/>
          <select [(ngModel)]="filterStatus" class="form-control" style="max-width:180px;">
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select [(ngModel)]="filterPriority" class="form-control" style="max-width:180px;">
            <option value="all">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div *ngIf="filtered.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No Complaints Found</h3>
          <p>No complaints are assigned to you yet.</p>
        </div>

        <div *ngIf="filtered.length > 0" class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Category</th>
                <th>Priority</th><th>Status</th><th>SLA Deadline</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filtered">
                <td><code>GRV-{{ c.id }}</code></td>
                <td>
                  <div style="font-weight:600; font-size:0.875rem;">{{ c.title }}</div>
                  <div style="font-size:0.72rem; color:var(--text-muted);">{{ c.citizenName }}</div>
                </td>
                <td>{{ c.category || 'Others' }}</td>
                <td><span class="badge badge-{{ c.priority }}">{{ c.priority }}</span></td>
                <td><span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span></td>
                <td [style.color]="isSlaBreached(c) ? 'var(--danger)' : ''">
                  {{ c.slaDeadline | date:'dd MMM, h:mm a' }}
                  <span *ngIf="isSlaBreached(c)" style="font-size:0.7rem; color:var(--danger);"> ⚠️ Breached</span>
                </td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button *ngIf="c.status === 'ASSIGNED' || c.status === 'PENDING'"
                      class="btn btn-secondary btn-sm" (click)="changeStatus(c, 'IN_PROGRESS')">Start</button>
                    <button *ngIf="c.status === 'IN_PROGRESS'"
                      class="btn btn-primary btn-sm" (click)="changeStatus(c, 'RESOLVED')">Resolve</button>
                    <span *ngIf="c.status === 'RESOLVED' || c.status === 'CLOSED'"
                      style="font-size:0.75rem; color:var(--secondary); font-weight:600;">✓ Done</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .empty-state { text-align:center; padding:60px 24px; background:white;
      border-radius:var(--radius-md); border:1px solid var(--border);
      .empty-icon { font-size:2.5rem; margin-bottom:12px; }
      h3 { margin-bottom:8px; } p { color:var(--text-muted); } }
  `]
})
export class AssignedComplaintsComponent implements OnInit {
    complaints: ComplaintResponse[] = [];
    loading = false;
    error = '';
    searchQ = '';
    filterStatus = 'all';
    filterPriority = 'all';

    constructor(public auth: AuthService, private complaintService: ComplaintService) { }

    ngOnInit(): void {
        this.loading = true;
        this.complaintService.getMyTasks().subscribe({
            next: (tasks) => { this.complaints = tasks; this.loading = false; },
            error: () => { this.error = 'Failed to load tasks.'; this.loading = false; }
        });
    }

    get filtered(): ComplaintResponse[] {
        return this.complaints.filter(c => {
            const s = this.filterStatus === 'all' || c.status === this.filterStatus;
            const p = this.filterPriority === 'all' || c.priority === this.filterPriority;
            const q = !this.searchQ || c.title.toLowerCase().includes(this.searchQ.toLowerCase());
            return s && p && q;
        });
    }

    changeStatus(c: ComplaintResponse, status: string): void {
        this.complaintService.updateTaskStatus(c.id, status).subscribe({
            next: (updated) => {
                const idx = this.complaints.findIndex(x => x.id === updated.id);
                if (idx !== -1) this.complaints[idx] = updated;
            },
            error: (err) => alert(err?.error?.message || 'Update failed.')
        });
    }

    isSlaBreached(c: ComplaintResponse): boolean {
        return new Date(c.slaDeadline) < new Date() &&
            c.status !== 'RESOLVED' && c.status !== 'CLOSED';
    }

    formatStatus(s: string): string { return ComplaintService.formatStatus(s); }
}