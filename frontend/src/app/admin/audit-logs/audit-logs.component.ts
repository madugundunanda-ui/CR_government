import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';
import { environment } from '../../../environments/environment';

interface AuditLogItem {
  id: number;
  action: string;
  details: string;
  actorName: string;
  entityType: string;
  relatedEntityId: number;
  createdAt: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminLayoutComponent],
  template: `
  <app-admin-layout active="audit">
    <div class="page-wrap">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Audit Log</h2>
          <p>System activity trail — all significant actions taken by users and administrators.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-ghost btn-sm" (click)="load()">Refresh</button>
        </div>
      </div>

      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <input class="form-control" style="max-width:240px;" [(ngModel)]="searchQ" placeholder="Search action or actor…" />
        <select class="form-control" style="width:auto;" [(ngModel)]="filterAction">
          <option value="">All Actions</option>
          <option value="CREATED">Created</option>
          <option value="UPDATED">Updated</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="DELETED">Deleted</option>
          <option value="STATUS">Status Changed</option>
        </select>
        <span class="text-muted" style="font-size:0.75rem;margin-left:auto;">{{ filtered.length }} record(s)</span>
      </div>

      <div *ngIf="loading" class="loading-row"><div class="spinner"></div></div>

      <div *ngIf="!loading && filtered.length === 0" class="empty-state">
        {{ searchQ || filterAction ? 'No logs match the current filters.' : 'No audit logs yet. System events will appear here.' }}
      </div>

      <div *ngIf="!loading && filtered.length > 0" class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width:60px;">ID</th>
              <th style="width:160px;">Action</th>
              <th>Details</th>
              <th style="width:140px;">Actor</th>
              <th style="width:120px;">Entity</th>
              <th style="width:140px;">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of filtered">
              <td style="font-size:0.7rem;color:var(--text-500);">#{{ log.id }}</td>
              <td>
                <span class="badge" [class]="actionBadge(log.action)">
                  {{ log.action.split('_').join(' ') }}
                </span>
              </td>
              <td style="font-size:0.78rem;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                {{ log.details }}
              </td>
              <td style="font-size:0.78rem;">{{ log.actorName || '—' }}</td>
              <td>
                <span style="font-size:0.68rem;background:var(--th-bg);border:1px solid var(--border);padding:1px 7px;border-radius:3px;font-weight:600;">
                  {{ log.entityType }}{{ log.relatedEntityId ? ' #' + log.relatedEntityId : '' }}
                </span>
              </td>
              <td style="font-size:0.72rem;color:var(--text-500);white-space:nowrap;">
                {{ log.createdAt | date:'dd/MM/yy, HH:mm' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">
          <span>Showing {{ filtered.length }} of {{ logs.length }} events</span>
        </div>
      </div>
    </div>
  </app-admin-layout>
  `
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLogItem[] = [];
  loading = false;
  error = '';
  searchQ = '';
  filterAction = '';

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.http.get<AuditLogItem[]>(`${environment.apiUrl}/admin/audit-logs`).subscribe({
      next: (list) => { this.logs = list; this.loading = false; },
      error: () => { this.error = 'Failed to load audit logs.'; this.loading = false; }
    });
  }

  get filtered(): AuditLogItem[] {
    return this.logs.filter(l => {
      const a = !this.filterAction || l.action.includes(this.filterAction);
      const q = !this.searchQ ||
        l.action.toLowerCase().includes(this.searchQ.toLowerCase()) ||
        (l.actorName || '').toLowerCase().includes(this.searchQ.toLowerCase()) ||
        (l.details || '').toLowerCase().includes(this.searchQ.toLowerCase());
      return a && q;
    });
  }

  actionBadge(action: string): string {
    if (action.includes('CREATED'))                        return 'badge-RESOLVED';
    if (action.includes('CHANGED') || action.includes('UPDATED')) return 'badge-ASSIGNED';
    if (action.includes('ASSIGNED'))                       return 'badge-IN_PROGRESS';
    if (action.includes('DELETED'))                        return 'badge-HIGH';
    return 'badge-CLOSED';
  }
}