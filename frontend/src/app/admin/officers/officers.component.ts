import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { DepartmentResponse, UserResponse } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { DepartmentService } from '../../core/services/department.service';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-officers',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminLayoutComponent],
  template: `
  <app-admin-layout active="officers">
    <div class="page-wrap">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Officers &amp; Supervisors</h2>
          <p>Manage field officer accounts, approve registrations, assign departments and roles.</p>
        </div>
      </div>

      <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
      <div *ngIf="error"      class="alert alert-danger">{{ error }}</div>

      <!-- Tabs -->
      <div class="tab-strip">
        <button class="tab-item" [class.active]="activeTab==='all'" (click)="activeTab='all'">
          All Officers
          <span class="tab-badge">{{ officers.length }}</span>
        </button>
        <button class="tab-item" [class.active]="activeTab==='pending'" (click)="activeTab='pending'">
          Pending Approval
          <span class="tab-badge" [class.danger]="pendingOfficers.length > 0">{{ pendingOfficers.length }}</span>
        </button>
      </div>

      <div *ngIf="loading" class="loading-row"><div class="spinner"></div></div>

      <!-- ── Pending Tab ── -->
      <ng-container *ngIf="!loading && activeTab==='pending'">
        <div *ngIf="pendingOfficers.length===0" class="empty-state">
          No pending officer registrations.
        </div>
        <div *ngIf="pendingOfficers.length>0" class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Registered</th>
                <th>Role</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of pendingOfficers">
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div class="user-avatar" style="font-size:0.68rem;">{{ o.name[0] }}</div>
                    <span style="font-size:0.8rem;font-weight:600;color:var(--text-900);">{{ o.name }}</span>
                  </div>
                </td>
                <td style="font-size:0.78rem;">{{ o.email }}</td>
                <td style="font-size:0.78rem;">{{ o.contactNumber || '—' }}</td>
                <td style="font-size:0.72rem;color:var(--text-500);">{{ o.createdAt | date:'dd/MM/yyyy' }}</td>
                <td><span class="badge badge-{{ o.role }}">{{ o.role }}</span></td>
                <td style="text-align:right;">
                  <button class="btn btn-secondary btn-xs" [disabled]="approvingId===o.id" (click)="approve(o)">
                    {{ approvingId===o.id ? 'Approving…' : 'Approve' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- ── All Officers Tab ── -->
      <ng-container *ngIf="!loading && activeTab==='all'">
        <div class="filter-bar">
          <input class="form-control" style="max-width:240px;" [(ngModel)]="searchQ" placeholder="Search name or email…" />
          <select class="form-control" style="width:auto;" [(ngModel)]="filterRole">
            <option value="">All Roles</option>
            <option value="OFFICER">Officers</option>
            <option value="SUPERVISOR">Supervisors</option>
          </select>
          <span class="text-muted" style="font-size:0.75rem;margin-left:auto;">{{ filteredOfficers.length }} record(s)</span>
        </div>

        <div *ngIf="filteredOfficers.length===0" class="empty-state">No officers found.</div>

        <div *ngIf="filteredOfficers.length>0" class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Registered</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of filteredOfficers">
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div class="user-avatar" style="font-size:0.68rem;">{{ o.name[0] }}</div>
                    <div>
                      <div style="font-size:0.8rem;font-weight:600;color:var(--text-900);">{{ o.name }}</div>
                      <div style="font-size:0.67rem;color:var(--text-500);">ID #{{ o.id }}</div>
                    </div>
                  </div>
                </td>
                <td style="font-size:0.78rem;">{{ o.email }}</td>
                <td style="font-size:0.78rem;">{{ o.contactNumber || '—' }}</td>
                <td><span class="badge badge-{{ o.role }}">{{ o.role }}</span></td>
                <td style="font-size:0.78rem;color:var(--text-500);">{{ o.departmentName || '—' }}</td>
                <td>
                  <span class="badge" [class]="o.approved ? 'badge-active' : 'badge-inactive'">
                    {{ o.approved ? 'Active' : 'Pending' }}
                  </span>
                </td>
                <td style="font-size:0.72rem;color:var(--text-500);">{{ o.createdAt | date:'dd/MM/yy' }}</td>
                <td style="text-align:right;">
                  <button class="btn btn-ghost btn-xs" (click)="openEditOfficer(o)" id="edit-{{ o.id }}">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="table-footer">
            <span>{{ filteredOfficers.length }} record(s)</span>
          </div>
        </div>
      </ng-container>
    </div>
  </app-admin-layout>

  <!-- Edit Officer Modal -->
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
          <div class="form-group">
            <label>Contact Number</label>
            <input class="form-control" [(ngModel)]="officerEdit.contactNumber" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select class="form-control" [(ngModel)]="officerEdit.role">
              <option value="OFFICER">Officer</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
          </div>
          <div class="form-group">
            <label>Department</label>
            <select class="form-control" [(ngModel)]="officerEdit.departmentId">
              <option [ngValue]="undefined">— Unassigned —</option>
              <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div class="form-group" style="justify-content:flex-end;padding-top:20px;">
            <label class="check-label">
              <input type="checkbox" [(ngModel)]="officerEdit.approved" />
              Account Approved
            </label>
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
  `
})
export class OfficersComponent implements OnInit, OnDestroy {
  officers: UserResponse[] = [];
  pendingOfficers: UserResponse[] = [];
  loading = false;
  error = '';
  successMsg = '';
  saving = false;
  activeTab = 'all';
  searchQ = '';
  filterRole = '';
  approvingId: number | null = null;
  departments: DepartmentResponse[] = [];
  editingOfficer: UserResponse | null = null;
  officerEdit: {
    name: string; email: string; contactNumber?: string;
    address?: string; departmentId?: number;
    role: 'OFFICER' | 'SUPERVISOR'; approved?: boolean;
  } = { name: '', email: '', role: 'OFFICER' };
  private routeSub?: Subscription;

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe(p => {
      if (p['tab']) this.activeTab = p['tab'];
    });
    this.loadData();
  }
  ngOnDestroy(): void { this.routeSub?.unsubscribe(); }

  loadData(): void {
    this.loading = true;
    this.departmentService.getAll().subscribe({ next: d => this.departments = d, error: () => {} });
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
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.error = 'Failed to load officers.'; this.loading = false; }
    });
  }

  get filteredOfficers(): UserResponse[] {
    let list = this.officers;
    if (this.filterRole) list = list.filter(o => o.role === this.filterRole);
    if (this.searchQ) {
      const q = this.searchQ.toLowerCase();
      list = list.filter(o => o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q));
    }
    return list;
  }

  approve(o: UserResponse): void {
    this.approvingId = o.id;
    this.userService.approveOfficer(o.id).subscribe({
      next: (updated) => {
        this.pendingOfficers = this.pendingOfficers.filter(x => x.id !== o.id);
        const idx = this.officers.findIndex(x => x.id === o.id);
        if (idx !== -1) this.officers[idx] = updated;
        this.approvingId = null;
        this.successMsg = `${updated.name} approved successfully.`;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.approvingId = null; this.error = 'Failed to approve.'; setTimeout(() => this.error = '', 3000); }
    });
  }

  openEditOfficer(o: UserResponse): void {
    this.editingOfficer = o;
    this.officerEdit = {
      name: o.name, email: o.email, contactNumber: o.contactNumber,
      address: o.address, departmentId: o.departmentId,
      role: o.role === 'SUPERVISOR' ? 'SUPERVISOR' : 'OFFICER', approved: o.approved,
    };
  }
  cancelOfficerEdit(): void { this.editingOfficer = null; this.officerEdit = { name: '', email: '', role: 'OFFICER' }; }

  saveOfficerEdit(): void {
    if (!this.editingOfficer) return;
    this.saving = true;
    this.userService.updateOfficerByAdmin(this.editingOfficer.id, this.officerEdit).subscribe({
      next: (updated) => {
        this.saving = false;
        // Update in-place — no full reload
        const idx = this.officers.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.officers[idx] = updated;
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
}