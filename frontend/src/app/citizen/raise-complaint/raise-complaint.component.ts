import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-raise-complaint',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/citizen/dashboard">Dashboard</a>
          <span>›</span>
          <span>Raise Complaint</span>
        </div>
        <h1>Raise a New Complaint</h1>
        <p>Fill in the details below. All fields marked with * are required.</p>
      </div>
    </div>

    <div class="container" style="padding-top:32px; padding-bottom:48px;">
      <div class="complaint-layout">
        <!-- Form -->
        <div class="complaint-form-wrapper">

          <div *ngIf="successMsg" class="alert alert-success" style="margin-bottom:20px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div>
              <strong>Complaint Submitted Successfully!</strong>
              <div>{{ successMsg }}</div>
            </div>
          </div>

          <form [formGroup]="complaintForm" (ngSubmit)="onSubmit()">

            <!-- SECTION 1: Basic Info -->
            <div class="form-section">
              <div class="form-section-header">
                <div class="section-num">01</div>
                <div>
                  <div class="section-title">Basic Information</div>
                  <div class="section-subtitle">Provide a clear title and description of your complaint</div>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group span-full">
                  <label for="title">Complaint Title <span class="required">*</span></label>
                  <input id="title" type="text" formControlName="title"
                    class="form-control" placeholder="e.g., Large pothole on 5th Main Road near SBI ATM"
                    [class.is-invalid]="isInvalid('title')" />
                  <div class="char-count">{{ complaintForm.get('title')?.value?.length ?? 0 }}/100</div>
                  <span *ngIf="isInvalid('title')" class="error-message">Please enter a descriptive title (min 10 characters).</span>
                </div>

                <div class="form-group">
                  <label for="category">Department / Category <span class="required">*</span></label>
                    <select id="category" formControlName="category" class="form-control"
                    [class.is-invalid]="isInvalid('category')">
                    <option value="" disabled>Select department</option>
                    <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                  </select>
                  <span *ngIf="isInvalid('category')" class="error-message">Please select a category.</span>
                </div>

                <div class="form-group">
                  <label for="priority">Priority Level <span class="required">*</span></label>
                  <select id="priority" formControlName="priority" class="form-control"
                    [class.is-invalid]="isInvalid('priority')">
                    <option value="" disabled>Select priority</option>
                    <option value="LOW">🟢 Low — Non-urgent issue</option>
                    <option value="MEDIUM">🟡 Medium — Moderate inconvenience</option>
                    <option value="HIGH">🔴 High — Causing significant disruption</option>
                    <option value="URGENT">🚨 Urgent — Safety hazard / Emergency</option>
                  </select>
                  <span *ngIf="isInvalid('priority')" class="error-message">Please select a priority level.</span>
                </div>

                <div class="form-group span-full">
                  <label for="description">Detailed Description <span class="required">*</span></label>
                  <textarea id="description" formControlName="description"
                    class="form-control" rows="5"
                    placeholder="Describe the issue in detail. Include when it started, how it affects you, and any prior attempts to report it."
                    [class.is-invalid]="isInvalid('description')"></textarea>
                  <div class="char-count">{{ complaintForm.get('description')?.value?.length ?? 0 }}/1000</div>
                  <span *ngIf="isInvalid('description')" class="error-message">Please provide a detailed description (min 30 characters).</span>
                </div>
              </div>
            </div>

            <!-- SECTION 2: Location -->
            <div class="form-section">
              <div class="form-section-header">
                <div class="section-num">02</div>
                <div>
                  <div class="section-title">Location Details</div>
                  <div class="section-subtitle">Help us locate the issue precisely</div>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group span-full">
                  <label for="address">Full Address <span class="required">*</span></label>
                  <input id="address" type="text" formControlName="address"
                    class="form-control" placeholder="House no., Street, Area, Landmark, PIN"
                    [class.is-invalid]="isInvalid('address')" />
                  <span *ngIf="isInvalid('address')" class="error-message">Please enter the address.</span>
                </div>

                <div class="form-group">
                  <label for="ward">Ward / Zone</label>
                  <select id="ward" formControlName="ward" class="form-control">
                    <option value="" disabled>Select ward</option>
                    <option>Ward 1 - Kempegowda Nagar</option>
                    <option>Ward 65 - Shivajinagar</option>
                    <option>Ward 81 - Indiranagar</option>
                    <option>Ward 84 - Whitefield</option>
                    <option>Ward 155 - Jayanagar</option>
                    <option>Ward 174 - HSR Layout</option>
                    <option>Ward 198 - Koramangala</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>GPS Coordinates</label>
                  <div class="location-row">
                    <input type="text" formControlName="latitude"
                      class="form-control" placeholder="Latitude" readonly />
                    <input type="text" formControlName="longitude"
                      class="form-control" placeholder="Longitude" readonly />
                    <button type="button" class="btn btn-secondary btn-sm location-btn" (click)="captureLocation()">
                      <ng-container *ngIf="locating; else pinIcon">
                        <span class="spinner-sm"></span>
                      </ng-container>
                      <ng-template #pinIcon>📍</ng-template>
                      {{ locating ? 'Locating...' : 'Capture' }}
                    </button>
                  </div>
                  <div *ngIf="locationCaptured" class="location-success">✅ Location captured successfully!</div>
                  <span class="hint">Click "Capture" to automatically fill your GPS coordinates.</span>
                </div>
              </div>
            </div>

            <!-- SECTION 3: Evidence -->
            <div class="form-section">
              <div class="form-section-header">
                <div class="section-num">03</div>
                <div>
                  <div class="section-title">Evidence & Attachments</div>
                  <div class="section-subtitle">Upload photos or provide image URLs to support your complaint</div>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group span-full">
                  <label for="imageUrl">Image URL (optional)</label>
                  <input id="imageUrl" type="url" formControlName="imageUrl"
                    class="form-control" placeholder="https://example.com/photo.jpg" />
                  <span class="hint">Paste a public URL of the image showing the issue.</span>
                </div>

                <div class="form-group span-full">
                  <label>Upload Photos (optional)</label>
                  <div class="file-drop-zone" (click)="fileInput.click()"
                    (dragover)="$event.preventDefault()"
                    (drop)="onFileDrop($event)">
                    <div class="drop-icon">📁</div>
                    <div class="drop-text">
                      <strong>Click to upload or drag & drop</strong>
                      <span>Supports JPG, PNG, HEIC — Max 5MB per file</span>
                    </div>
                    <input #fileInput type="file" accept="image/*" multiple style="display:none" (change)="onFileSelect($event)" />
                  </div>
                  <div *ngIf="selectedFiles.length > 0" class="file-list">
                    <div *ngFor="let f of selectedFiles" class="file-item">
                      <span>🖼️ {{ f.name }}</span>
                      <span class="file-size">{{ (f.size / 1024).toFixed(0) }} KB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 4: Declaration -->
            <div class="form-section">
              <div class="form-section-header">
                <div class="section-num">04</div>
                <div>
                  <div class="section-title">Declaration</div>
                  <div class="section-subtitle">Please confirm before submitting</div>
                </div>
              </div>

              <div class="declaration-box">
                <label class="declaration-check">
                  <input type="checkbox" formControlName="declaration" />
                  <span>
                    I hereby declare that the information provided in this complaint is true and accurate to the best of my knowledge. I understand that filing false complaints is a punishable offence under applicable law. I consent to the processing of my personal data for grievance resolution purposes.
                  </span>
                </label>
              </div>
            </div>

            <!-- Submit -->
            <div class="form-actions">
              <a routerLink="/citizen/dashboard" class="btn btn-outline">Cancel</a>
              <button type="submit" class="btn btn-secondary" [disabled]="loading">
                <ng-container *ngIf="loading; else submitLabel">
                  <span class="spinner-sm"></span> Submitting...
                </ng-container>
                <ng-template #submitLabel>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Submit Complaint
                </ng-template>
              </button>
            </div>
          </form>
        </div>

        <!-- Sidebar Info -->
        <aside class="complaint-sidebar">
          <!-- Tips -->
          <div class="side-card">
            <h4>💡 Tips for a Good Complaint</h4>
            <ul class="tip-list">
              <li>Be specific about the location — include landmarks and street names.</li>
              <li>Mention when the issue started and how it affects daily life.</li>
              <li>Attach clear, well-lit photos for faster resolution.</li>
              <li>Select the correct department for faster routing.</li>
              <li>Use URGENT priority only for genuine safety hazards.</li>
            </ul>
          </div>

          <!-- SLA Info -->
            <div class="side-card sla-card">
            <h4>⏱️ Resolution Timelines (SLA)</h4>
            <div class="sla-list">
                <div *ngFor="let sla of slaData" class="sla-item">
                  <span class="sla-dept">{{ sla.dept }}</span>
                  <span class="sla-days" [class]="sla.level">{{ sla.days }}</span>
                </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="side-card contact-card">
            <h4>📞 Need Help?</h4>
            <p>For emergency civic issues, call our 24×7 helpline:</p>
            <a href="tel:1800-425-0029" class="helpline-num">1800-425-0029</a>
            <p class="toll-free">Toll Free · Available 24/7</p>
            <a href="mailto:support@civicconnect.kar.gov.in" class="email-link">
              support&#64;civicconnect.kar.gov.in
            </a>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .complaint-layout {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 24px;
      align-items: flex-start;

      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }

    .form-section {
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      overflow: hidden;
      margin-bottom: 20px;
    }

    .form-section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      background: #f8faff;
      border-bottom: 1px solid var(--border);

      .section-num {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.85rem; font-weight: 800;
        flex-shrink: 0;
      }

      .section-title   { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
      .section-subtitle { font-size: 0.8rem; color: var(--text-muted); }
    }

    .form-grid {
      padding: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      .span-full { grid-column: 1 / -1; }

      @media (max-width: 600px) { grid-template-columns: 1fr; .span-full { grid-column: 1; } }
    }

    .char-count {
      font-size: 0.72rem; color: var(--text-light);
      text-align: right; margin-top: 3px;
    }

    .location-row {
      display: flex; gap: 8px;
      .form-control { flex: 1; min-width: 0; }
      .location-btn { flex-shrink: 0; white-space: nowrap; }
    }

    .location-success {
      font-size: 0.78rem; color: var(--secondary);
      font-weight: 600; margin-top: 6px;
    }

    .file-drop-zone {
      border: 2px dashed var(--border);
      border-radius: var(--radius-md);
      padding: 36px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--bg-muted);

      &:hover {
        border-color: var(--primary);
        background: rgba(31,60,136,0.03);
      }

      .drop-icon { font-size: 2rem; margin-bottom: 10px; }

      .drop-text {
        display: flex; flex-direction: column; gap: 4px;
        strong { font-size: 0.875rem; color: var(--text-primary); }
        span   { font-size: 0.78rem; color: var(--text-muted); }
      }
    }

    .file-list {
      margin-top: 10px;
      display: flex; flex-direction: column; gap: 6px;

      .file-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 8px 12px;
        background: #f0f4ff; border-radius: var(--radius);
        font-size: 0.8rem; color: var(--text-secondary);
        .file-size { color: var(--text-muted); }
      }
    }

    .declaration-box {
      padding: 24px;

      .declaration-check {
        display: flex; align-items: flex-start; gap: 12px; cursor: pointer;
        input { margin-top: 3px; accent-color: var(--primary); flex-shrink: 0; }
        span  { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.65; }
      }
    }

    .form-actions {
      display: flex; align-items: center; justify-content: flex-end;
      gap: 12px; padding-top: 8px;

      @media (max-width: 480px) { flex-direction: column; .btn { width: 100%; justify-content: center; } }
    }

    /* Sidebar */
    .side-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      margin-bottom: 16px;

      h4 { font-size: 0.95rem; margin-bottom: 14px; color: var(--text-primary); }
    }

    .tip-list {
      display: flex; flex-direction: column; gap: 10px;
      padding-left: 0;

      li {
        font-size: 0.8rem; color: var(--text-secondary);
        padding-left: 14px; position: relative; line-height: 1.5;
        &::before {
          content: '›';
          position: absolute; left: 0;
          color: var(--secondary); font-weight: 700;
        }
      }
    }

    .sla-card {
      border-top: 3px solid var(--secondary);

      .sla-list { display: flex; flex-direction: column; gap: 8px; }

      .sla-item {
        display: flex; align-items: center; justify-content: space-between;
        font-size: 0.8rem;

        .sla-dept { color: var(--text-secondary); }
        .sla-days {
          font-weight: 700; font-size: 0.75rem;
          padding: 2px 8px; border-radius: 20px;
          &.fast   { background: #d1fae5; color: #065f46; }
          &.medium { background: #fef3c7; color: #92400e; }
          &.slow   { background: #fee2e2; color: #991b1b; }
        }
      }
    }

    .contact-card {
      border-top: 3px solid var(--primary);

      p { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px; }

      .helpline-num {
        display: block;
        font-size: 1.4rem; font-weight: 800; color: var(--primary);
        text-decoration: none; margin-bottom: 4px;
        &:hover { color: var(--primary-light); }
      }

      .toll-free { font-size: 0.72rem; margin-bottom: 12px; }

      .email-link {
        font-size: 0.78rem; color: var(--secondary);
        text-decoration: none; font-weight: 600;
        &:hover { text-decoration: underline; }
      }
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
export class RaiseComplaintComponent {
  complaintForm: FormGroup;
  loading = false;
  successMsg = '';
  locating = false;
  locationCaptured = false;
  selectedFiles: File[] = [];

  categories = [
    'Roads & Infrastructure', 'Water & Sanitation', 'Electricity',
    'Solid Waste Management', 'Parks & Recreation', 'Health & Sanitation',
    'Traffic & Transport', 'Building & Town Planning', 'Property Tax',
    'Street Lighting', 'Others',
  ];

  slaData = [
    { dept: 'Water Supply / BWSSB', days: '24–48 hrs', level: 'fast' },
    { dept: 'Electricity / BESCOM', days: '24 hrs', level: 'fast' },
    { dept: 'Roads & Potholes', days: '3–5 days', level: 'medium' },
    { dept: 'Garbage Collection', days: '1–2 days', level: 'fast' },
    { dept: 'Street Lighting', days: '3 days', level: 'medium' },
    { dept: 'Health & Sanitation', days: '5–7 days', level: 'slow' },
    { dept: 'Building / Planning', days: '15 days', level: 'slow' },
  ];

  constructor(private fb: FormBuilder, public auth: AuthService) {
    this.complaintForm = this.fb.group({
      title:       ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      category:    ['', Validators.required],
      priority:    ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(30)]],
      address:     ['', Validators.required],
      ward:        [''],
      latitude:    [''],
      longitude:   [''],
      imageUrl:    [''],
      declaration: [false],
    });
  }

  isInvalid(f: string): boolean {
    const ctrl = this.complaintForm.get(f);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  captureLocation() {
    this.locating = true;
    setTimeout(() => {
      this.complaintForm.patchValue({ latitude: '12.9784', longitude: '77.6408' });
      this.locating = false;
      this.locationCaptured = true;
    }, 1500);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.selectedFiles = Array.from(input.files);
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) this.selectedFiles = Array.from(files);
  }

  onSubmit() {
    this.complaintForm.markAllAsTouched();
    if (this.complaintForm.invalid) return;
    this.loading = true;
    setTimeout(() => {
      const ticketNo = `GRV-2024-${String(Math.floor(Math.random() * 900) + 100).padStart(5, '0')}`;
      this.successMsg = `Your complaint has been submitted. Ticket Number: ${ticketNo}. You will receive an SMS confirmation shortly.`;
      this.complaintForm.reset();
      this.loading = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }
}
