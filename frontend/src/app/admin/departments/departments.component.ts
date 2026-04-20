import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../../core/services/department.service';
import { DepartmentResponse } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-departments',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
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
          <a routerLink="/admin/officers" class="nav-item"><span class="nav-icon">👮</span> Officers</a>
          <div class="nav-section-title">Management</div>
          <a routerLink="/admin/departments" class="nav-item active"><span class="nav-icon">🏢</span> Departments</a>
          <div class="nav-section-title">Account</div>
          <a routerLink="/profile" class="nav-item"><span class="nav-icon">👤</span> Profile</a>
          <button class="nav-item logout-btn" (click)="auth.logout()"><span class="nav-icon">🚪</span> Sign Out</button>
        </nav>
      </aside>

      <main class="main-content">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
          <div>
            <h2>Departments</h2>
            <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">Manage municipal departments.</p>
          </div>
          <button class="btn btn-primary btn-sm" (click)="openForm()">➕ Add Department</button>
        </div>

        <div *ngIf="loading" style="text-align:center; padding:40px;"><div class="spinner"></div></div>
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
        <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

        <!-- Add / Edit Form -->
        <div *ngIf="showForm" class="form-card">
          <h4>{{ editingDept ? 'Edit Department' : 'Add New Department' }}</h4>
          <form [formGroup]="deptForm" (ngSubmit)="submitForm()">
            <div class="form-group">
              <label>Department Name <span class="required">*</span></label>
              <input type="text" formControlName="name" class="form-control" placeholder="e.g., Roads & Infrastructure"/>
              <span *ngIf="deptForm.get('name')?.invalid && deptForm.get('name')?.touched" class="error-message">Name is required.</span>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea formControlName="description" class="form-control" rows="2" placeholder="Brief description of the department..."></textarea>
            </div>
            <div style="display:flex; gap:10px; margin-top:12px;">
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="deptForm.invalid || submitting">
                {{ submitting ? 'Saving...' : (editingDept ? 'Update' : 'Create') }}
              </button>
              <button type="button" class="btn btn-outline btn-sm" (click)="closeForm()">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Departments Grid -->
        <div *ngIf="!loading" class="dept-grid">
          <div *ngFor="let d of departments" class="dept-card">
            <div class="dept-icon">🏢</div>
            <div class="dept-info">
              <div class="dept-name">{{ d.name }}</div>
              <div class="dept-desc">{{ d.description || 'No description' }}</div>
              <div class="dept-date">Added: {{ d.createdAt | date:'dd MMM yyyy' }}</div>
            </div>
            <div class="dept-actions">
              <button class="btn btn-outline btn-sm" (click)="openEdit(d)">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" (click)="confirmDelete(d)">🗑️</button>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && departments.length === 0" class="empty-card">
          <h3>No Departments Yet</h3>
          <p>Add departments to organize complaints by category.</p>
        </div>
      </main>
    </div>
  `,
    styles: [`
    .form-card { background:white; border:1px solid var(--border); border-radius:var(--radius-md); padding:24px; margin-bottom:24px;
      h4 { font-size:1rem; margin-bottom:16px; } }
    .dept-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:16px; }
    .dept-card { background:white; border:1px solid var(--border); border-radius:var(--radius-md); padding:20px;
      display:flex; align-items:flex-start; gap:14px; transition:all 0.2s;
      &:hover { box-shadow:var(--shadow-md); }
      .dept-icon { font-size:1.75rem; flex-shrink:0; }
      .dept-info { flex:1; min-width:0;
        .dept-name { font-size:0.95rem; font-weight:700; color:var(--text-primary); margin-bottom:4px; }
        .dept-desc { font-size:0.8rem; color:var(--text-muted); margin-bottom:4px; line-height:1.5; }
        .dept-date { font-size:0.72rem; color:var(--text-light); } }
      .dept-actions { display:flex; gap:6px; flex-shrink:0; } }
    .empty-card { text-align:center; padding:48px; background:white; border-radius:var(--radius-md); border:1px solid var(--border);
      h3 { margin-bottom:8px; } p { color:var(--text-muted); } }
    .logout-btn { background:none; border:none; width:100%; text-align:left; color:rgba(255,255,255,0.75); cursor:pointer; font-family:var(--font); font-size:0.875rem; }
  `]
})
export class DepartmentsComponent implements OnInit {
    departments: DepartmentResponse[] = [];
    loading = false;
    error = '';
    successMsg = '';
    showForm = false;
    submitting = false;
    editingDept: DepartmentResponse | null = null;
    deptForm: FormGroup;

    constructor(
        public auth: AuthService,
        private departmentService: DepartmentService,
        private fb: FormBuilder
    ) {
        this.deptForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit(): void { this.loadDepartments(); }

    loadDepartments(): void {
        this.loading = true;
        this.departmentService.getAll().subscribe({
            next: (list) => { this.departments = list; this.loading = false; },
            error: () => { this.error = 'Failed to load departments.'; this.loading = false; }
        });
    }

    openForm(): void {
        this.editingDept = null;
        this.deptForm.reset();
        this.showForm = true;
    }

    openEdit(d: DepartmentResponse): void {
        this.editingDept = d;
        this.deptForm.patchValue({ name: d.name, description: d.description });
        this.showForm = true;
    }

    closeForm(): void { this.showForm = false; this.editingDept = null; }

    submitForm(): void {
        if (this.deptForm.invalid) return;
        this.submitting = true;
        this.error = '';
        this.successMsg = '';
        const data = this.deptForm.value;

        const call = this.editingDept
            ? this.departmentService.update(this.editingDept.id, data)
            : this.departmentService.create(data);

        call.subscribe({
            next: (saved) => {
                if (this.editingDept) {
                    const idx = this.departments.findIndex(x => x.id === saved.id);
                    if (idx !== -1) this.departments[idx] = saved;
                    this.successMsg = 'Department updated.';
                } else {
                    this.departments.push(saved);
                    this.successMsg = 'Department created.';
                }
                this.closeForm();
                this.submitting = false;
                setTimeout(() => this.successMsg = '', 3000);
            },
            error: (err) => {
                this.error = err?.error?.message || 'Failed to save department.';
                this.submitting = false;
            }
        });
    }

    confirmDelete(d: DepartmentResponse): void {
        if (!confirm(`Delete department "${d.name}"? This cannot be undone.`)) return;
        this.departmentService.delete(d.id).subscribe({
            next: () => {
                this.departments = this.departments.filter(x => x.id !== d.id);
                this.successMsg = 'Department deleted.';
                setTimeout(() => this.successMsg = '', 3000);
            },
            error: (err) => { this.error = err?.error?.message || 'Delete failed.'; }
        });
    }
}