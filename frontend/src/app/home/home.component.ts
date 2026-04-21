import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { DepartmentService } from '../core/services/department.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FooterComponent, CommonModule],
  template: `
    <section class="hero">
      <div class="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80"
          alt="City skyline"
          class="hero-img"
        />
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content container">
        <div class="hero-badge">
          <span class="dot"></span>
          Official e-Governance Portal · Government of Karnataka
        </div>
        <h1 class="hero-title">
          Smart Civic Grievance<br>
          <span class="highlight">Management System</span>
        </h1>
        <p class="hero-subtitle">
          Raise complaints. Track progress. Improve your city.<br>
          Empowering citizens with transparent, accountable municipal services.
        </p>

        <div class="hero-actions">
          <a routerLink="/auth/login" class="btn btn-primary btn-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
            Login to Portal
          </a>
          <a routerLink="/auth/register" class="btn btn-outline-white btn-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6"/></svg>
            Register as Citizen
          </a>
        </div>

        <div class="hero-quick-track">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span>Track complaint status without login</span>
          <a href="#" class="track-link">Track Now →</a>
        </div>
      </div>

      <div class="hero-scroll-hint">
        <div class="scroll-dot"></div>
        <span>Scroll to explore</span>
      </div>
    </section>

    <div class="ticker-bar">
      <div class="ticker-label">📢 NOTICES</div>
      <div class="ticker-content">
        <span>System maintenance scheduled on Sunday 2:00 AM – 4:00 AM IST &nbsp;&nbsp;|&nbsp;&nbsp; New ward boundaries updated for Zones 1–5 &nbsp;&nbsp;|&nbsp;&nbsp; BBMP property tax last date extended to March 31, 2024 &nbsp;&nbsp;|&nbsp;&nbsp; Download CivicConnect mobile app for Android &nbsp;&nbsp;|&nbsp;&nbsp; Festive season special garbage collection schedule published</span>
      </div>
    </div>

    <section class="impact-section">
      <div class="container">
        <div class="section-header">
          <span class="overline">Our Impact</span>
          <h2>Serving Citizens Across Karnataka</h2>
          <p>Real-time data on complaints raised, resolved and citizen satisfaction across all municipal departments.</p>
        </div>

        <div class="stats-grid">
          <div class="impact-card">
            <div class="impact-icon" style="background: rgba(31,60,136,0.08); color: var(--primary);">📋</div>
            <div class="impact-number">48,329</div>
            <div class="impact-label">Total Complaints Resolved</div>
            <div class="impact-trend up">↑ 12% this month</div>
          </div>
          <div class="impact-card">
            <div class="impact-icon" style="background: rgba(42,157,143,0.08); color: var(--secondary);">🏢</div>
            <div class="impact-number">24</div>
            <div class="impact-label">Departments Covered</div>
            <div class="impact-trend up">All BBMP divisions</div>
          </div>
          <div class="impact-card">
            <div class="impact-icon" style="background: rgba(233,196,106,0.15); color: #b45309;">⚡</div>
            <div class="impact-number">92%</div>
            <div class="impact-label">SLA Compliance Rate</div>
            <div class="impact-trend up">↑ 4.2% from last year</div>
          </div>
          <div class="impact-card">
            <div class="impact-icon" style="background: rgba(69,123,157,0.1); color: var(--info);">⏱️</div>
            <div class="impact-number">3.4</div>
            <div class="impact-label">Avg. Resolution Days</div>
            <div class="impact-trend up">↓ Improved by 1.2 days</div>
          </div>
          <div class="impact-card">
            <div class="impact-icon" style="background: rgba(42,157,143,0.08); color: var(--secondary);">👥</div>
            <div class="impact-number">1.2L+</div>
            <div class="impact-label">Registered Citizens</div>
            <div class="impact-trend up">↑ 8,200 this quarter</div>
          </div>
          <div class="impact-card">
            <div class="impact-icon" style="background: rgba(230,57,70,0.08); color: var(--danger);">⭐</div>
            <div class="impact-number">4.6/5</div>
            <div class="impact-label">Citizen Satisfaction Score</div>
            <div class="impact-trend up">Based on 22,000+ ratings</div>
          </div>
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <div class="container">
        <div class="section-header">
          <span class="overline">Simple Process</span>
          <h2>File a Complaint in 3 Steps</h2>
          <p>Our streamlined process makes it easy to raise and track civic complaints from anywhere, anytime.</p>
        </div>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">01</div>
            <div class="step-icon">📝</div>
            <h3>Register & Submit</h3>
            <p>Create your free citizen account and fill out our structured complaint form with category, location and description.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-number">02</div>
            <div class="step-icon">🔍</div>
            <h3>Review & Assign</h3>
            <p>Our system automatically routes your complaint to the relevant department. A field officer is assigned within 24 hours.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-number">03</div>
            <div class="step-icon">✅</div>
            <h3>Track & Resolve</h3>
            <p>Get real-time SMS/email updates as your complaint progresses. Rate the resolution quality after closure.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="about-section" id="about">
      <div class="container">
        <div class="about-grid">
          <div class="about-image">
            <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&q=80" alt="Government service" loading="lazy" />
            <div class="about-image-badge">
              <div class="badge-number">Since 2020</div>
              <div class="badge-text">Serving Karnataka</div>
            </div>
          </div>
          <div class="about-content">
            <span class="overline">About the Platform</span>
            <h2>A Digital Bridge Between Citizens and Municipal Services</h2>
            <p>
              CivicConnect is an official e-Governance initiative by the Government of Karnataka, developed in partnership with the Bruhat Bengaluru Mahanagara Palike (BBMP) and powered by the National Informatics Centre (NIC). Our mission is to create a transparent, efficient and accountable channel for citizens to engage with their local government.
            </p>
            <p>
              The platform enables real-time tracking of complaints across 24+ departments including Roads, Water & Sanitation, Electricity, Solid Waste Management and more. Every complaint is assigned a unique ticket number, routed to the right department, and monitored for SLA compliance.
            </p>
            <p>
              CivicConnect upholds the principles of the Right to Information Act and the Citizens' Charter, ensuring that every registered complaint receives a mandated response within the prescribed timeline.
            </p>
            <div class="about-highlights">
              <div class="highlight-item">
                <div class="highlight-icon">🏛️</div>
                <div>
                  <strong>Government Certified</strong>
                  <p>Recognized under the National e-Governance Plan (NeGP)</p>
                </div>
              </div>
              <div class="highlight-item">
                <div class="highlight-icon">🔒</div>
                <div>
                  <strong>Secure & Compliant</strong>
                  <p>ISO 27001 certified, GIGW compliant, SSL encrypted</p>
                </div>
              </div>
              <div class="highlight-item">
                <div class="highlight-icon">📱</div>
                <div>
                  <strong>Multi-channel Access</strong>
                  <p>Web portal, mobile app, SMS and WhatsApp support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section" id="features">
      <div class="container">
        <div class="section-header">
          <span class="overline">Platform Features</span>
          <h2>Everything You Need, Nothing You Don't</h2>
          <p>Designed for citizens, managed by officers, governed by administrators — a complete civic management ecosystem.</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon" style="--ic: #e8f4fd; --ic-text: #1f3c88;">📋</div>
            <h4>Easy Grievance Filing</h4>
            <p>Structured complaint forms with category selection, photo upload, geo-location tagging and auto-fill support make filing effortless.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="--ic: #e8fdf8; --ic-text: #2a9d8f;">🔔</div>
            <h4>Real-time Updates</h4>
            <p>Get instant SMS, email and in-app notifications as your complaint moves through each stage of the resolution pipeline.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="--ic: #fff8e8; --ic-text: #b45309;">📍</div>
            <h4>Geo-location Support</h4>
            <p>Pinpoint the exact location of your complaint on an interactive map. Automatically captures GPS coordinates for field officers.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="--ic: #f3e8ff; --ic-text: #7c3aed;">🔐</div>
            <h4>Role-based Access</h4>
            <p>Distinct portals for Citizens, Field Officers and Administrators with appropriate permissions and workflow views.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="--ic: #fee2e2; --ic-text: #991b1b;">📊</div>
            <h4>Analytics Dashboard</h4>
            <p>Comprehensive reports on complaint trends, department performance, resolution rates and citizen satisfaction for administrators.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="--ic: #dcfce7; --ic-text: #166534;">⭐</div>
            <h4>Feedback & Rating</h4>
            <p>Rate the resolution quality and provide feedback after complaint closure. Helps improve service delivery over time.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="--ic: #e0f2fe; --ic-text: #0369a1;">🗂️</div>
            <h4>SLA Tracking</h4>
            <p>Automatic SLA monitoring with escalation alerts ensures no complaint is left unattended beyond the mandated timeline.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="--ic: #fef9c3; --ic-text: #854d0e;">📱</div>
            <h4>Mobile-first Design</h4>
            <p>Fully responsive web portal and dedicated mobile apps for Android and iOS ensure accessibility for all citizens.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="dept-section">
      <div class="container">
        <div class="section-header">
          <span class="overline">Departments</span>
          <h2>Complaints Covered Across All Departments</h2>
        </div>

        <div class="dept-grid">
          <div *ngFor="let dept of departments" class="dept-card">
            <div class="dept-icon">{{ dept.icon }}</div>
            <div class="dept-name">{{ dept.name }}</div>
            <div class="dept-count">{{ dept.count }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <span class="overline">Citizen Voices</span>
          <h2>What Citizens Are Saying</h2>
          <p>Real experiences from citizens who used CivicConnect to resolve their municipal issues.</p>
        </div>

        <div class="testimonials-grid">
          <div *ngFor="let t of testimonials" class="testimonial-card">
            <div class="testimonial-rating">
              <ng-container *ngFor="let star of [1,2,3,4,5]">
                <span class="star" [class.filled]="star <= t.rating">★</span>
              </ng-container>
            </div>
            <div class="quote-icon">"</div>
            <p class="testimonial-text">{{ t.text }}</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ t.initials }}</div>
              <div>
                <div class="author-name">{{ t.name }}</div>
                <div class="author-location">{{ t.location }} · {{ t.category }}</div>
              </div>
            </div>
            <div class="ticket-ref">Ticket: {{ t.ticket }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-bg">
        <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80" alt="City" loading="lazy" />
        <div class="cta-overlay"></div>
      </div>
      <div class="container cta-content">
        <div class="cta-badge">🏛️ Official Government Portal</div>
        <h2>Have a Civic Issue? Your Voice Matters.</h2>
        <p>Join 1.2 lakh+ citizens who have already raised and resolved their complaints through CivicConnect. Together, we build a better city.</p>
        <div class="cta-actions">
          <a routerLink="/auth/register" class="btn btn-primary btn-lg">Register Now — It's Free</a>
          <a routerLink="/auth/login" class="btn btn-outline-white btn-lg">Already Registered? Login</a>
        </div>
        <div class="cta-note">
          No cost · No paperwork · 100% online · Available 24/7
        </div>
      </div>
    </section>

    <app-footer />
  `,
  styles: [`
    /* Styles Omitted for Brevity (Same as original) */
    .hero { position: relative; min-height: 88vh; display: flex; align-items: center; overflow: hidden; .hero-bg { position: absolute; inset: 0; .hero-img { width: 100%; height: 100%; object-fit: cover; object-position: center; } .hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(13,27,62,0.92) 0%, rgba(31,60,136,0.85) 50%, rgba(13,27,62,0.75) 100% ); } } .hero-content { position: relative; z-index: 2; padding-top: 60px; padding-bottom: 60px; max-width: 780px; .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 40px; padding: 6px 16px; font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.85); letter-spacing: 0.5px; margin-bottom: 24px; .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; } } .hero-title { color: white; font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.15; margin-bottom: 24px; letter-spacing: -1px; .highlight { color: var(--accent); display: block; } } .hero-subtitle { font-size: 1.1rem; color: rgba(255,255,255,0.8); line-height: 1.7; margin-bottom: 36px; font-weight: 400; max-width: 600px; } .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 28px; } .hero-quick-track { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: rgba(255,255,255,0.6); .track-link { color: var(--accent); font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } } } } .hero-scroll-hint { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; color: rgba(255,255,255,0.4); font-size: 0.72rem; letter-spacing: 1px; .scroll-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); animation: bounce 2s infinite; } } }
    .ticker-bar { background: var(--primary); border-bottom: 2px solid var(--secondary); padding: 10px 0; display: flex; align-items: center; overflow: hidden; .ticker-label { background: var(--secondary); color: white; padding: 4px 16px; font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; margin-right: 20px; } .ticker-content { overflow: hidden; white-space: nowrap; span { display: inline-block; animation: marquee 30s linear infinite; font-size: 0.8rem; color: rgba(255,255,255,0.8); font-weight: 500; } } }
    .impact-section { padding: 80px 0; background: white; .stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); } @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); } } .impact-card { background: white; padding: 32px 24px; text-align: center; transition: all 0.2s; position: relative; &::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 3px; background: var(--primary); transition: width 0.3s; border-radius: 2px; } &:hover { background: #fafbff; &::after { width: 60%; } } .impact-icon { font-size: 2rem; margin-bottom: 12px; width: 60px; height: 60px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; } .impact-number { font-size: 2.25rem; font-weight: 800; color: var(--primary); line-height: 1; margin-bottom: 8px; letter-spacing: -1px; } .impact-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; } .impact-trend { font-size: 0.75rem; font-weight: 600; color: #059669; display: flex; align-items: center; justify-content: center; gap: 3px; } } }
    .how-it-works { padding: 80px 0; background: var(--bg-base); .steps-grid { display: flex; align-items: center; gap: 16px; @media (max-width: 768px) { flex-direction: column; .step-arrow { transform: rotate(90deg); } } } .step-card { flex: 1; background: white; border-radius: var(--radius-lg); padding: 36px 28px; text-align: center; border: 1px solid var(--border); position: relative; transition: all 0.25s; &:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--primary); } .step-number { position: absolute; top: 20px; right: 20px; font-size: 3rem; font-weight: 800; color: var(--primary); opacity: 0.06; line-height: 1; } .step-icon { font-size: 2.5rem; margin-bottom: 16px; } h3 { font-size: 1.15rem; margin-bottom: 12px; color: var(--text-primary); } p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.65; margin: 0; } } .step-arrow { font-size: 1.5rem; color: var(--text-light); flex-shrink: 0; } }
    .about-section { padding: 80px 0; background: white; .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; @media (max-width: 900px) { grid-template-columns: 1fr; gap: 40px; } } .about-image { position: relative; border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-xl); img { width: 100%; height: 420px; object-fit: cover; } .about-image-badge { position: absolute; bottom: 24px; left: 24px; background: var(--primary); color: white; padding: 14px 20px; border-radius: var(--radius-md); text-align: center; box-shadow: var(--shadow-md); .badge-number { font-size: 1.5rem; font-weight: 800; } .badge-text { font-size: 0.75rem; opacity: 0.8; } } } .about-content { .overline { display: inline-block; font-size: 0.78rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--secondary); margin-bottom: 12px; padding: 4px 16px; background: rgba(42,157,143,0.1); border-radius: 20px; } h2 { margin-bottom: 20px; } p { font-size: 0.95rem; line-height: 1.8; color: var(--text-secondary); margin-bottom: 16px; } .about-highlights { margin-top: 28px; display: flex; flex-direction: column; gap: 16px; .highlight-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px; background: var(--bg-muted); border-radius: var(--radius); border-left: 3px solid var(--primary); .highlight-icon { font-size: 1.5rem; flex-shrink: 0; } strong { display: block; font-size: 0.9rem; color: var(--text-primary); margin-bottom: 2px; } p { font-size: 0.82rem; margin: 0; color: var(--text-muted); } } } } }
    .features-section { padding: 80px 0; background: var(--bg-base); .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 576px) { grid-template-columns: 1fr; } } .feature-card { background: white; border-radius: var(--radius-md); padding: 28px 24px; border: 1px solid var(--border); transition: all 0.25s; &:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: transparent; } .feature-icon { font-size: 1.75rem; width: 56px; height: 56px; border-radius: var(--radius); background: var(--ic); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; } h4 { font-size: 1rem; margin-bottom: 10px; color: var(--text-primary); } p { font-size: 0.82rem; color: var(--text-muted); line-height: 1.65; margin: 0; } } }
    .dept-section { padding: 80px 0; background: white; .dept-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px; @media (max-width: 1200px) { grid-template-columns: repeat(4, 1fr); } @media (max-width: 768px) { grid-template-columns: repeat(3, 1fr); } @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); } } .dept-card { background: var(--bg-muted); border-radius: var(--radius-md); padding: 20px 12px; text-align: center; border: 1px solid transparent; transition: all 0.2s; cursor: pointer; &:hover { background: white; border-color: var(--primary); box-shadow: var(--shadow-sm); .dept-name { color: var(--primary); } } .dept-icon { font-size: 2rem; margin-bottom: 8px; } .dept-name { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; line-height: 1.3; } .dept-count { font-size: 0.68rem; color: var(--text-muted); font-weight: 500; } } }
    .testimonials-section { padding: 80px 0; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); position: relative; &::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); } .section-header { h2, p { color: rgba(255,255,255,0.9); } .overline { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); } p { color: rgba(255,255,255,0.65); } } .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; position: relative; z-index: 1; @media (max-width: 768px) { grid-template-columns: 1fr; } } .testimonial-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-lg); padding: 28px; backdrop-filter: blur(10px); transition: all 0.25s; position: relative; &:hover { background: rgba(255,255,255,0.12); transform: translateY(-3px); } .testimonial-rating { display: flex; gap: 2px; margin-bottom: 12px; .star { font-size: 1rem; color: rgba(255,255,255,0.2); } .star.filled { color: var(--accent); } } .quote-icon { font-size: 4rem; color: rgba(255,255,255,0.1); line-height: 0.5; margin-bottom: 8px; font-family: Georgia, serif; } .testimonial-text { font-size: 0.9rem; color: rgba(255,255,255,0.85); line-height: 1.7; margin-bottom: 20px; } .testimonial-author { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; .author-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--secondary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; flex-shrink: 0; } .author-name { font-size: 0.9rem; font-weight: 700; color: white; } .author-location { font-size: 0.75rem; color: rgba(255,255,255,0.5); } } .ticket-ref { font-size: 0.72rem; color: rgba(255,255,255,0.3); font-weight: 500; letter-spacing: 0.3px; } } }
    .cta-section { position: relative; padding: 100px 0; text-align: center; overflow: hidden; .cta-bg { position: absolute; inset: 0; img { width: 100%; height: 100%; object-fit: cover; } .cta-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(13,27,62,0.95), rgba(31,60,136,0.9)); } } .cta-content { position: relative; z-index: 1; .cta-badge { display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 40px; padding: 6px 18px; font-size: 0.82rem; color: rgba(255,255,255,0.8); margin-bottom: 20px; font-weight: 600; } h2 { color: white; font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: 16px; } p { font-size: 1rem; color: rgba(255,255,255,0.75); max-width: 560px; margin: 0 auto 36px; line-height: 1.7; } .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; } .cta-note { font-size: 0.8rem; color: rgba(255,255,255,0.45); letter-spacing: 0.3px; } } }
    @keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  `]
})
export class HomeComponent implements OnInit {
  departments: Array<{ name: string; icon: string; count: string }> = [
    { name: 'Roads & Infrastructure', icon: '🛣️', count: '12,450+' },
    { name: 'Water & Sanitation', icon: '💧', count: '9,830+' },
    { name: 'Solid Waste', icon: '🗑️', count: '8,210+' },
    { name: 'Electricity', icon: '⚡', count: '6,540+' },
    { name: 'Street Lighting', icon: '💡', count: '4,320+' },
    { name: 'Health', icon: '🏥', count: '3,210+' },
    { name: 'Traffic', icon: '🚦', count: '2,980+' },
    { name: 'Parks', icon: '🌳', count: '1,870+' },
  ];

  testimonials = [
    {
      name: 'Ramesh Gowda',
      initials: 'RG',
      location: 'Koramangala, Bengaluru',
      category: 'Roads & Infrastructure',
      ticket: 'GRV-2024-00089',
      rating: 5,
      text: 'I raised a complaint about a large pothole on my street that had been there for months. Within 3 days, the BBMP team came and repaired it! The SMS updates were very helpful. Excellent service from the government this time.',
    },
    {
      name: 'Sunitha Rajan',
      initials: 'SR',
      location: 'HSR Layout, Bengaluru',
      category: 'Water & Sanitation',
      ticket: 'GRV-2024-00112',
      rating: 4,
      text: 'Our colony had no water supply for four days. I filed a complaint on CivicConnect and the issue was escalated to BWSSB within hours. Water supply was restored in two days. The platform is very user-friendly and professional.',
    },
    {
      name: 'Mohammed Farooq',
      initials: 'MF',
      location: 'Shivajinagar, Bengaluru',
      category: 'Solid Waste Management',
      ticket: 'GRV-2024-00134',
      rating: 5,
      text: 'Garbage collection in our area was completely irregular. I filed a complaint with photos and GPS location. The very next day the schedule was fixed! The officer even called me to confirm. This is how e-governance should work.',
    },
  ];

  constructor(private departmentService: DepartmentService) { }

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: (depts) => {
        if (depts.length > 0) {
          this.departments = depts.map(d => ({
            name: d.name,
            icon: this.iconForDept(d.name),
            count: 'Active'
          }));
        }
      },
      error: () => { } // keep static fallback
    });
  }

  iconForDept(name: string): string {
    const map: Record<string, string> = {
      'Roads & Infrastructure': '🛣️',
      'Water & Sanitation': '💧',
      'Solid Waste Management': '🗑️',
      'Electricity': '⚡',
      'Street Lighting': '💡',
      'Health & Sanitation': '🏥',
      'Traffic & Transport': '🚦',
      'Parks & Recreation': '🌳',
      'Building & Town Planning': '🏗️',
      'Property Tax': '📄',
    };
    return map[name] || '🏢';
  }
}