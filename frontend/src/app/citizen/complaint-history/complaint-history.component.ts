import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { Complaint, ComplaintStatus } from '../../core/models/models';

@Component({
  selector: 'app-complaint-history',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/citizen/dashboard">Dashboard</a>
          <span>›</span>
          <span>My Complaints</span>
        </div>
        <h1>Complaint History</h1>
        <p>View and track all complaints raised by you.</p>
      </div>
    </div>

    <div class="container" style="padding-top:28px; padding-bottom:48px;">

      <!-- Filters & Search -->
      <div class="filters-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search by ticket no. or title..." class="search-input" />
        </div>

        <div class="filter-tabs">
          <button *ngFor="let tab of statusTabs" class="filter-tab" [class.active]="activeStatus === tab.value"
            (click)="setActiveStatus(tab.value)">
            {{ tab.label }}
            <span class="tab-count">{{ getCountForStatus(tab.value) }}</span>
          </button>
        </div>

        <div class="filter-selects">
          <select [(ngModel)]="sortBy" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
            <option value="status">By Status</option>
          </select>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="history-stats">
        <div class="hs-item">
          <div class="hs-num">{{ all.length }}</div>
          <div class="hs-label">Total Filed</div>
        </div>
        <div class="hs-item">
          <div class="hs-num">{{ getCountForStatus('pending') + getCountForStatus('open') }}</div>
          <div class="hs-label">Pending</div>
        </div>
        <div class="hs-item">
          <div class="hs-num">{{ getCountForStatus('in-progress') }}</div>
          <div class="hs-label">In Progress</div>
        </div>
        <div class="hs-item">
          <div class="hs-num">{{ getCountForStatus('resolved') + getCountForStatus('closed') }}</div>
          <div class="hs-label">Resolved</div>
        </div>
        <div class="hs-item">
          <div class="hs-num">{{ resolutionRate }}%</div>
          <div class="hs-label">Resolution Rate</div>
        </div>
      </div>

      <!-- Table View -->
      <div *ngIf="filtered.length > 0; else emptyState">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ticket No.</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Filed On</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filtered" (click)="openDetail(c)" class="clickable-row">
                <td><code class="ticket-code">{{ c.ticketNo }}</code></td>
                <td>
                  <div class="title-cell">
                    <div class="cell-title">{{ c.title | slice:0:55 }}{{ c.title.length > 55 ? '...' : '' }}</div>
                    <div class="cell-meta">{{ c.ward }}</div>
                  </div>
                </td>
                <td><span class="category-tag">{{ c.category }}</span></td>
                <td><span class="badge" [class]="'badge-' + c.priority.toLowerCase()">{{ c.priority }}</span></td>
                <td><span class="badge" [class]="'badge-' + c.status">{{ formatStatus(c.status) }}</span></td>
                <td class="date-cell">{{ c.createdAt | date:'dd MMM yy' }}</td>
                <td class="date-cell">{{ c.updatedAt | date:'dd MMM yy' }}</td>
                <td>
                  <button class="btn btn-outline btn-sm" (click)="$event.stopPropagation(); openDetail(c)">View</button>
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

      <!-- Detail Modal -->
      <div *ngIf="selectedComplaint" class="modal-backdrop" (click)="setSelectedComplaint(null)">
        <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <div class="modal-ticket">{{ selectedComplaint!.ticketNo }}</div>
                <h3>{{ selectedComplaint!.title }}</h3>
              </div>
              <button class="modal-close" (click)="setSelectedComplaint(null)">✕</button>
            </div>

            <div class="modal-body">
              <div class="modal-meta-row">
                <span class="badge" [class]="'badge-' + selectedComplaint!.status">{{ formatStatus(selectedComplaint!.status) }}</span>
                <span class="badge" [class]="'badge-' + selectedComplaint!.priority.toLowerCase()">{{ selectedComplaint!.priority }}</span>
                <span class="modal-cat">🏷️ {{ selectedComplaint!.category }}</span>
                <span class="modal-cat">📍 {{ selectedComplaint!.ward }}</span>
              </div>

              <div class="modal-section">
                <div class="ms-label">Description</div>
                <div class="ms-value">{{ selectedComplaint!.description }}</div>
              </div>

              <div *ngIf="selectedComplaint!.assignedOfficerName" class="modal-section">
                <div class="ms-label">Assigned Officer</div>
                <div class="ms-value officer-info">
                  <div class="officer-avatar">{{ selectedComplaint!.assignedOfficerName![0] }}</div>
                  {{ selectedComplaint!.assignedOfficerName }}
                </div>
              </div>

              <!-- Timeline -->
              <div class="modal-section">
                <div class="ms-label">Resolution Timeline</div>
                <div class="timeline">
                  <div *ngFor="let event of selectedComplaint!.timeline; let last = last" class="timeline-item" [class.last]="last">
                    <div class="tl-dot" [class]="'tl-' + event.status"></div>
                    <div class="tl-content">
                      <div class="tl-event">{{ event.event }}</div>
                      <div class="tl-desc">{{ event.description }}</div>
                      <div class="tl-meta">By {{ event.by }} · {{ event.timestamp | date:'dd MMM yyyy, h:mm a' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="selectedComplaint!.rating" class="modal-section">
                <div class="ms-label">Your Rating</div>
                <div class="modal-rating">
                  <span *ngFor="let s of [1,2,3,4,5]" class="star" [class.filled]="s <= selectedComplaint!.rating!">★</span>
                  <span class="rating-label">{{ selectedComplaint!.rating }}/5 — {{ selectedComplaint!.feedback }}</span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-outline btn-sm" (click)="setSelectedComplaint(null)">Close</button>
              <button *ngIf="selectedComplaint!.status === 'resolved'" class="btn btn-secondary btn-sm">Confirm Resolution ✓</button>
            </div>
          </div>
        </div>
      </div>
  `,
  styles: [`
    .filters-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;

      .search-box {
        display: flex; align-items: center; gap: 10px;
        background: white; border: 1.5px solid var(--border);
        border-radius: var(--radius); padding: 9px 14px;
        flex: 1; min-width: 220px;
        transition: border-color 0.2s;
        &:focus-within { border-color: var(--primary); }

        svg { color: var(--text-light); flex-shrink: 0; }
        .search-input {
          border: none; outline: none; font-size: 0.875rem;
          font-family: var(--font); color: var(--text-primary); flex: 1;
          &::placeholder { color: var(--text-light); }
        }
      }

      .filter-tabs {
        display: flex; gap: 6px; flex-wrap: wrap;

        .filter-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: var(--radius);
          font-size: 0.8rem; font-weight: 600;
          border: 1.5px solid var(--border);
          background: white; color: var(--text-secondary);
          cursor: pointer; transition: all 0.15s;
          font-family: var(--font);

          &:hover  { border-color: var(--primary); color: var(--primary); }
          &.active { background: var(--primary); border-color: var(--primary); color: white; }

          .tab-count {
            font-size: 0.72rem; font-weight: 700;
            background: rgba(0,0,0,0.1);
            padding: 1px 6px; border-radius: 20px;
          }

          &.active .tab-count { background: rgba(255,255,255,0.2); }
        }
      }

      .filter-select {
        padding: 9px 14px;
        border: 1.5px solid var(--border);
        border-radius: var(--radius);
        font-size: 0.85rem; font-family: var(--font);
        color: var(--text-secondary); background: white;
        cursor: pointer; outline: none;
        &:focus { border-color: var(--primary); }
      }
    }

    .history-stats {
      display: flex;
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: 20px;

      .hs-item {
        flex: 1; padding: 20px;
        text-align: center;
        border-right: 1px solid var(--border);
        &:last-child { border-right: none; }

        .hs-num  { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
        .hs-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; margin-top: 3px; }
      }

      @media (max-width: 600px) { flex-wrap: wrap; .hs-item { flex: 0 0 50%; } }
    }

    .clickable-row { cursor: pointer; }

    .ticket-code {
      font-size: 0.75rem; font-weight: 700;
      background: #f0f4ff; color: var(--primary);
      padding: 3px 8px; border-radius: 4px;
      font-family: monospace;
    }

    .title-cell {
      .cell-title { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
      .cell-meta  { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
    }

    .category-tag {
      font-size: 0.72rem; font-weight: 600;
      background: var(--bg-muted); color: var(--text-secondary);
      padding: 3px 9px; border-radius: 20px; white-space: nowrap;
    }

    .date-cell { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }

    .empty-state {
      text-align: center;
      padding: 80px 24px;
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);

      .empty-icon { font-size: 3rem; margin-bottom: 16px; }
      h3 { font-size: 1.25rem; margin-bottom: 8px; }
      p  { color: var(--text-muted); margin-bottom: 20px; }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 2000;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: fadeIn 0.2s ease;
    }

    .modal-box {
      background: white;
      border-radius: var(--radius-xl);
      width: 100%; max-width: 680px;
      max-height: 85vh;
      display: flex; flex-direction: column;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.25s ease;

      .modal-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        padding: 24px; border-bottom: 1px solid var(--border);

        .modal-ticket { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; }
        h3 { font-size: 1.1rem; margin: 0; }

        .modal-close {
          background: var(--bg-muted); border: none; border-radius: 50%;
          width: 32px; height: 32px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.875rem; transition: background 0.15s;
          flex-shrink: 0; margin-left: 12px;
          &:hover { background: var(--border); }
        }
      }

      .modal-body {
        padding: 24px; overflow-y: auto; flex: 1;
        display: flex; flex-direction: column; gap: 20px;

        .modal-meta-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

        .modal-cat { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }
      }

      .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid var(--border);
        display: flex; justify-content: flex-end; gap: 10px;
        background: var(--bg-muted); border-radius: 0 0 var(--radius-xl) var(--radius-xl);
      }
    }

    .modal-section {
      .ms-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
      .ms-value { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.65; }

      .officer-info {
        display: flex; align-items: center; gap: 10px;
        .officer-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--primary); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.875rem; font-weight: 700;
        }
      }
    }

    .timeline {
      position: relative;
      padding-left: 20px;

      &::before {
        content: '';
        position: absolute; left: 5px; top: 8px; bottom: 8px;
        width: 2px; background: var(--border);
      }

      .timeline-item {
        display: flex; gap: 14px; position: relative;
        padding-bottom: 20px;
        &.last { padding-bottom: 0; }

        .tl-dot {
          width: 12px; height: 12px; border-radius: 50%;
          position: absolute; left: -19px; top: 4px; flex-shrink: 0;
          border: 2px solid white; box-shadow: 0 0 0 2px var(--border);

          &.tl-pending     { background: #94a3b8; }
          &.tl-open        { background: #3b82f6; }
          &.tl-in-progress { background: #f59e0b; }
          &.tl-resolved    { background: var(--secondary); }
          &.tl-closed      { background: #64748b; }
          &.tl-rejected    { background: var(--danger); }
        }

        .tl-content {
          .tl-event { font-size: 0.875rem; font-weight: 700; color: var(--text-primary); margin-bottom: 3px; }
          .tl-desc  { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 4px; line-height: 1.5; }
          .tl-meta  { font-size: 0.72rem; color: var(--text-muted); }
        }
      }
    }

    .modal-rating {
      display: flex; align-items: center; gap: 3px;
      .star { font-size: 1.2rem; color: #d1d5db; }
      .star.filled { color: #f59e0b; }
      .rating-label { font-size: 0.8rem; color: var(--text-muted); margin-left: 8px; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  `]
})
export class ComplaintHistoryComponent {
  all: Complaint[];
  activeStatus = 'all';
  selectedComplaint: Complaint | null = null;
  searchQuery = '';
  sortBy = 'newest';

  statusTabs = [
    { label: 'All',         value: 'all' },
    { label: 'Pending',     value: 'pending' },
    { label: 'Open',        value: 'open' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Resolved',    value: 'resolved' },
    { label: 'Closed',      value: 'closed' },
    { label: 'Rejected',    value: 'rejected' },
  ];

  constructor(public auth: AuthService, private mockData: MockDataService) {
    this.all = this.mockData.getComplaintsByUser('u1');
  }

  get filtered(): Complaint[] {
    let list = [...this.all];
    if (this.activeStatus !== 'all') list = list.filter(c => c.status === this.activeStatus);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.ticketNo.toLowerCase().includes(q));
    }
    if (this.sortBy === 'oldest')   list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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

  get resolutionRate(): number {
    const resolved = this.all.filter(c => c.status === 'resolved' || c.status === 'closed').length;
    return this.all.length ? Math.round((resolved / this.all.length) * 100) : 0;
  }

  formatStatus(status: string): string {
    return status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  openDetail(c: Complaint) { this.selectedComplaint = c; }

  setActiveStatus(value: string) { this.activeStatus = value; }
  setSelectedComplaint(c: Complaint | null) { this.selectedComplaint = c; }
}
