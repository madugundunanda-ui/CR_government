import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="login-page">
      <!-- Background -->
      <div class="login-bg">
        <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80" alt="City" />
        <div class="login-overlay"></div>
      </div>

      <div class="login-layout">
        <!-- Left Panel -->
        <div class="login-left">
          <div class="login-brand">
            <div class="brand-logo">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
                <circle cx="24" cy="24" r="23" stroke="white" stroke-width="2"/>
                <path d="M24 10L34 17V33H14V17L24 10Z" fill="white" opacity="0.9"/>
                <rect x="19" y="25" width="10" height="8" fill="rgba(31,60,136,0.9)" rx="1"/>
                <circle cx="24" cy="18" r="3" fill="rgba(31,60,136,0.9)"/>
              </svg>
            </div>
            <div class="brand-text">
              <div class="brand-name">CivicConnect</div>
              <div class="brand-sub">Government of Karnataka</div>
            </div>
          </div>

          <h1 class="left-title">Your Civic Voice,<br>Heard & Resolved.</h1>
          <p class="left-desc">
            Access the official citizen grievance portal to raise complaints, track resolution status, and engage with your municipal services seamlessly.
          </p>

          <div class="left-stats">
            <div class="ls-item">
              <div class="ls-num">48K+</div>
              <div class="ls-label">Complaints Resolved</div>
            </div>
            <div class="ls-divider"></div>
            <div class="ls-item">
              <div class="ls-num">92%</div>
              <div class="ls-label">SLA Success Rate</div>
            </div>
            <div class="ls-divider"></div>
            <div class="ls-item">
              <div class="ls-num">24+</div>
              <div class="ls-label">Departments</div>
            </div>
          </div>

          <div class="left-badges">
            <span>🔒 SSL Encrypted</span>
            <span>🏛️ Official Portal</span>
            <span>🌐 GIGW Compliant</span>
          </div>
        </div>

        <!-- Right Panel: Form -->
        <div class="login-right">
          <div class="login-card">
            <div class="login-card-header">
              <h2>Sign In to Portal</h2>
              <p>Enter your credentials to access the civic services portal</p>
            </div>

            <!-- Demo Credentials Box -->
            <div class="demo-box">
              <div class="demo-title">🔑 Demo Credentials</div>
              <div class="demo-grid">
                <div class="demo-item" (click)="fillDemo('citizen')">
                  <span class="demo-role citizen">Citizen</span>
                  <span class="demo-email">citizen&#64;demo.com</span>
                </div>
                <div class="demo-item" (click)="fillDemo('officer')">
                  <span class="demo-role officer">Officer</span>
                  <span class="demo-email">officer&#64;demo.com</span>
                </div>
                <div class="demo-item" (click)="fillDemo('admin')">
                  <span class="demo-role admin">Admin</span>
                  <span class="demo-email">admin&#64;demo.com</span>
                </div>
              </div>
              <div class="demo-note">Password for all: <strong>demo123</strong> · Click to auto-fill</div>
            </div>

            <div *ngIf="errorMsg" class="alert alert-danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              {{ errorMsg }}
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <!-- Role -->
              <div class="form-group">
                <label for="role">Login As <span class="required">*</span></label>
                <select id="role" formControlName="role" class="form-control"
                  [class.is-invalid]="isInvalid('role')">
                  <option value="" disabled>Select your role</option>
                  <option value="citizen">🏠 Citizen</option>
                  <option value="officer">👮 Field Officer</option>
                  <option value="admin">⚙️ Administrator</option>
                </select>
                <span *ngIf="isInvalid('role')" class="error-message">Please select your role.</span>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label for="email">Email Address <span class="required">*</span></label>
                <div class="input-with-icon">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input id="email" type="email" formControlName="email"
                    class="form-control" placeholder="yourname&#64;email.com"
                    [class.is-invalid]="isInvalid('email')" />
                </div>
                <span *ngIf="isInvalid('email')" class="error-message">Please enter a valid email address.</span>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label for="password">Password <span class="required">*</span></label>
                <div class="input-with-icon">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  <input id="password" [type]="showPwd ? 'text' : 'password'"
                    formControlName="password" class="form-control"
                    placeholder="Enter your password"
                    [class.is-invalid]="isInvalid('password')" />
                  <button type="button" class="toggle-pwd" (click)="togglePwd()">
                    {{ showPwd ? '🙈' : '👁️' }}
                  </button>
                </div>
                <span *ngIf="isInvalid('password')" class="error-message">Password is required.</span>
              </div>

              <div class="form-extras">
                <label class="checkbox-label">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" class="forgot-link">Forgot Password?</a>
              </div>

              <button type="submit" class="btn btn-primary btn-login" [disabled]="loading">
                <ng-container *ngIf="loading; else readyLabel">
                  <span class="spinner-sm"></span> Signing In...
                </ng-container>
                <ng-template #readyLabel>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                  Sign In to Portal
                </ng-template>
              </button>

              <div class="login-divider"><span>OR</span></div>

              <div class="register-prompt">
                New citizen? <a routerLink="/auth/register">Create an Account →</a>
              </div>
            </form>
          </div>

          <div class="login-footer-note">
            By signing in, you agree to the
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a> of the Government of Karnataka.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      position: relative;
      display: flex;

      .login-bg {
        position: fixed;
        inset: 0;
        z-index: 0;

        img { width: 100%; height: 100%; object-fit: cover; }

        .login-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg,
            rgba(13,27,62,0.97) 0%,
            rgba(31,60,136,0.85) 100%
          );
        }
      }
    }

    .login-layout {
      display: flex;
      width: 100%;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    .login-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 64px;
      color: white;

      @media (max-width: 900px) { display: none; }

      .login-brand {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 48px;

        .brand-name { font-size: 1.25rem; font-weight: 800; color: white; }
        .brand-sub  { font-size: 0.72rem; color: rgba(255,255,255,0.55); }
      }

      .left-title {
        font-size: clamp(2rem, 3vw, 2.75rem);
        font-weight: 800;
        color: white;
        line-height: 1.2;
        margin-bottom: 20px;
        letter-spacing: -0.5px;
      }

      .left-desc {
        font-size: 1rem;
        color: rgba(255,255,255,0.65);
        line-height: 1.75;
        margin-bottom: 48px;
        max-width: 440px;
      }

      .left-stats {
        display: flex;
        align-items: center;
        gap: 24px;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: var(--radius-lg);
        padding: 24px 28px;
        margin-bottom: 24px;
        backdrop-filter: blur(10px);

        .ls-item { text-align: center; }

        .ls-num {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
          margin-bottom: 4px;
        }

        .ls-label { font-size: 0.75rem; color: rgba(255,255,255,0.55); font-weight: 500; }

        .ls-divider {
          width: 1px; height: 48px;
          background: rgba(255,255,255,0.15);
        }
      }

      .left-badges {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        span {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 5px 12px;
          border-radius: 20px;
          font-weight: 500;
        }
      }
    }

    .login-right {
      width: 520px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px 48px;
      background: rgba(255,255,255,0.03);
      border-left: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(20px);

      @media (max-width: 900px) { width: 100%; padding: 32px 24px; border: none; }
    }

    .login-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: 36px;
      box-shadow: var(--shadow-xl);

      .login-card-header {
        margin-bottom: 24px;

        h2 { font-size: 1.5rem; color: var(--text-primary); margin-bottom: 6px; }
        p  { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
      }
    }

    .demo-box {
      background: #f0f4ff;
      border: 1px solid #d0dafe;
      border-radius: var(--radius-md);
      padding: 14px 16px;
      margin-bottom: 20px;

      .demo-title {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .demo-grid {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }

      .demo-item {
        display: flex;
        align-items: center;
        gap: 8px;
        background: white;
        border: 1px solid #d0dafe;
        border-radius: var(--radius);
        padding: 7px 12px;
        cursor: pointer;
        transition: all 0.15s;
        flex: 1;
        min-width: 130px;

        &:hover {
          border-color: var(--primary);
          background: #eef2ff;
          transform: translateY(-1px);
        }

        .demo-role {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.3px;

          &.citizen { background: #d1fae5; color: #065f46; }
          &.officer  { background: #dbeafe; color: #1e40af; }
          &.admin    { background: #fef3c7; color: #92400e; }
        }

        .demo-email { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      }

      .demo-note {
        font-size: 0.72rem;
        color: var(--text-muted);
        strong { color: var(--primary); }
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .input-with-icon {
      position: relative;

      .input-icon {
        position: absolute;
        left: 12px; top: 50%;
        transform: translateY(-50%);
        color: var(--text-light);
        pointer-events: none;
      }

      .form-control { padding-left: 38px; }

      .toggle-pwd {
        position: absolute;
        right: 10px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none;
        font-size: 1rem; cursor: pointer;
        padding: 4px;
      }
    }

    .form-extras {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: -6px;

      .checkbox-label {
        display: flex; align-items: center; gap: 8px;
        font-size: 0.82rem; color: var(--text-secondary);
        cursor: pointer;
        input { cursor: pointer; accent-color: var(--primary); }
      }

      .forgot-link {
        font-size: 0.82rem; color: var(--primary); font-weight: 600;
        text-decoration: none;
        &:hover { text-decoration: underline; }
      }
    }

    .btn-login {
      width: 100%;
      justify-content: center;
      padding: 14px;
      font-size: 0.95rem;
      border-radius: var(--radius);
      margin-top: 4px;
    }

    .login-divider {
      text-align: center;
      position: relative;
      color: var(--text-light);
      font-size: 0.8rem;

      &::before, &::after {
        content: '';
        position: absolute;
        top: 50%; width: 42%; height: 1px;
        background: var(--border);
      }
      &::before { left: 0; }
      &::after  { right: 0; }

      span { background: white; padding: 0 12px; }
    }

    .register-prompt {
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);

      a { color: var(--primary); font-weight: 600; text-decoration: none;
          &:hover { text-decoration: underline; } }
    }

    .spinner-sm {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    .login-footer-note {
      text-align: center;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.35);
      margin-top: 20px;
      line-height: 1.6;

      a { color: rgba(255,255,255,0.5); text-decoration: none;
          &:hover { color: white; } }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMsg = '';
  showPwd = false;

  constructor(private fb: FormBuilder, public auth: AuthService) {
    this.loginForm = this.fb.group({
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  fillDemo(role: UserRole) {
    const map: Record<UserRole, string> = {
      citizen: 'citizen@demo.com',
      officer: 'officer@demo.com',
      admin: 'admin@demo.com',
    };
    this.loginForm.patchValue({ role, email: map[role], password: 'demo123' });
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    setTimeout(() => {
      const { role, email, password } = this.loginForm.value;
      const result = this.auth.login(email, password, role);
      if (!result.success) this.errorMsg = result.message;
      this.loading = false;
    }, 800);
  }

  togglePwd() {
    this.showPwd = !this.showPwd;
  }
}
