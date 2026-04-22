import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SupervisorService } from '../../core/services/supervisor.service';
import { ComplaintService, ComplaintResponse } from '../../core/services/complaint.service';
import { DepartmentStatsResponse, OfficerPerformanceResponse } from '../../core/models/models';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../core/models/models';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="sidebar-user">
          <div class="avatar" style="background:#a8dadc; color:#1d3557;">SV</div>
          <div class="user-name">{{ auth.currentUser()?.name }}</div>
          <div class="user-role">Department Supervisor</div>
        </div>
        <nav class="nav-menu">
          <div class="nav-section-title">Workspace</div>
          <a routerLink="/supervisor/dashboard" class="nav-item active"><span class="nav-icon">📊</span> Department Console</a>
          <div class="nav-section-title">Account</div>
          <a routerLink="/profile" class="nav-item"><span class="nav-icon">👤</span> My Profile</a>
          <button class="nav-item logout-btn" (click)="auth.logout()"><span class="nav-icon">🚪</span> Sign Out</button>
        </nav>
      </aside>

      <main class="main-content">
        <div class="page-top">
          <div>
            <h2>Supervisor Dashboard</h2>
            <p>Manage complaints and officers within your department only.</p>
          </div>
        </div>

        <div *ngIf="loading" style="text-align:center; padding:40px;"><div class="spinner"></div></div>
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <div *ngIf="stats" class="stats-row" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 20px;">
          <div class="stat-card"><div class="stat-info"><h3>{{ stats.totalComplaints }}</h3><p>Total</p></div></div>
          <div class="stat-card"><div class="stat-info"><h3>{{ stats.pending }}</h3><p>Pending</p></div></div>
          <div class="stat-card"><div class="stat-info"><h3>{{ stats.inProgress }}</h3><p>In Progress</p></div></div>
          <div class="stat-card"><div class="stat-info"><h3>{{ stats.resolved + stats.closed }}</h3><p>Resolved/Closed</p></div></div>
          <div class="stat-card"><div class="stat-info"><h3>{{ officers.length }}</h3><p>Officers</p></div></div>
        </div>

        <div class="grid">
          <section class="panel">
            <h3>Department Complaints</h3>
            <div *ngIf="complaints.length === 0" class="empty">No complaints in your department.</div>
            <div *ngFor="let c of complaints" class="item">
              <div style="flex:1; min-width: 0;">
                <div style="font-weight:700;">GRV-{{ c.id }} · {{ c.title }}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">
                  {{ c.citizenName }} · {{ c.departmentName || 'Unassigned Dept' }}
                </div>
                <div style="margin-top:4px; display:flex; gap:6px; flex-wrap:wrap;">
                  <span class="badge badge-{{ c.status }}">{{ formatStatus(c.status) }}</span>
                  <span class="badge badge-{{ c.priority }}">{{ c.priority }}</span>
                </div>
              </div>
              <div class="actions">
                <select class="form-control" [(ngModel)]="assignSelection[c.id]" style="min-width: 180px;">
                  <option [ngValue]="null">Select officer</option>
                  <option *ngFor="let o of officers" [ngValue]="o.officerId">{{ o.officerName }}</option>
                </select>
                <button class="btn btn-outline btn-sm" (click)="reassign(c)">Reassign</button>
                <select class="form-control" [(ngModel)]="statusSelection[c.id]" style="min-width: 150px;">
                  <option value="">Set status</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <button class="btn btn-primary btn-sm" (click)="updateStatus(c)">Update</button>
              </div>
            </div>
          </section>

          <section class="panel">
            <h3>Department Officers</h3>
            <div *ngIf="officers.length === 0" class="empty">No officers in your department.</div>
            <div *ngFor="let o of officers" class="item">
              <div style="flex:1;">
                <div style="font-weight:700;">{{ o.officerName }}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">{{ o.officerEmail }}</div>
              </div>
              <div style="font-size:0.78rem; color:var(--text-muted); text-align:right;">
                <div>Total: {{ o.totalAssigned }}</div>
                <div>Resolved: {{ o.resolved + o.closed }}</div>
              </div>
            </div>

            <h3 style="margin-top: 18px;">Manage Officer Details</h3>
            <div *ngIf="officerUsers.length === 0" class="empty">No officer users available.</div>
            <div *ngFor="let u of officerUsers" class="item">
              <div style="flex:1; min-width: 0;">
                <div style="font-weight:700;">{{ u.name }}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">{{ u.email }}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">{{ u.contactNumber || 'No contact' }}</div>
              </div>
              <button class="btn btn-outline btn-sm" (click)="openOfficerEdit(u)">Edit</button>
            </div>

            <div *ngIf="editingOfficer" style="margin-top: 10px; border-top: 1px solid var(--border); padding-top: 12px;">
              <h4 style="font-size: 0.9rem; margin-bottom: 8px;">Edit {{ editingOfficer.name }}</h4>
              <div class="actions" style="display:grid; grid-template-columns: 1fr; gap: 8px;">
                <input class="form-control" [(ngModel)]="officerEdit.name" placeholder="Full name" />
                <input class="form-control" [(ngModel)]="officerEdit.email" placeholder="Email" />
                <input class="form-control" [(ngModel)]="officerEdit.contactNumber" placeholder="Contact number" />
                <textarea class="form-control" [(ngModel)]="officerEdit.address" rows="2" placeholder="Address"></textarea>
              </div>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <button class="btn btn-primary btn-sm" (click)="saveOfficerEdit()">Save</button>
                <button class="btn btn-outline btn-sm" (click)="cancelOfficerEdit()">Cancel</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .page-top p { margin: 0; color: var(--text-muted); font-size: 0.875rem; }
    .grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
    .panel { background: white; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; }
    .panel h3 { margin-bottom: 12px; }
    .item { border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; margin-bottom: 10px; display: flex; gap: 10px; flex-wrap: wrap; }
    .actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .empty { color: var(--text-muted); font-size: 0.85rem; padding: 10px 0; }
    .logout-btn { background:none; border:none; width:100%; text-align:left; color:rgba(255,255,255,0.75); cursor:pointer; font-family:var(--font); font-size:0.875rem; }
    @media (max-width: 1100px) {
      .grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SupervisorDashboardComponent implements OnInit {
  loading = false;
  error = '';

  stats: DepartmentStatsResponse | null = null;
  complaints: ComplaintResponse[] = [];
  officers: OfficerPerformanceResponse[] = [];
  officerUsers: UserResponse[] = [];

  assignSelection: Record<number, number | null> = {};
  statusSelection: Record<number, string> = {};
  editingOfficer: UserResponse | null = null;
  officerEdit: { name: string; email: string; contactNumber?: string; address?: string } = { name: '', email: '' };

  constructor(
    public auth: AuthService,
    private supervisorService: SupervisorService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.supervisorService.getDepartmentStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.supervisorService.getDepartmentOfficers().subscribe({
          next: (officers) => {
            this.officers = officers;
            this.supervisorService.getDepartmentOfficerUsers().subscribe({
              next: (officerUsers) => {
                this.officerUsers = officerUsers;
                this.supervisorService.getDepartmentComplaints().subscribe({
                  next: (complaints) => {
                    this.complaints = complaints;
                    for (const c of complaints) {
                      this.assignSelection[c.id] = c.assignedOfficerId ?? null;
                      this.statusSelection[c.id] = '';
                    }
                    this.loading = false;
                  },
                  error: (err) => {
                    this.error = err?.error?.message || 'Failed to load complaints.';
                    this.loading = false;
                  }
                });
              },
              error: (err) => {
                this.error = err?.error?.message || 'Failed to load officer users.';
                this.loading = false;
              }
            });
          },
          error: (err) => {
            this.error = err?.error?.message || 'Failed to load officers.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load department stats.';
        this.loading = false;
      }
    });
  }

  reassign(c: ComplaintResponse): void {
    const officerId = this.assignSelection[c.id];
    if (!officerId) return;
    this.supervisorService.reassignComplaint(c.id, officerId).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err?.error?.message || 'Unable to reassign complaint.'; }
    });
  }

  updateStatus(c: ComplaintResponse): void {
    const status = this.statusSelection[c.id];
    if (!status) return;
    this.supervisorService.updateStatus(c.id, status).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err?.error?.message || 'Unable to update status.'; }
    });
  }

  formatStatus(status: string): string {
    return ComplaintService.formatStatus(status);
  }

  openOfficerEdit(user: UserResponse): void {
    this.editingOfficer = user;
    this.officerEdit = {
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber,
      address: user.address,
    };
  }

  cancelOfficerEdit(): void {
    this.editingOfficer = null;
    this.officerEdit = { name: '', email: '' };
  }

  saveOfficerEdit(): void {
    if (!this.editingOfficer) return;
    this.userService.updateOfficerBySupervisor(this.editingOfficer.id, this.officerEdit).subscribe({
      next: () => {
        this.cancelOfficerEdit();
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to update officer details.';
      }
    });
  }
}
