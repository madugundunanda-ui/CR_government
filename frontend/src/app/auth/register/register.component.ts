import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl) {
  const pwd = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (pwd && confirm && pwd !== confirm) {
    control.get('confirmPassword')?.setErrors({ mismatch: true });
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="register-page">
      <div class="register-bg">
        <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80" alt="City" />
        <div class="reg-overlay"></div>
      </div>

      <div class="register-layout">
        <div class="reg-left">
          <div class="reg-brand">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
              <circle cx="24" cy="24" r="23" stroke="white" stroke-width="2"/>
              <path d="M24 10L34 17V33H14V17L24 10Z" fill="white" opacity="0.9"/>
              <rect x="19" y="25" width="10" height="8" fill="rgba(31,60,136,0.9)" rx="1"/>
            </svg>
            <div>
              <div class="rg-title">CivicConnect</div>
              <div class="rg-sub">Citizen Registration Portal</div>
            </div>
          </div>

          <h2 class="reg-heading">Join 1.2 Lakh+<br>Citizens Already<br>Making a Difference</h2>

          <div class="reg-benefits">
            <div class="benefit">
              <div class="benefit-icon">✅</div>
              <div>
                <strong>Free Registration</strong>
                <p>No fees. No paperwork. Register online in 2 minutes.</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">📱</div>
              <div>
                <strong>Multi-channel Tracking</strong>
                <p>Track your complaints via web, app, SMS or WhatsApp.</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">🔔</div>
              <div>
                <strong>Real-time Notifications</strong>
                <p>Get instant updates at every stage of resolution.</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">🏛️</div>
              <div>
                <strong>Legally Backed</strong>
                <p>Every complaint is mandated to be addressed within SLA timelines.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="reg-right">
          <div class="reg-card">
            <div class="reg-card-header">
              <h2>Create Account</h2>
              <p>Register to access government services and raise civic complaints</p>
            </div>

            <div *ngIf="successMsg" class="alert alert-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {{ successMsg }} <a routerLink="/auth/login">Login here →</a>
            </div>

            <div *ngIf="errorMsg" class="alert alert-danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              {{ errorMsg }}
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="reg-form">
              <div class="form-group">
                <label for="regRole">Registering As <span class="required">*</span></label>
                <select id="regRole" formControlName="role" class="form-control">
                  <option value="" disabled>Select role</option>
                  <option value="CITIZEN">🏠 Citizen</option>
                  <option value="OFFICER">👮 Municipal Officer (requires admin approval)</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="fullName">Full Name <span class="required">*</span></label>
                  <input id="fullName" type="text" formControlName="fullName"
                    class="form-control" placeholder="As per Identity Card"
                    [class.is-invalid]="isInvalid('fullName')" />
                  <span *ngIf="isInvalid('fullName')" class="error-message">Full name is required (min. 3 characters).</span>
                </div>

                <div class="form-group">
                  <label for="phone">Mobile Number <span class="required">*</span></label>
                  <div class="phone-input">
                    <span class="phone-prefix">+91</span>
                    <input id="phone" type="tel" formControlName="phone"
                      class="form-control" placeholder="10-digit mobile number"
                      [class.is-invalid]="isInvalid('phone')" maxlength="10" />
                  </div>
                  <span *ngIf="isInvalid('phone')" class="error-message">Enter a valid 10-digit mobile number.</span>
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email Address <span class="required">*</span></label>
                <input id="email" type="email" formControlName="email"
                  class="form-control" placeholder="your&#64;email.com"
                  [class.is-invalid]="isInvalid('email')" />
                <span *ngIf="isInvalid('email')" class="error-message">Please enter a valid email address.</span>
              </div>

              <div class="form-group">
                <label for="address">Residential Address <span class="required">*</span></label>
                <textarea id="address" formControlName="address"
                  class="form-control" placeholder="House No., Street, Area, City, PIN Code"
                  rows="2" [class.is-invalid]="isInvalid('address')"></textarea>
                <span *ngIf="isInvalid('address')" class="error-message">Please enter your residential address.</span>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="ward">Ward / Zone <span class="required">*</span></label>
                  <select id="ward" formControlName="ward" class="form-control" [class.is-invalid]="isInvalid('ward')">
                    <option value="" disabled>Select your ward</option>
                    <option>Ward 1 - Kempegowda Nagar</option>
                    <option>Ward 65 - Shivajinagar</option>
                    <option>Ward 81 - Indiranagar</option>
                    <option>Ward 84 - Whitefield</option>
                    <option>Ward 155 - Jayanagar</option>
                    <option>Ward 174 - HSR Layout</option>
                    <option>Ward 198 - Koramangala</option>
                  </select>
                  <span *ngIf="isInvalid('ward')" class="error-message">Please select your ward.</span>
                </div>

                <div class="form-group">
                  <label for="idType">ID Proof Type <span class="required">*</span></label>
                  <select id="idType" formControlName="idType" class="form-control" [class.is-invalid]="isInvalid('idType')">
                    <option value="" disabled>Select ID type</option>
                    <option value="AADHAAR">Aadhaar</option>
                    <option value="VOTER_ID">Voter ID</option>
                    <option value="PAN">PAN</option>
                    <option value="DRIVING_LICENSE">Driving Licence</option>
                    <option value="PASSPORT">Passport</option>
                  </select>
                  <span *ngIf="isInvalid('idType')" class="error-message">Please select your ID type.</span>
                </div>
              </div>

              <div class="form-group">
                <label for="idNumber">Identity Number <span class="required">*</span></label>
                <input
                  id="idNumber"
                  type="text"
                  formControlName="idNumber"
                  class="form-control"
                  [placeholder]="idNumberPlaceholder()"
                  [class.is-invalid]="isInvalid('idNumber')"
                />
                <span *ngIf="isInvalid('idNumber')" class="error-message">{{ idNumberErrorMessage() }}</span>
              </div>

              <div class="section-divider">
                <span>Set Account Password</span>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="password">Password <span class="required">*</span></label>
                  <div class="pwd-wrapper">
                    <input id="password" [type]="showPwd ? 'text' : 'password'"
                      formControlName="password" class="form-control"
                      placeholder="Min. 8 characters"
                      [class.is-invalid]="isInvalid('password')" />
                      <button type="button" class="toggle-pwd" (click)="togglePwd()">{{ showPwd ? '🙈' : '👁️' }}</button>
                  </div>
                    <span *ngIf="isInvalid('password')" class="error-message">Password must be at least 8 characters.</span>
                  <div class="pwd-strength">
                    <div class="strength-bars">
                        <div *ngFor="let bar of [1,2,3,4]" class="strength-bar" [class.active]="bar <= pwdStrength()"></div>
                    </div>
                    <span class="strength-label">{{ pwdStrengthLabel() }}</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="confirmPassword">Confirm Password <span class="required">*</span></label>
                  <div class="pwd-wrapper">
                    <input id="confirmPassword" [type]="showConfirm ? 'text' : 'password'"
                      formControlName="confirmPassword" class="form-control"
                      placeholder="Re-enter password"
                      [class.is-invalid]="isInvalidConfirm()" />
                    <button type="button" class="toggle-pwd" (click)="toggleConfirm()">{{ showConfirm ? '🙈' : '👁️' }}</button>
                  </div>
                  <span *ngIf="isInvalidConfirm()" class="error-message">Passwords do not match.</span>
                </div>
              </div>

              <div class="consent-section">
                <label class="consent-check">
                  <input type="checkbox" formControlName="consent" />
                  <span>
                    I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
                    I confirm that the information provided is accurate to the best of my knowledge.
                  </span>
                </label>
                <span *ngIf="registerForm.get('consent')?.invalid && registerForm.get('consent')?.touched" class="error-message">You must accept the terms to continue.</span>
              </div>

              <button type="submit" class="btn btn-primary btn-register" [disabled]="loading">
                <ng-container *ngIf="loading; else createLabel">
                  <span class="spinner-sm"></span> Creating Account...
                </ng-container>
                <ng-template #createLabel>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6"/></svg>
                  Create My Account
                </ng-template>
              </button>

              <div class="login-prompt">
                Already have an account? <a routerLink="/auth/login">Sign In →</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      position: relative;
      display: flex;

      .register-bg {
        position: fixed; inset: 0; z-index: 0;
        img { width: 100%; height: 100%; object-fit: cover; }
        .reg-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(13,27,62,0.96), rgba(31,60,136,0.88));
        }
      }
    }

    .register-layout {
      display: flex;
      width: 100%;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    .reg-left {
      flex: 1;
      padding: 60px 56px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: white;

      @media (max-width: 1024px) { display: none; }

      .reg-brand {
        display: flex; align-items: center; gap: 14px;
        margin-bottom: 40px;
        .rg-title { font-size: 1.25rem; font-weight: 800; color: white; }
        .rg-sub   { font-size: 0.72rem; color: rgba(255,255,255,0.5); }
      }

      .reg-heading {
        font-size: clamp(1.75rem, 2.5vw, 2.5rem);
        font-weight: 800;
        color: white;
        line-height: 1.2;
        margin-bottom: 36px;
        letter-spacing: -0.5px;
      }

      .reg-benefits {
        display: flex; flex-direction: column; gap: 20px;

        .benefit {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-md);
          transition: background 0.2s;

          &:hover { background: rgba(255,255,255,0.09); }

          .benefit-icon { font-size: 1.4rem; flex-shrink: 0; }

          strong { display: block; font-size: 0.9rem; color: white; margin-bottom: 3px; }
          p { font-size: 0.8rem; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.5; }
        }
      }
    }

    .reg-right {
      width: 580px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px 48px;
      background: rgba(255,255,255,0.03);
      border-left: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(20px);
      overflow-y: auto;

      @media (max-width: 1024px) { width: 100%; border: none; padding: 32px 24px; }
    }

    .reg-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: 32px;
      box-shadow: var(--shadow-xl);

      .reg-card-header {
        margin-bottom: 24px;
        h2 { font-size: 1.4rem; color: var(--text-primary); margin-bottom: 6px; }
        p  { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
      }
    }

    .reg-form { display: flex; flex-direction: column; gap: 16px; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .phone-input {
      display: flex;
      .phone-prefix {
        background: var(--bg-muted); border: 1.5px solid var(--border);
        border-right: none; border-radius: var(--radius) 0 0 var(--radius);
        padding: 0 12px; display: flex; align-items: center;
        font-size: 0.875rem; font-weight: 600; color: var(--text-secondary);
        white-space: nowrap; flex-shrink: 0;
      }
      .form-control { border-radius: 0 var(--radius) var(--radius) 0; }
    }

    .section-divider {
      display: flex; align-items: center; gap: 12px;
      color: var(--text-muted); font-size: 0.78rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.8px;
      &::before, &::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    }

    .pwd-wrapper {
      position: relative;
      .toggle-pwd {
        position: absolute; right: 10px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none; cursor: pointer; font-size: 1rem; padding: 4px;
      }
      .form-control { padding-right: 36px; }
    }

    .pwd-strength {
      margin-top: 6px; display: flex; align-items: center; gap: 8px;

      .strength-bars { display: flex; gap: 3px; }

      .strength-bar {
        width: 28px; height: 4px; border-radius: 4px;
        background: var(--border); transition: background 0.2s;

        &.active:nth-child(1) { background: #ef4444; }
        &.active:nth-child(2) { background: #f97316; }
        &.active:nth-child(3) { background: #eab308; }
        &.active:nth-child(4) { background: #22c55e; }
      }

      .strength-label { font-size: 0.72rem; color: var(--text-muted); }
    }

    .consent-section {
      background: var(--bg-muted);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px;

      .consent-check {
        display: flex; align-items: flex-start; gap: 10px; cursor: pointer;

        input { margin-top: 3px; accent-color: var(--primary); flex-shrink: 0; }

        span { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6; }

        a { color: var(--primary); font-weight: 600; text-decoration: none;
            &:hover { text-decoration: underline; } }
      }

      .error-message { display: block; margin-top: 6px; }
    }

    .btn-register {
      width: 100%; justify-content: center; padding: 14px; font-size: 0.95rem;
    }

    .login-prompt {
      text-align: center; font-size: 0.875rem; color: var(--text-muted);
      a { color: var(--primary); font-weight: 600; text-decoration: none;
          &:hover { text-decoration: underline; } }
    }

    .spinner-sm {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite; display: inline-block;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';
  showPwd = false;
  showConfirm = false;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.registerForm = this.fb.group({
      role: ['CITIZEN', Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      ward: ['', Validators.required],
      idType: ['', Validators.required],
      idNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      consent: [false, Validators.requiredTrue],
    }, { validators: passwordMatchValidator });

    this.registerForm.get('idType')?.valueChanges.subscribe(() => {
      this.applyIdentityValidators();
    });
    this.applyIdentityValidators();
  }

  private applyIdentityValidators(): void {
    const idType = this.registerForm.get('idType')?.value;
    const idCtrl = this.registerForm.get('idNumber');
    if (!idCtrl) return;

    const pattern = this.getIdentityPattern(idType);
    idCtrl.setValidators(pattern ? [Validators.required, Validators.pattern(pattern)] : [Validators.required]);
    idCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private getIdentityPattern(idType: string): RegExp | null {
    switch (idType) {
      case 'AADHAAR':
        return /^\d{12}$/;
      case 'PAN':
        return /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      case 'VOTER_ID':
        return /^[A-Z]{3}[0-9]{7}$/;
      case 'DRIVING_LICENSE':
        return /^[A-Z0-9]{10,18}$/;
      case 'PASSPORT':
        return /^[A-Z][0-9]{7}$/;
      default:
        return null;
    }
  }

  idNumberPlaceholder(): string {
    const idType = this.registerForm.get('idType')?.value;
    switch (idType) {
      case 'AADHAAR':
        return '12-digit Aadhaar number';
      case 'PAN':
        return 'ABCDE1234F';
      case 'VOTER_ID':
        return 'ABC1234567';
      case 'DRIVING_LICENSE':
        return 'Driving licence number';
      case 'PASSPORT':
        return 'A1234567';
      default:
        return 'Enter identity number';
    }
  }

  idNumberErrorMessage(): string {
    const idType = this.registerForm.get('idType')?.value;
    if (idType === 'AADHAAR') return 'Aadhaar must be exactly 12 digits.';
    if (idType === 'PAN') return 'PAN must be in format ABCDE1234F.';
    if (idType === 'VOTER_ID') return 'Voter ID must be in format ABC1234567.';
    if (idType === 'DRIVING_LICENSE') return 'Driving licence should be 10-18 alphanumeric characters.';
    if (idType === 'PASSPORT') return 'Passport must be in format A1234567.';
    return 'Please enter a valid identity number.';
  }

  isInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  isInvalidConfirm(): boolean {
    const ctrl = this.registerForm.get('confirmPassword');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  pwdStrength(): number {
    const pwd: string = this.registerForm.get('password')?.value ?? '';
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^a-zA-Z0-9]/.test(pwd)) s++;
    return s;
  }

  pwdStrengthLabel(): string {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[this.pwdStrength()];
  }

  onSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const { fullName, email, phone, address, password, role, idType, idNumber } = this.registerForm.value;
    this.auth.register({
      name: fullName,
      email,
      password,
      contactNumber: phone,
      address,
      role: role || 'CITIZEN',
      identityType: idType,
      identityNumber: idNumber,
    }).subscribe({
      next: (res) => {
        // Show appropriate message based on role
        if (this.registerForm.get('role')?.value === 'OFFICER') {
          this.successMsg = res.message || 'Registration submitted! Your account is awaiting admin approval. You will be able to log in once approved.';
        } else {
          this.successMsg = res.message || 'Registration successful! You can now log in.';
        }
        this.registerForm.reset();
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.message || 'Unable to register. Please try again.';
        this.loading = false;
      }
    });
  }

  togglePwd() { this.showPwd = !this.showPwd; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }
}