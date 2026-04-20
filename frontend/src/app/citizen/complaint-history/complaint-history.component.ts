import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintResponse, ComplaintService, FeedbackRequest } from '../../core/services/complaint.service';

@Component({
  selector: 'app-complaint-history',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/citizen/dashboard">Dashboard</a>
          <span>›</span><span>My Complaints</span>
        </div>
        <h1>Complaint History</h1>
        <p>All complaints raised by you.</p>
      </div>
    </div>

    <div class="container" style="padding-top:28px; padding-bottom:48px;">
      <div class="filters-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search by ID or title..." class="search-input" />
        </div>
        <div class="filter-tabs">
          <button *ngFor="let tab of statusTabs" class="filter-tab" [class.active]="activeStatus === tab.value"
            (click)="activeStatus = tab.value">
            {{ tab.label }}
            <span class="tab-count">{{ getCountForStatus(tab.value) }}</span>
          </button>
        </div>
        <select [(ngModel)]="sortBy" class="filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">By Priority</option>
        </select>
      </div>

      <div class="history-stats">
        <div class="hs-item"><div class="hs-num">{{ all.length }}</div><div class="hs-label">Total Filed</div></div>
        <div class="hs-item"><div class="hs-num">{{ pendingCount }}</div><div class="hs-label">Pending</div></div>
        <div class="hs-item"><div class="hs-num">{{ inProgressCount }}</div><div class="hs-label">In Progress</div></div>
        <div class="hs-item"><div class="hs-num">{{ resolvedCount }}</div><div class="hs-label">Resolved</div></div>
        <div class="hs-item"><div class="hs-num">{{ resolutionRate }}%</div><div class="hs-label">Resolution Rate</div></div>
      </div>

      <div *ngIf="loading" style="text-align:center; padding:40px;"><div class="spinner"></div></div>

      <div *ngIf="!loading">
        <div *ngIf="filtered.length > 0; else emptyState">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ticket No.</th><th>Title</th><th>Category</th>
                  <th>Priority</th><th>Status</th><th>Filed On</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of filtered" (click)="selected = c" style="cursor:pointer;">
                  <td><code class="ticket-code">GRV-{{ c.id }}</code></td>
                  <td>
                    <div class="cell-title">{{ c.title | slice:0:55 }}{{ c.title.length > 55 ? '...' : '' }}</div>
                    <div style="font-size:0.72rem; color:var(--text-muted);">{{ c.address }}</div>
                  </td>
                  <td><span class="category-tag">{{ c.category || 'Others' }}</span></td>
                  <td><span class="badge badge-{{ c.priority }}">{{ c.priority }}</span></td>
                  <td><span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span></td>
                  <td style="font-size:0.8rem; color:var(--text-muted); white-space:nowrap;">{{ c.createdAt | date:'dd MMM yy' }}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" (click)="$event.stopPropagation(); selected = c">View</button>
                    <button *ngIf="(c.status === 'RESOLVED' || c.status === 'CLOSED') && !feedbackSubmitted[c.id]"
                      class="btn btn-secondary btn-sm" style="margin-left:4px;"
                      (click)="$event.stopPropagation(); openFeedback(c)">Rate</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ng-template #emptyState>
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No Complaints Found</h3>
            <p>{{ searchQuery ? 'No complaints match your search.' : 'You have not filed any complaints yet.' }}</p>
            <a *ngIf="!searchQuery" routerLink="/citizen/raise-complaint" class="btn btn-primary">Raise Your First Complaint</a>
          </div>
        </ng-template>
      </div>

      <!-- Detail Modal -->
      <div *ngIf="selected" class="modal-backdrop" (click)="selected = null">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <div class="modal-ticket">GRV-{{ selected!.id }}</div>
              <h3>{{ selected!.title }}</h3>
            </div>
            <button class="modal-close" (click)="selected = null">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-meta-row">
              <span class="badge badge-{{ selected!.status }}">{{ formatStatus(selected!.status) }}</span>
              <span class="badge badge-{{ selected!.priority }}">{{ selected!.priority }}</span>
              <span class="modal-cat">🏷️ {{ selected!.category || 'Others' }}</span>
            </div>
            <div class="modal-section">
              <div class="ms-label">Description</div>
              <div class="ms-value">{{ selected!.description }}</div>
            </div>
            <div *ngIf="selected!.assignedOfficerName" class="modal-section">
              <div class="ms-label">Assigned Officer</div>
              <div class="ms-value">{{ selected!.assignedOfficerName }}</div>
            </div>
            <div class="modal-section">
              <div class="ms-label">SLA Deadline</div>
              <div class="ms-value" [style.color]="isSlaBreached(selected!) ? 'var(--danger)' : ''">
                {{ selected!.slaDeadline | date:'dd MMM yyyy, h:mm a' }}
                <span *ngIf="isSlaBreached(selected!)"> — ⚠️ SLA Breached</span>
              </div>
            </div>
            <div *ngIf="selected!.resolvedAt" class="modal-section">
              <div class="ms-label">Resolved On</div>
              <div class="ms-value" style="color:var(--secondary);">{{ selected!.resolvedAt | date:'dd MMM yyyy' }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline btn-sm" (click)="selected = null">Close</button>
          </div>
        </div>
      </div>

      <!-- Feedback Modal -->
      <div *ngIf="feedbackTarget" class="modal-backdrop" (click)="feedbackTarget = null">
        <div class="modal-box" (click)="$event.stopPropagation()" style="max-width:420px;">
          <div class="modal-header">
            <div><h3>Rate Resolution</h3><div style="font-size:0.8rem; color:var(--text-muted);">GRV-{{ feedbackTarget!.id }}</div></div>
            <button class="modal-close" (click)="feedbackTarget = null">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-section">
              <div class="ms-label">Rating</div>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <button *ngFor="let s of [1,2,3,4,5]" (click)="feedbackRating = s"
                  [style.background]="s <= feedbackRating ? '#f59e0b' : 'var(--bg-muted)'"
                  style="border:none; border-radius:50%; width:36px; height:36px; font-size:1rem; cursor:pointer; color:var(--text-primary);">
                  ★
                </button>
                <span style="font-size:0.85rem; color:var(--text-muted); align-self:center;">{{ feedbackRating }}/5</span>
              </div>
            </div>
            <div class="modal-section">
              <div class="ms-label">Comments (optional)</div>
              <textarea [(ngModel)]="feedbackComments" class="form-control" rows="3" placeholder="Share your experience..."></textarea>
            </div>
            <div *ngIf="feedbackError" class="alert alert-danger">{{ feedbackError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline btn-sm" (click)="feedbackTarget = null">Cancel</button>
            <button class="btn btn-primary btn-sm" [disabled]="submittingFeedback" (click)="submitFeedback()">
              {{ submittingFeedback ? 'Submitting...' : 'Submit Rating' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters-bar { display:flex; align-items:center; gap:16px; margin-bottom:20px; flex-wrap:wrap;
      .search-box { display:flex; align-items:center; gap:10px; background:white; border:1.5px solid var(--border);
        border-radius:var(--radius); padding:9px 14px; flex:1; min-width:220px;
        &:focus-within { border-color:var(--primary); }
        svg { color:var(--text-light); flex-shrink:0; }
        .search-input { border:none; outline:none; font-size:0.875rem; font-family:var(--font); flex:1; } }
      .filter-tabs { display:flex; gap:6px; flex-wrap:wrap;
        .filter-tab { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:var(--radius);
          font-size:0.8rem; font-weight:600; border:1.5px solid var(--border); background:white; cursor:pointer; font-family:var(--font);
          &:hover { border-color:var(--primary); color:var(--primary); }
          &.active { background:var(--primary); border-color:var(--primary); color:white; }
          .tab-count { font-size:0.72rem; font-weight:700; background:rgba(0,0,0,0.1); padding:1px 6px; border-radius:20px; } } }
      .filter-select { padding:9px 14px; border:1.5px solid var(--border); border-radius:var(--radius);
        font-size:0.85rem; font-family:var(--font); background:white; cursor:pointer; outline:none; } }
    .history-stats { display:flex; background:white; border:1px solid var(--border); border-radius:var(--radius-md);
      overflow:hidden; margin-bottom:20px;
      .hs-item { flex:1; padding:20px; text-align:center; border-right:1px solid var(--border); &:last-child { border-right:none; }
        .hs-num   { font-size:1.5rem; font-weight:800; color:var(--primary); }
        .hs-label { font-size:0.75rem; color:var(--text-muted); font-weight:500; margin-top:3px; } }
      @media (max-width:600px) { flex-wrap:wrap; .hs-item { flex:0 0 50%; } } }
    .ticket-code { font-size:0.75rem; font-weight:700; background:#f0f4ff; color:var(--primary);
      padding:3px 8px; border-radius:4px; font-family:monospace; }
    .cell-title { font-size:0.85rem; font-weight:600; color:var(--text-primary); }
    .category-tag { font-size:0.72rem; font-weight:600; background:var(--bg-muted); color:var(--text-secondary);
      padding:3px 9px; border-radius:20px; white-space:nowrap; }
    .empty-state { text-align:center; padding:80px 24px; background:white; border-radius:var(--radius-md);
      border:1px solid var(--border); .empty-icon { font-size:3rem; margin-bottom:16px; }
      h3 { font-size:1.25rem; margin-bottom:8px; } p { color:var(--text-muted); margin-bottom:20px; } }
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:2000;
      display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn 0.2s ease; }
    .modal-box { background:white; border-radius:var(--radius-xl); width:100%; max-width:680px;
      max-height:85vh; display:flex; flex-direction:column; box-shadow:var(--shadow-xl); animation:slideUp 0.25s ease;
      .modal-header { display:flex; align-items:flex-start; justify-content:space-between; padding:24px;
        border-bottom:1px solid var(--border); .modal-ticket { font-size:0.72rem; font-weight:700; color:var(--text-muted); margin-bottom:4px; }
        h3 { font-size:1.1rem; margin:0; }
        .modal-close { background:var(--bg-muted); border:none; border-radius:50%; width:32px; height:32px;
          cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.875rem; flex-shrink:0; margin-left:12px; } }
      .modal-body { padding:24px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:20px;
        .modal-meta-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
        .modal-cat { font-size:0.78rem; color:var(--text-muted); font-weight:500; } }
      .modal-footer { padding:16px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px;
        background:var(--bg-muted); border-radius:0 0 var(--radius-xl) var(--radius-xl); } }
    .modal-section { .ms-label { font-size:0.72rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;
      letter-spacing:0.8px; margin-bottom:8px; } .ms-value { font-size:0.875rem; color:var(--text-secondary); line-height:1.65; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  `]
})
export class ComplaintHistoryComponent implements OnInit {
  all: ComplaintResponse[] = [];
  selected: ComplaintResponse | null = null;
  loading = false;
  activeStatus = 'all';
  searchQuery = '';
  sortBy = 'newest';
  feedbackTarget: ComplaintResponse | null = null;
  feedbackRating = 5;
  feedbackComments = '';
  feedbackError = '';
  submittingFeedback = false;
  feedbackSubmitted: Record<number, boolean> = {};

  statusTabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  constructor(public auth: AuthService, private complaintService: ComplaintService) { }

  ngOnInit(): void {
    this.loading = true;
    this.complaintService.getMyComplaints().subscribe({
      next: (list) => { this.all = list; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get filtered(): ComplaintResponse[] {
    let list = [...this.all];
    if (this.activeStatus !== 'all') list = list.filter(c => c.status === this.activeStatus);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || String(c.id).includes(q));
    }
    if (this.sortBy === 'oldest') list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else if (this.sortBy === 'priority') {
      const ord: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      list.sort((a, b) => (ord[a.priority] ?? 9) - (ord[b.priority] ?? 9));
    } else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }

  getCountForStatus(status: string): number {
    if (status === 'all') return this.all.length;
    return this.all.filter(c => c.status === status).length;
  }

  get pendingCount() { return this.all.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED').length; }
  get inProgressCount() { return this.all.filter(c => c.status === 'IN_PROGRESS').length; }
  get resolvedCount() { return this.all.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length; }
  get resolutionRate() {
    return this.all.length ? Math.round((this.resolvedCount / this.all.length) * 100) : 0;
  }

  isSlaBreached(c: ComplaintResponse): boolean {
    return new Date(c.slaDeadline) < new Date() && c.status !== 'RESOLVED' && c.status !== 'CLOSED';
  }

  openFeedback(c: ComplaintResponse): void {
    this.feedbackTarget = c;
    this.feedbackRating = 5;
    this.feedbackComments = '';
    this.feedbackError = '';
  }

  submitFeedback(): void {
    if (!this.feedbackTarget) return;
    this.submittingFeedback = true;
    const req: FeedbackRequest = {
      complaintId: this.feedbackTarget.id,
      rating: this.feedbackRating,
      comments: this.feedbackComments
    };
    this.complaintService.submitFeedback(req).subscribe({
      next: () => {
        this.feedbackSubmitted[this.feedbackTarget!.id] = true;
        this.feedbackTarget = null;
        this.submittingFeedback = false;
      },
      error: (err) => {
        this.feedbackError = err?.error?.message || 'Failed to submit feedback.';
        this.submittingFeedback = false;
      }
    });
  }

  formatStatus(s: string): string { return ComplaintService.formatStatus(s); }
}
