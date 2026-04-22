import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../../core/services/department.service';
import { DepartmentResponse } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, AdminLayoutComponent],
  template: `
  <app-admin-layout active="departments">
    <div class="page-wrap">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Departments</h2>
          <p>Manage municipal departments used to categorize and route complaints.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary btn-sm" (click)="openForm()">+ Add Department</button>
        </div>
      </div>

      <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
      <div *ngIf="error"      class="alert alert-danger">{{ error }}</div>

      <div *ngIf="loading" class="loading-row"><div class="spinner"></div></div>

      <div *ngIf="!loading" class="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Department Name</th>
              <th>Description</th>
              <th>Created</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of departments; let i = index">
              <td style="color:var(--text-500);font-size:0.72rem;">{{ i + 1 }}</td>
              <td style="font-size:0.82rem;font-weight:600;color:var(--text-900);">{{ d.name }}</td>
              <td style="font-size:0.78rem;color:var(--text-500);max-width:300px;">{{ d.description || '—' }}</td>
              <td style="font-size:0.72rem;color:var(--text-500);">{{ d.createdAt | date:'dd/MM/yyyy' }}</td>
              <td style="text-align:right;">
                <button class="btn btn-ghost btn-xs" (click)="openEdit(d)" style="margin-right:4px;">Edit</button>
                <button class="btn btn-danger-ghost btn-xs" (click)="confirmDelete(d)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="departments.length === 0">
              <td colspan="5" class="text-muted" style="text-align:center;padding:32px;font-size:0.8rem;">
                No departments yet. Click "Add Department" to create one.
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer"><span>{{ departments.length }} department(s)</span></div>
      </div>
    </div>
  </app-admin-layout>

  <!-- Add / Edit Department Modal -->
  <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
    <div class="modal-box modal-sm" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h4>{{ editingDept ? 'Edit Department' : 'Add New Department' }}</h4>
        <button class="modal-close-btn" (click)="closeForm()">&#215;</button>
      </div>
      <div class="modal-body">
        <form [formGroup]="deptForm" id="dept-form">
          <div class="form-group">
            <label>Department Name <span class="required">*</span></label>
            <input type="text" formControlName="name" class="form-control" placeholder="e.g., Roads &amp; Infrastructure" />
            <span *ngIf="deptForm.get('name')?.invalid && deptForm.get('name')?.touched" class="field-error">Name is required.</span>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea formControlName="description" class="form-control" rows="3" placeholder="Brief description of this department…"></textarea>
          </div>
        </form>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost btn-sm" (click)="closeForm()" [disabled]="submitting">Cancel</button>
        <button class="btn btn-primary btn-sm" (click)="submitForm()" [disabled]="deptForm.invalid || submitting">
          {{ submitting ? 'Saving…' : (editingDept ? 'Update' : 'Create') }}
        </button>
      </div>
    </div>
  </div>
  `
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
    this.deptForm = this.fb.group({ name: ['', Validators.required], description: [''] });
  }

  ngOnInit(): void { this.loadDepartments(); }

  loadDepartments(): void {
    this.loading = true;
    this.departmentService.getAll().subscribe({
      next: (list) => { this.departments = list; this.loading = false; },
      error: () => { this.error = 'Failed to load departments.'; this.loading = false; }
    });
  }

  openForm(): void { this.editingDept = null; this.deptForm.reset(); this.showForm = true; }

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