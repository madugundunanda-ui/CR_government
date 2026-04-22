import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { DepartmentResponse, UserResponse } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { DepartmentService } from '../../core/services/department.service';

@Component({
    selector: 'app-officers',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="sidebar-user">
          <div class="avatar" style="background:#e9c46a; color:#1a2340;">AD</div>
          <div class="user-name">{{ auth.currentUser()?.name }}</div>
          <div class="user-role">System Administrator</div>
        </div>
        <nav class="nav-menu">
          <div class="nav-section-title">Overview</div>
          <a routerLink="/admin/dashboard" class="nav-item"><span class="nav-icon">📊</span> Dashboard</a>
          <a routerLink="/admin/all-complaints" class="nav-item"><span class="nav-icon">📋</span> All Complaints</a>
          <a routerLink="/admin/citizens" class="nav-item"><span class="nav-icon">👥</span> Citizens</a>
          <a routerLink="/admin/officers" class="nav-item active"><span class="nav-icon">👮</span> Officers</a>
          <div class="nav-section-title">Management</div>
          <a routerLink="/admin/departments" class="nav-item"><span class="nav-icon">🏢</span> Departments</a>
          <div class="nav-section-title">Account</div>
          <a routerLink="/profile" class="nav-item"><span class="nav-icon">👤</span> Profile</a>
          <button class="nav-item logout-btn" (click)="auth.logout()"><span class="nav-icon">🚪</span> Sign Out</button>
        </nav>
      </aside>

      <main class="main-content">
        <div class="page-top">
          <div>
            <h2>Field Officers</h2>
            <p>Manage officer accounts and approve pending registrations.</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button class="tab-btn" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">
            All Officers <span class="tab-count">{{ officers.length }}</span>
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'pending'" (click)="activeTab = 'pending'">
            Pending Approval <span class="tab-count pending-count">{{ pendingOfficers.length }}</span>
          </button>
        </div>

        <div *ngIf="loading" style="text-align:center; padding:40px;"><div class="spinner"></div></div>
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <!-- Pending Approval Tab -->
        <div *ngIf="activeTab === 'pending' && !loading">
          <div *ngIf="pendingOfficers.length === 0" class="empty-card">
            <div style="font-size:2rem; margin-bottom:8px;">✅</div>
            <h3>No Pending Approvals</h3>
            <p>All officer registrations have been processed.</p>
          </div>
          <div *ngIf="pendingOfficers.length > 0" class="officers-grid">
            <div *ngFor="let o of pendingOfficers" class="officer-card pending">
              <div class="oc-avatar">{{ o.name[0] }}</div>
              <div class="oc-info">
                <div class="oc-name">{{ o.name }}</div>
                <div class="oc-email">{{ o.email }}</div>
                <div class="oc-meta">
                  <span>📱 {{ o.contactNumber || 'N/A' }}</span>
                  <span>📍 {{ o.address | slice:0:30 }}</span>
                </div>
                <div class="oc-date">Registered: {{ o.createdAt | date:'dd MMM yyyy' }}</div>
              </div>
              <div class="oc-actions">
                <span class="status-chip pending-chip">⏳ Pending</span>
                <button class="btn btn-secondary btn-sm" [disabled]="approvingId === o.id"
                  (click)="approve(o)">
                  {{ approvingId === o.id ? 'Approving...' : '✓ Approve' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- All Officers Tab -->
        <div *ngIf="activeTab === 'all' && !loading">
          <div style="margin-bottom:12px;">
            <input [(ngModel)]="searchQ" placeholder="Search name or email..." class="form-control" style="max-width:280px;"/>
          </div>
          <div *ngIf="filteredOfficers.length === 0" class="empty-card">
            <h3>No Officers Found</h3>
            <p>No officers have registered yet.</p>
          </div>
          <div class="table-wrapper" *ngIf="filteredOfficers.length > 0">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Contact</th><th>Address</th><th>Status</th><th>Registered</th><th>Actions</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let o of filteredOfficers">
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div style="width:28px; height:28px; border-radius:50%; background:var(--primary); color:white;
                        display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0;">
                        {{ o.name[0] }}
                      </div>
                      <div>
                        <div style="font-weight:600; font-size:0.875rem;">{{ o.name }}</div>
                        <div style="font-size:0.7rem; color:var(--text-muted);">ID: {{ o.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-size:0.82rem;">{{ o.email }}</td>
                  <td style="font-size:0.82rem;">{{ o.contactNumber || '—' }}</td>
                  <td style="font-size:0.78rem; color:var(--text-muted); max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ o.address }}</td>
                  <td>
                    <span class="status-chip" [class.active-chip]="o.approved" [class.pending-chip]="!o.approved">
                      {{ o.approved ? '✓ Active' : '⏳ Pending' }}
                    </span>
                  </td>
                  <td style="font-size:0.78rem; color:var(--text-muted);">{{ o.createdAt | date:'dd MMM yy' }}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" (click)="openEditOfficer(o)">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="editingOfficer" class="form-card" style="margin-top:14px;">
            <h4>Edit Officer</h4>
            <div class="form-row" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div class="form-group">
                <label>Name</label>
                <input class="form-control" [(ngModel)]="officerEdit.name" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input class="form-control" [(ngModel)]="officerEdit.email" />
              </div>
              <div class="form-group">
                <label>Contact</label>
                <input class="form-control" [(ngModel)]="officerEdit.contactNumber" />
              </div>
              <div class="form-group">
                <label>Role</label>
                <select class="form-control" [(ngModel)]="officerEdit.role">
                  <option value="OFFICER">OFFICER</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                </select>
              </div>
              <div class="form-group">
                <label>Department</label>
                <select class="form-control" [(ngModel)]="officerEdit.departmentId">
                  <option [ngValue]="undefined">Unassigned</option>
                  <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
                </select>
              </div>
              <div class="form-group" style="display:flex; align-items:center; gap:8px; margin-top:24px;">
                <input type="checkbox" [(ngModel)]="officerEdit.approved" id="approvedChk" />
                <label for="approvedChk">Approved</label>
              </div>
            </div>
            <div class="form-group">
              <label>Address</label>
              <textarea class="form-control" [(ngModel)]="officerEdit.address" rows="2"></textarea>
            </div>
            <div style="display:flex; gap:8px; margin-top:10px;">
              <button class="btn btn-primary btn-sm" (click)="saveOfficerEdit()">Save</button>
              <button class="btn btn-outline btn-sm" (click)="cancelOfficerEdit()">Cancel</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
    styles: [`
    .page-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px;
      h2 { margin-bottom:4px; } p { font-size:0.875rem; color:var(--text-muted); margin:0; } }
    .tab-bar { display:flex; gap:4px; border-bottom:2px solid var(--border); margin-bottom:24px;
      .tab-btn { background:none; border:none; border-bottom:2px solid transparent; margin-bottom:-2px;
        padding:10px 20px; font-size:0.875rem; font-weight:600; color:var(--text-muted); cursor:pointer; font-family:var(--font);
        display:flex; align-items:center; gap:8px;
        &.active { color:var(--primary); border-bottom-color:var(--primary); }
        &:hover { color:var(--primary); }
        .tab-count { font-size:0.72rem; background:var(--bg-muted); padding:2px 8px; border-radius:20px; }
        .pending-count { background:#fee2e2; color:#991b1b; } } }
    .empty-card { text-align:center; padding:48px; background:white; border-radius:var(--radius-md); border:1px solid var(--border);
      h3 { margin-bottom:8px; } p { color:var(--text-muted); } }
    .officers-grid { display:flex; flex-direction:column; gap:12px; }
    .officer-card { background:white; border:1px solid var(--border); border-radius:var(--radius-md); padding:20px;
      display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap;
      &.pending { border-left:3px solid var(--warning); }
      .oc-avatar { width:48px; height:48px; border-radius:50%; background:var(--primary); color:white;
        display:flex; align-items:center; justify-content:center; font-size:1.25rem; font-weight:700; flex-shrink:0; }
      .oc-info { flex:1; min-width:0;
        .oc-name { font-size:1rem; font-weight:700; margin-bottom:2px; }
        .oc-email { font-size:0.82rem; color:var(--text-muted); margin-bottom:6px; }
        .oc-meta { display:flex; gap:12px; flex-wrap:wrap; font-size:0.75rem; color:var(--text-secondary); margin-bottom:4px; }
        .oc-date { font-size:0.72rem; color:var(--text-light); } }
      .oc-actions { display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; } }
    .status-chip { font-size:0.72rem; font-weight:700; padding:3px 10px; border-radius:20px; }
    .active-chip  { background:#d1fae5; color:#065f46; }
    .pending-chip { background:#fef3c7; color:#92400e; }
    .logout-btn { background:none; border:none; width:100%; text-align:left; color:rgba(255,255,255,0.75); cursor:pointer; font-family:var(--font); font-size:0.875rem; }
  `]
})
export class OfficersComponent implements OnInit {
    officers: UserResponse[] = [];
    pendingOfficers: UserResponse[] = [];
    loading = false;
    error = '';
    activeTab = 'all';
    searchQ = '';
    approvingId: number | null = null;
    departments: DepartmentResponse[] = [];
    editingOfficer: UserResponse | null = null;
    officerEdit: {
        name: string;
        email: string;
        contactNumber?: string;
        address?: string;
        departmentId?: number;
        role: 'OFFICER' | 'SUPERVISOR';
        approved?: boolean;
    } = { name: '', email: '', role: 'OFFICER' };

    constructor(
      public auth: AuthService,
      private userService: UserService,
      private departmentService: DepartmentService
    ) { }

    ngOnInit(): void { this.loadData(); }

    loadData(): void {
        this.loading = true;
      this.departmentService.getAll().subscribe({
        next: (depts) => this.departments = depts,
        error: () => this.departments = []
      });
      this.userService.getUsersByRole('OFFICER').subscribe({
        next: (officers) => {
          this.userService.getUsersByRole('SUPERVISOR').subscribe({
            next: (supervisors) => {
              this.officers = [...officers, ...supervisors];
              this.userService.getPendingOfficers().subscribe({
                next: (pending) => { this.pendingOfficers = pending; this.loading = false; },
                error: () => this.loading = false
              });
            },
            error: () => { this.error = 'Failed to load officers.'; this.loading = false; }
          });
        },
        error: () => { this.error = 'Failed to load officers.'; this.loading = false; }
      });
    }

    get filteredOfficers(): UserResponse[] {
        if (!this.searchQ) return this.officers;
        const q = this.searchQ.toLowerCase();
        return this.officers.filter(o => o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q));
    }

    approve(o: UserResponse): void {
        this.approvingId = o.id;
        this.userService.approveOfficer(o.id).subscribe({
            next: (updated) => {
                this.pendingOfficers = this.pendingOfficers.filter(x => x.id !== o.id);
                const idx = this.officers.findIndex(x => x.id === o.id);
                if (idx !== -1) this.officers[idx] = updated;
                this.approvingId = null;
            },
            error: () => this.approvingId = null
        });
    }

    openEditOfficer(o: UserResponse): void {
      this.editingOfficer = o;
      this.officerEdit = {
        name: o.name,
        email: o.email,
        contactNumber: o.contactNumber,
        address: o.address,
        departmentId: o.departmentId,
        role: o.role === 'SUPERVISOR' ? 'SUPERVISOR' : 'OFFICER',
        approved: o.approved,
      };
    }

    cancelOfficerEdit(): void {
      this.editingOfficer = null;
      this.officerEdit = { name: '', email: '', role: 'OFFICER' };
    }

    saveOfficerEdit(): void {
      if (!this.editingOfficer) return;
      this.userService.updateOfficerByAdmin(this.editingOfficer.id, this.officerEdit).subscribe({
        next: () => {
          this.cancelOfficerEdit();
          this.loadData();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to update officer.';
        }
      });
    }
}