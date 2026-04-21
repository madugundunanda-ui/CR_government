import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="nav-container">
        <a routerLink="/" class="nav-logo">
          <div class="logo-emblem">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
              <circle cx="20" cy="20" r="19" stroke="white" stroke-width="2"/>
              <path d="M20 8L28 14V26H12V14L20 8Z" fill="white" opacity="0.9"/>
              <rect x="16" y="20" width="8" height="6" fill="#1f3c88" rx="1"/>
              <circle cx="20" cy="14" r="2.5" fill="#1f3c88"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-title">CivicConnect</span>
            <span class="logo-subtitle">Government of Karnataka</span>
          </div>
        </a>

        <ul class="nav-links" [class.open]="menuOpen">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a href="#about" (click)="closeMenu()">About</a></li>
          <li><a href="#features" (click)="closeMenu()">Services</a></li>
          <ng-container *ngIf="auth.isLoggedIn()">
            <ng-container *ngIf="auth.getRole() === 'CITIZEN'">
              <li><a routerLink="/citizen/dashboard" routerLinkActive="active">Dashboard</a></li>
              <li><a routerLink="/citizen/raise-complaint" routerLinkActive="active">Raise Complaint</a></li>
              <li><a routerLink="/citizen/complaint-history" routerLinkActive="active">My Complaints</a></li>
            </ng-container>
            <ng-container *ngIf="auth.getRole() === 'OFFICER' || auth.getRole() === 'SUPERVISOR'">
              <li><a routerLink="/officer/dashboard" routerLinkActive="active">Officer Dashboard</a></li>
              <li><a routerLink="/officer/assigned-complaints" routerLinkActive="active">Assigned</a></li>
            </ng-container>
            <ng-container *ngIf="auth.getRole() === 'ADMIN'">
              <li><a routerLink="/admin/dashboard" routerLinkActive="active">Admin Panel</a></li>
            </ng-container>
          </ng-container>
        </ul>

        <div class="nav-actions">
          <ng-container *ngIf="!auth.isLoggedIn(); else userBlock">
            <a routerLink="/auth/login" class="btn btn-outline-nav">Login</a>
            <a routerLink="/auth/register" class="btn btn-primary btn-sm">Register</a>
          </ng-container>
          <ng-template #userBlock>
            <div class="user-menu" (click)="toggleUserMenu()" [class.open]="userMenuOpen">
              <div class="user-avatar">{{ getInitials() }}</div>
              <div class="user-info">
                <span class="user-name">{{ auth.currentUser()?.name }}</span>
                <span class="user-role">{{ auth.currentUser()?.role | titlecase }}</span>
              </div>
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M6 9l6 6 6-6"/>
              </svg>
              <div class="user-dropdown">
                <div class="dropdown-header">
                  <strong>{{ auth.currentUser()?.name }}</strong>
                  <small>{{ auth.currentUser()?.email }}</small>
                </div>
                <div class="dropdown-divider"></div>
                
                <a routerLink="/notifications" class="dropdown-item" (click)="userMenuOpen = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                  Notifications
                  <span *ngIf="unreadNotifications > 0" style="margin-left:auto; background:var(--danger); color:white; font-size:0.65rem; font-weight:800; padding:1px 7px; border-radius:20px;">
                    {{ unreadNotifications }}
                  </span>
                </a>

                <a routerLink="/profile" class="dropdown-item" (click)="userMenuOpen = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  My Profile
                </a>
                <button class="dropdown-item logout" (click)="logout()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  Sign Out
                </button>
              </div>
            </div>
          </ng-template>
        </div>

        <button class="hamburger" (click)="toggleMenu()" [class.open]="menuOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: var(--nav-height);
      background: var(--primary);
      transition: all 0.3s ease;
      border-bottom: 1px solid rgba(255,255,255,0.1);

      &.scrolled {
        box-shadow: 0 2px 20px rgba(0,0,0,0.2);
        background: var(--primary-dark);
      }
    }

    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      flex-shrink: 0;

      .logo-emblem {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo-text {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .logo-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.3px;
        }

        .logo-subtitle {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.65);
          font-weight: 500;
          letter-spacing: 0.5px;
        }
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      list-style: none;
      margin: 0;
      padding: 0;

      li a {
        display: block;
        padding: 8px 14px;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(255,255,255,0.8);
        border-radius: var(--radius);
        transition: all 0.2s;
        text-decoration: none;
        white-space: nowrap;

        &:hover, &.active {
          color: white;
          background: rgba(255,255,255,0.12);
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      margin-left: auto;

      .btn-outline-nav {
        padding: 8px 20px;
        font-size: 0.875rem;
        font-weight: 600;
        border: 1.5px solid rgba(255,255,255,0.6);
        border-radius: var(--radius);
        color: white;
        background: transparent;
        transition: all 0.2s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;

        &:hover {
          background: rgba(255,255,255,0.12);
          border-color: white;
        }
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px 6px 8px;
      border-radius: 40px;
      border: 1.5px solid rgba(255,255,255,0.25);
      cursor: pointer;
      transition: all 0.2s;
      position: relative;

      &:hover, &.open {
        background: rgba(255,255,255,0.12);
        border-color: rgba(255,255,255,0.5);
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--secondary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        font-weight: 700;
        flex-shrink: 0;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .user-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: white;
        }

        .user-role {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      .chevron {
        color: rgba(255,255,255,0.7);
        transition: transform 0.2s;
      }

      &.open .chevron { transform: rotate(180deg); }

      .user-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        background: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        min-width: 220px;
        border: 1px solid var(--border);
        display: none;
        overflow: hidden;
        animation: fadeIn 0.15s ease;

        .dropdown-header {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;

          strong { font-size: 0.9rem; color: var(--text-primary); }
          small  { font-size: 0.78rem; color: var(--text-muted); }
        }

        .dropdown-divider { height: 1px; background: var(--border); }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: none;
          border: none;
          width: 100%;
          text-decoration: none;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s;

          &:hover { background: var(--bg-muted); }
          &.logout { color: var(--danger); }
        }
      }

      &.open .user-dropdown { display: block; }
    }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      margin-left: auto;

      span {
        display: block;
        width: 22px;
        height: 2px;
        background: white;
        border-radius: 2px;
        transition: all 0.3s;
      }

      &.open {
        span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        span:nth-child(2) { opacity: 0; }
        span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
      }
    }

    @media (max-width: 1024px) {
      .nav-links li a { padding: 7px 10px; font-size: 0.82rem; }
    }

    @media (max-width: 768px) {
      .hamburger { display: flex; }
      .nav-actions .btn-outline-nav, .nav-actions .btn { display: none; }

      .user-menu {
        .user-info { display: none; }
        .chevron { display: none; }
      }

      .nav-links {
        display: none;
        position: fixed;
        top: var(--nav-height);
        left: 0; right: 0;
        background: var(--primary-dark);
        flex-direction: column;
        align-items: stretch;
        padding: 16px;
        gap: 4px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        border-top: 1px solid rgba(255,255,255,0.1);

        &.open { display: flex; }

        li a { padding: 12px 16px; border-radius: var(--radius); }
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  menuOpen = false;
  userMenuOpen = false;
  unreadNotifications = 0;

  constructor(
    public auth: AuthService,
    private notifService: NotificationService
  ) { }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.loadUnreadCount();
    }
  }

  loadUnreadCount(): void {
    this.notifService.getUnreadCount().subscribe({
      next: (res) => this.unreadNotifications = res.count,
      error: () => { } // silent
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }
  toggleUserMenu() { this.userMenuOpen = !this.userMenuOpen; }

  getInitials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  logout() {
    this.userMenuOpen = false;
    this.auth.logout();
  }
}