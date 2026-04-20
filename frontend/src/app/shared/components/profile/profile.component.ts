import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../core/models/models';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
    template: `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <a [routerLink]="dashboardRoute">Dashboard</a>
          <span>›</span><span>My Profile</span>
        </div>
        <h1>My Profile</h1>
        <p>View and update your account information.</p>
      </div>
    </div>

    <div class="container" style="padding-top:32px; padding-bottom:48px; max-width:760px;">
      <div *ngIf="loading" style="text-align:center; padding:40px;"><div class="spinner"></div></div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
      <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

      <div *ngIf="profile && !loading">
        <!-- Profile Header Card -->
        <div class="profile-header-card">
          <div class="ph-avatar">{{ getInitials() }}</div>
          <div class="ph-info">
            <h2>{{ profile.name }}</h2>
            <div class="ph-role">
              <span class="role-badge" [class]="'role-' + profile.role.toLowerCase()">
                {{ profile.role }}
              </span>
              <span *ngIf="profile.role === 'OFFICER' && !profile.approved"
                style="font-size:0.75rem; color:var(--warning); font-weight:600; margin-left:8px;">
                ⏳ Pending Approval
              </span>
            </div>
            <div class="ph-email">{{ profile.email }}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">
              Member since {{ profile.createdAt | date:'MMMM yyyy' }}
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="profile-section">
          <h3 class="section-title">Personal Information</h3>
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name <span class="required">*</span></label>
                <input type="text" formControlName="name" class="form-control" placeholder="Your full name"/>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" [value]="profile.email" class="form-control" disabled
                  style="background:var(--bg-muted); cursor:not-allowed;"/>
                <span class="hint">Email cannot be changed.</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Mobile Number</label>
                <input type="tel" formControlName="contactNumber" class="form-control" placeholder="10-digit mobile number"/>
              </div>
              <div class="form-group">
                <label>Role</label>
                <input type="text" [value]="profile.role" class="form-control" disabled
                  style="background:var(--bg-muted); cursor:not-allowed;"/>
              </div>
            </div>
            <div class="form-group">
              <label>Residential Address <span class="required">*</span></label>
              <textarea formControlName="address" class="form-control" rows="2"
                placeholder="House No., Street, Area, City, PIN Code"></textarea>
            </div>
            <div style="display:flex; gap:10px; margin-top:8px;">
              <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || saving">
                {{ saving ? 'Saving...' : '💾 Save Changes' }}
              </button>
              <button type="button" class="btn btn-outline" (click)="resetForm()">Reset</button>
            </div>
          </form>
        </div>

        <!-- Account Info -->
        <div class="profile-section">
          <h3 class="section-title">Account Details</h3>
          <div class="info-grid">
            <div class="info-item"><div class="info-label">User ID</div><div class="info-value">#{{ profile.id }}</div></div>
            <div class="info-item"><div class="info-label">Role</div><div class="info-value">{{ profile.role }}</div></div>
            <div class="info-item"><div class="info-label">Status</div>
              <div class="info-value" [style.color]="profile.approved ? 'var(--secondary)' : 'var(--warning)'">
                {{ profile.approved ? '✓ Active' : '⏳ Pending Approval' }}
              </div>
            </div>
            <div class="info-item"><div class="info-label">Registered</div><div class="info-value">{{ profile.createdAt | date:'dd MMM yyyy' }}</div></div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .profile-header-card { background:white; border:1px solid var(--border); border-radius:var(--radius-lg);
      padding:32px; display:flex; align-items:center; gap:24px; margin-bottom:24px; flex-wrap:wrap;
      .ph-avatar { width:80px; height:80px; border-radius:50%; background:var(--primary); color:white;
        display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:800; flex-shrink:0; }
      .ph-info { h2 { font-size:1.5rem; margin-bottom:8px; }
        .ph-role { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
        .role-badge { font-size:0.72rem; font-weight:700; padding:3px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;
          &.role-citizen { background:#d1fae5; color:#065f46; }
          &.role-officer  { background:#dbeafe; color:#1e40af; }
          &.role-admin    { background:#fef3c7; color:#92400e; }
          &.role-supervisor { background:#f3e8ff; color:#6b21a8; } }
        .ph-email { font-size:0.875rem; color:var(--text-muted); margin-bottom:4px; } } }
    .profile-section { background:white; border:1px solid var(--border); border-radius:var(--radius-md);
      padding:24px; margin-bottom:20px; }
    .section-title { font-size:1rem; font-weight:700; color:var(--text-primary); margin-bottom:20px;
      padding-bottom:12px; border-bottom:1px solid var(--border); }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;
      @media (max-width:600px) { grid-template-columns:1fr; } }
    .info-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px;
      @media (max-width:480px) { grid-template-columns:1fr; } }
    .info-item { padding:12px; background:var(--bg-muted); border-radius:var(--radius);
      .info-label { font-size:0.72rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
      .info-value { font-size:0.875rem; color:var(--text-primary); font-weight:500; } }
  `]
})
export class ProfileComponent implements OnInit {
    profile: UserResponse | null = null;
    profileForm: FormGroup;
    loading = false;
    saving = false;
    error = '';
    successMsg = '';

    constructor(
        public auth: AuthService,
        private userService: UserService,
        private fb: FormBuilder
    ) {
        this.profileForm = this.fb.group({
            name: ['', Validators.required],
            contactNumber: [''],
            address: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.loading = true;
        this.userService.getProfile().subscribe({
            next: (p) => {
                this.profile = p;
                this.profileForm.patchValue({ name: p.name, contactNumber: p.contactNumber, address: p.address });
                this.loading = false;
            },
            error: () => { this.error = 'Failed to load profile.'; this.loading = false; }
        });
    }

    get dashboardRoute(): string {
        const role = this.auth.getRole();
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'officer') return '/officer/dashboard';
        return '/citizen/dashboard';
    }

    saveProfile(): void {
        if (this.profileForm.invalid) return;
        this.saving = true;
        this.error = '';
        this.successMsg = '';
        this.userService.updateProfile(this.profileForm.value).subscribe({
            next: (updated) => {
                this.profile = updated;
                this.saving = false;
                this.successMsg = 'Profile updated successfully!';
                setTimeout(() => this.successMsg = '', 3000);
            },
            error: (err) => {
                this.error = err?.error?.message || 'Failed to update profile.';
                this.saving = false;
            }
        });
    }

    resetForm(): void {
        if (this.profile) {
            this.profileForm.patchValue({ name: this.profile.name, contactNumber: this.profile.contactNumber, address: this.profile.address });
        }
    }

    getInitials(): string {
        return (this.profile?.name ?? '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
}