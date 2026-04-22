import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-citizens',
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
          <a routerLink="/admin/citizens" class="nav-item active"><span class="nav-icon">👥</span> Citizens</a>
          <a routerLink="/admin/officers" class="nav-item"><span class="nav-icon">👮</span> Officers</a>
          <div class="nav-section-title">Management</div>
          <a routerLink="/admin/departments" class="nav-item"><span class="nav-icon">🏢</span> Departments</a>
          <div class="nav-section-title">Account</div>
          <a routerLink="/profile" class="nav-item"><span class="nav-icon">👤</span> Profile</a>
          <button class="nav-item logout-btn" (click)="auth.logout()"><span class="nav-icon">🚪</span> Sign Out</button>
        </nav>
      </aside>
      <main class="main-content">
        <div style="margin-bottom:24px;">
          <h2>Registered Citizens</h2>
          <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">All citizens registered on the platform.</p>
        </div>

        <div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; align-items:center;">
          <input [(ngModel)]="searchQ" placeholder="Search name or email..." class="form-control" style="max-width:280px;"/>
          <span style="font-size:0.85rem; color:var(--text-muted);">{{ filtered.length }} citizen(s)</span>
        </div>

        <div *ngIf="loading" style="text-align:center; padding:40px;"><div class="spinner"></div></div>
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <div *ngIf="!loading && filtered.length === 0" class="empty-card">
          <h3>No Citizens Found</h3>
          <p>{{ searchQ ? 'No citizens match your search.' : 'No citizens have registered yet.' }}</p>
        </div>

        <div *ngIf="!loading && filtered.length > 0" class="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Contact</th><th>Address</th><th>Registered</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filtered">
                <td>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:var(--secondary); color:white;
                      display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0;">
                      {{ c.name[0] }}
                    </div>
                    <div style="font-weight:600; font-size:0.875rem;">{{ c.name }}</div>
                  </div>
                </td>
                <td style="font-size:0.82rem;">{{ c.email }}</td>
                <td style="font-size:0.82rem;">{{ c.contactNumber || '—' }}</td>
                <td style="font-size:0.78rem; color:var(--text-muted); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ c.address }}</td>
                <td style="font-size:0.78rem; color:var(--text-muted);">{{ c.createdAt | date:'dd MMM yyyy' }}</td>
                <td><button class="btn btn-outline btn-sm" (click)="openEditCitizen(c)">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="editingCitizen" class="form-card" style="margin-top:14px;">
          <h4>Edit Citizen</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="form-group"><label>Name</label><input class="form-control" [(ngModel)]="citizenEdit.name" /></div>
            <div class="form-group"><label>Email</label><input class="form-control" [(ngModel)]="citizenEdit.email" /></div>
            <div class="form-group"><label>Contact</label><input class="form-control" [(ngModel)]="citizenEdit.contactNumber" /></div>
            <div class="form-group" style="display:flex; align-items:center; gap:8px; margin-top:24px;">
              <input type="checkbox" [(ngModel)]="citizenEdit.approved" id="citizenApprovedChk" />
              <label for="citizenApprovedChk">Approved</label>
            </div>
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea class="form-control" rows="2" [(ngModel)]="citizenEdit.address"></textarea>
          </div>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="btn btn-primary btn-sm" (click)="saveCitizenEdit()">Save</button>
            <button class="btn btn-outline btn-sm" (click)="cancelCitizenEdit()">Cancel</button>
          </div>
        </div>
      </main>
    </div>
  `,
    styles: [`
    .empty-card { text-align:center; padding:48px; background:white; border-radius:var(--radius-md); border:1px solid var(--border); h3 { margin-bottom:8px; } p { color:var(--text-muted); } }
    .table-wrapper { background:white; border:1px solid var(--border); border-radius:var(--radius-md); overflow:hidden; }
    .form-card { background:white; border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; }
    .logout-btn { background:none; border:none; width:100%; text-align:left; color:rgba(255,255,255,0.75); cursor:pointer; font-family:var(--font); font-size:0.875rem; }
  `]
})
export class CitizensComponent implements OnInit {
    citizens: UserResponse[] = [];
    loading = false;
    error = '';
    searchQ = '';
    editingCitizen: UserResponse | null = null;
    citizenEdit: {
      name: string;
      email: string;
      contactNumber?: string;
      address?: string;
      approved?: boolean;
    } = { name: '', email: '' };

    constructor(public auth: AuthService, private userService: UserService) { }

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
      this.citizenEdit = {
        name: c.name,
        email: c.email,
        contactNumber: c.contactNumber,
        address: c.address,
        approved: c.approved,
      };
    }

    cancelCitizenEdit(): void {
      this.editingCitizen = null;
      this.citizenEdit = { name: '', email: '' };
    }

    saveCitizenEdit(): void {
      if (!this.editingCitizen) return;
      this.userService.updateCitizenByAdmin(this.editingCitizen.id, this.citizenEdit).subscribe({
        next: () => {
          this.cancelCitizenEdit();
          this.userService.getUsersByRole('CITIZEN').subscribe({
            next: (list) => this.citizens = list,
            error: () => this.error = 'Failed to reload citizens.'
          });
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to update citizen.';
        }
      });
    }
}