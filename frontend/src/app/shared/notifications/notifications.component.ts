import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationItem } from '../../core/models/models';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <a [routerLink]="dashboardRoute">Dashboard</a>
          <span>›</span><span>Notifications</span>
        </div>
        <h1>Notifications</h1>
        <p>All system and complaint-related notifications for your account.</p>
      </div>
    </div>

    <div class="container" style="padding-top:28px; padding-bottom:48px; max-width:800px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
        <div style="font-size:0.875rem; color:var(--text-muted);">
          {{ notifications.length }} notification(s)
          <span *ngIf="unreadCount > 0" style="color:var(--danger); font-weight:600; margin-left:8px;">
            {{ unreadCount }} unread
          </span>
        </div>
        <button *ngIf="unreadCount > 0" class="btn btn-outline btn-sm" (click)="markAllRead()"
          [disabled]="markingAll">
          {{ markingAll ? 'Marking...' : '✓ Mark All as Read' }}
        </button>
      </div>

      <div *ngIf="loading" style="text-align:center; padding:40px;"><div class="spinner"></div></div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && notifications.length === 0" class="empty-card">
        <div style="font-size:2.5rem; margin-bottom:12px;">🔔</div>
        <h3>No Notifications</h3>
        <p>You're all caught up! Notifications appear here when complaints are updated.</p>
      </div>

      <div class="notif-list" *ngIf="!loading && notifications.length > 0">
        <div *ngFor="let n of notifications" class="notif-item"
          [class.unread]="!n.read"
          (click)="markRead(n)">
          <div class="notif-dot" [class.dot-unread]="!n.read"></div>
          <div class="notif-body">
            <div class="notif-title">{{ n.title }}</div>
            <div class="notif-msg">{{ n.message }}</div>
            <div class="notif-meta">
              <span>{{ n.createdAt | date:'dd MMM yyyy, h:mm a' }}</span>
              <a *ngIf="n.relatedComplaintId" [routerLink]="complaintRoute"
                style="color:var(--primary); font-weight:600; font-size:0.75rem;" (click)="$event.stopPropagation()">
                View Complaint GRV-{{ n.relatedComplaintId }} →
              </a>
            </div>
          </div>
          <div *ngIf="!n.read" class="notif-badge">NEW</div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .empty-card { text-align:center; padding:60px; background:white; border-radius:var(--radius-md);
      border:1px solid var(--border); h3 { margin-bottom:8px; } p { color:var(--text-muted); } }
    .notif-list { background:white; border:1px solid var(--border); border-radius:var(--radius-md); overflow:hidden; }
    .notif-item { display:flex; align-items:flex-start; gap:12px; padding:16px 20px;
      border-bottom:1px solid var(--border); transition:background 0.15s; cursor:pointer;
      &:last-child { border-bottom:none; }
      &:hover { background:var(--bg-muted); }
      &.unread { background:#f8f9ff; border-left:3px solid var(--primary); }
      .notif-dot { width:10px; height:10px; border-radius:50%; background:var(--border);
        flex-shrink:0; margin-top:6px;
        &.dot-unread { background:var(--primary); } }
      .notif-body { flex:1; min-width:0;
        .notif-title { font-size:0.875rem; font-weight:700; color:var(--text-primary); margin-bottom:3px; }
        .notif-msg   { font-size:0.82rem; color:var(--text-secondary); line-height:1.5; margin-bottom:6px; }
        .notif-meta  { display:flex; align-items:center; gap:16px; font-size:0.72rem; color:var(--text-light); flex-wrap:wrap; } }
      .notif-badge { font-size:0.65rem; font-weight:800; background:var(--primary); color:white;
        padding:2px 8px; border-radius:20px; flex-shrink:0; letter-spacing:0.5px; } }
  `]
})
export class NotificationsComponent implements OnInit {
    notifications: NotificationItem[] = [];
    unreadCount = 0;
    loading = false;
    error = '';
    markingAll = false;

    constructor(
        public auth: AuthService,
        private notifService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loading = true;
        this.notifService.getAll().subscribe({
            next: (list) => {
                this.notifications = list;
                this.unreadCount = list.filter(n => !n.read).length;
                this.loading = false;
            },
            error: () => { this.error = 'Failed to load notifications.'; this.loading = false; }
        });
    }

    get dashboardRoute(): string {
        const r = this.auth.getRole();
        if (r === 'ADMIN') return '/admin/dashboard';
        if (r === 'OFFICER') return '/officer/dashboard';
        return '/citizen/dashboard';
    }

    get complaintRoute(): string {
        const r = this.auth.getRole();
        if (r === 'OFFICER') return '/officer/assigned-complaints';
        return '/citizen/complaint-history';
    }

    markRead(n: NotificationItem): void {
        if (n.read) return;
        this.notifService.markAsRead(n.id).subscribe({
            next: (updated) => {
                const idx = this.notifications.findIndex(x => x.id === n.id);
                if (idx !== -1) this.notifications[idx] = updated;
                this.unreadCount = Math.max(0, this.unreadCount - 1);
            }
        });
    }

    markAllRead(): void {
        this.markingAll = true;
        this.notifService.markAllAsRead().subscribe({
            next: () => {
                this.notifications = this.notifications.map(n => ({ ...n, read: true }));
                this.unreadCount = 0;
                this.markingAll = false;
            },
            error: () => this.markingAll = false
        });
    }
}