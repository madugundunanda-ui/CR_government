import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ComplaintResponse, ComplaintService } from '../../core/services/complaint.service';

@Component({
  selector: 'app-admin-all-complaints',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/admin/dashboard">Dashboard</a>
          <span>›</span>
          <span>All Complaints</span>
        </div>
        <h1>All Complaints</h1>
        <p>Live complaint records pulled from the backend.</p>
      </div>
    </div>

    <div class="container" style="padding-top:28px; padding-bottom:48px;">
      <div class="summary-row">
        <div class="summary-card">
          <div class="summary-num">{{ complaints.length }}</div>
          <div class="summary-label">Total</div>
        </div>
        <div class="summary-card">
          <div class="summary-num">{{ pendingCount }}</div>
          <div class="summary-label">Pending</div>
        </div>
        <div class="summary-card">
          <div class="summary-num">{{ inProgressCount }}</div>
          <div class="summary-label">In Progress</div>
        </div>
        <div class="summary-card">
          <div class="summary-num">{{ resolvedCount }}</div>
          <div class="summary-label">Resolved</div>
        </div>
      </div>

      <div class="table-wrapper" *ngIf="filtered.length > 0; else emptyState">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Citizen</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let complaint of filtered">
              <td><code>GRV-{{ complaint.id }}</code></td>
              <td>{{ complaint.title }}</td>
              <td>{{ complaint.citizenName }}</td>
              <td><span class="badge badge-{{ complaint.priority.toLowerCase() }}">{{ complaint.priority }}</span></td>
              <td>{{ formatStatus(complaint.status) }}</td>
              <td>{{ complaint.createdAt | date:'dd MMM yyyy, h:mm a' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No Complaints Found</h3>
          <p>There are no complaints in the system yet.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .summary-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 20px;

      @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .summary-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 18px;
    }

    .summary-num {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: 4px;
    }

    .summary-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-wrapper {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .empty-state {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 48px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }
  `]
})
export class AdminAllComplaintsComponent {
  complaints: ComplaintResponse[] = [];

  constructor(private complaintService: ComplaintService) {
    this.complaintService.getAllComplaints().subscribe({
      next: (complaints) => {
        this.complaints = complaints;
      },
      error: (err) => {
        console.error('Unable to load all complaints', err);
        this.complaints = [];
      }
    });
  }

  get filtered(): ComplaintResponse[] {
    return this.complaints;
  }

  get pendingCount(): number {
    return this.complaints.filter(c => c.status === 'PENDING').length;
  }

  get inProgressCount(): number {
    return this.complaints.filter(c => c.status === 'IN_PROGRESS').length;
  }

  get resolvedCount(): number {
    return this.complaints.filter(c => c.status === 'RESOLVED').length;
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}