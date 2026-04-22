import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';

@Component({
  selector: 'app-citizens',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminLayoutComponent],
  template: `
  <app-admin-layout active="citizens">
    <div class="page-wrap">
      <div class="page-header">
        <div class="page-header-left">
          <h2>Citizens</h2>
          <p>View and manage all citizen accounts registered on the platform.</p>
        </div>
      </div>

      <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
      <div *ngIf="error"      class="alert alert-danger">{{ error }}</div>

      <div class="filter-bar">
        <input class="form-control" style="max-width:260px;" [(ngModel)]="searchQ" placeholder="Search name or email…" />
        <span class="text-muted" style="font-size:0.75rem;margin-left:auto;">{{ filtered.length }} record(s)</span>
      </div>

      <div *ngIf="loading" class="loading-row"><div class="spinner"></div></div>

      <div *ngIf="!loading && filtered.length===0" class="empty-state">
        {{ searchQ ? 'No citizens match your search.' : 'No citizens have registered yet.' }}
      </div>

      <div *ngIf="!loading && filtered.length>0" class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Address</th>
              <th>ID Type</th>
              <th>Registered</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filtered">
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="user-avatar" style="font-size:0.68rem;background:#0e7490;">{{ c.name[0] }}</div>
                  <div>
                    <div style="font-size:0.8rem;font-weight:600;color:var(--text-900);">{{ c.name }}</div>
                    <div style="font-size:0.67rem;color:var(--text-500);">ID #{{ c.id }}</div>
                  </div>
                </div>
              </td>
              <td style="font-size:0.78rem;">{{ c.email }}</td>
              <td style="font-size:0.78rem;">{{ c.contactNumber || '—' }}</td>
              <td style="font-size:0.72rem;color:var(--text-500);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                {{ c.address || '—' }}
              </td>
              <td style="font-size:0.72rem;color:var(--text-500);">{{ c.identityType || '—' }}</td>
              <td style="font-size:0.72rem;color:var(--text-500);">{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
              <td style="text-align:right;">
                <button class="btn btn-ghost btn-xs" (click)="openEditCitizen(c)" id="edit-citizen-{{ c.id }}">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer"><span>{{ filtered.length }} citizens</span></div>
      </div>
    </div>
  </app-admin-layout>

  <!-- Edit Citizen Modal -->
  <div class="modal-overlay" *ngIf="editingCitizen" (click)="cancelCitizenEdit()">
    <div class="modal-box" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h4>Edit Citizen — {{ editingCitizen.name }}</h4>
        <button class="modal-close-btn" (click)="cancelCitizenEdit()">&#215;</button>
      </div>
      <div class="modal-body">
        <div class="form-grid-2">
          <div class="form-group">
            <label>Full Name <span class="required">*</span></label>
            <input class="form-control" [(ngModel)]="citizenEdit.name" />
          </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input class="form-control" [(ngModel)]="citizenEdit.email" type="email" />
          </div>
          <div class="form-group">
            <label>Contact Number</label>
            <input class="form-control" [(ngModel)]="citizenEdit.contactNumber" />
          </div>
          <div class="form-group" style="justify-content:flex-end;padding-top:20px;">
            <label class="check-label">
              <input type="checkbox" [(ngModel)]="citizenEdit.approved" />
              Account Approved
            </label>
          </div>
          <div class="form-group span-2">
            <label>Address</label>
            <textarea class="form-control" [(ngModel)]="citizenEdit.address" rows="2"></textarea>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost btn-sm" (click)="cancelCitizenEdit()" [disabled]="saving">Cancel</button>
        <button class="btn btn-primary btn-sm" (click)="saveCitizenEdit()" [disabled]="saving">
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
  `
})
export class CitizensComponent implements OnInit {
  citizens: UserResponse[] = [];
  loading = false;
  error = '';
  successMsg = '';
  saving = false;
  searchQ = '';
  editingCitizen: UserResponse | null = null;
  citizenEdit: { name: string; email: string; contactNumber?: string; address?: string; approved?: boolean; } = { name: '', email: '' };

  constructor(public auth: AuthService, private userService: UserService) {}

  ngOnInit(): void {
    this.loading = true;
    this.userService.getUsersByRole('CITIZEN').subscribe({
      next: (list) => { this.citizens = list; this.loading = false; },
      error: () => { this.error = 'Failed to load citizens.'; this.loading = false; }
    });
  }

  get filtered(): UserResponse[] {
    if (!this.searchQ) return this.citizens;
    const q = this.searchQ.toLowerCase();
    return this.citizens.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }

  openEditCitizen(c: UserResponse): void {
    this.editingCitizen = c;
    this.citizenEdit = { name: c.name, email: c.email, contactNumber: c.contactNumber, address: c.address, approved: c.approved };
  }
  cancelCitizenEdit(): void { this.editingCitizen = null; this.citizenEdit = { name: '', email: '' }; }

  saveCitizenEdit(): void {
    if (!this.editingCitizen) return;
    this.saving = true;
    this.userService.updateCitizenByAdmin(this.editingCitizen.id, this.citizenEdit).subscribe({
      next: (updated) => {
        // In-place update
        const idx = this.citizens.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.citizens[idx] = updated;
        this.saving = false;
        this.cancelCitizenEdit();
        this.successMsg = 'Citizen record updated.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'Failed to update citizen.';
        setTimeout(() => this.error = '', 4000);
      }
    });
  }
}