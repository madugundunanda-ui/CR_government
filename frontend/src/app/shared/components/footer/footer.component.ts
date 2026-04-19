import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <!-- Top Banner -->
      <div class="footer-gov-bar">
        <div class="container">
          <div class="gov-logos">
            <div class="gov-logo-item">
              <div class="gov-emblem">🏛️</div>
              <div>
                <div class="gov-name">Government of Karnataka</div>
                <div class="gov-sub">Official State Portal</div>
              </div>
            </div>
            <div class="gov-divider"></div>
            <div class="gov-logo-item">
              <div class="gov-emblem">🏙️</div>
              <div>
                <div class="gov-name">BBMP</div>
                <div class="gov-sub">Bruhat Bengaluru Mahanagara Palike</div>
              </div>
            </div>
            <div class="gov-divider"></div>
            <div class="gov-logo-item">
              <div class="gov-emblem">💻</div>
              <div>
                <div class="gov-name">Digital India</div>
                <div class="gov-sub">Powered by NIC</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Footer -->
      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">

            <div class="footer-brand">
              <div class="footer-logo">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                  <circle cx="20" cy="20" r="19" stroke="white" stroke-width="2"/>
                  <path d="M20 8L28 14V26H12V14L20 8Z" fill="white" opacity="0.9"/>
                  <rect x="16" y="20" width="8" height="6" fill="#1f3c88" rx="1"/>
                </svg>
                <div>
                  <div class="brand-name">CivicConnect</div>
                  <div class="brand-tagline">Smart Grievance Management</div>
                </div>
              </div>
              <p class="brand-desc">
                An official e-Governance initiative by the Government of Karnataka to bridge citizens with municipal services through transparent, efficient and accountable grievance management.
              </p>
              <div class="social-links">
                <a href="#" class="social-btn" aria-label="Twitter">𝕏</a>
                <a href="#" class="social-btn" aria-label="Facebook">f</a>
                <a href="#" class="social-btn" aria-label="YouTube">▶</a>
                <a href="#" class="social-btn" aria-label="LinkedIn">in</a>
              </div>
            </div>

            <div class="footer-links-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a routerLink="/">Home</a></li>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Services</a></li>
                <li><a routerLink="/auth/login">Login</a></li>
                <li><a routerLink="/auth/register">Register</a></li>
                <li><a href="#">Track Complaint</a></li>
              </ul>
            </div>

            <div class="footer-links-col">
              <h4>Departments</h4>
              <ul>
                <li><a href="#">Roads & Infrastructure</a></li>
                <li><a href="#">Water & Sanitation</a></li>
                <li><a href="#">Solid Waste Management</a></li>
                <li><a href="#">Street Lighting</a></li>
                <li><a href="#">Health & Sanitation</a></li>
                <li><a href="#">Parks & Recreation</a></li>
              </ul>
            </div>

            <div class="footer-contact-col">
              <h4>Contact & Support</h4>
              <div class="contact-items">
                <div class="contact-item">
                  <span class="icon">📞</span>
                  <div>
                    <div class="contact-label">Helpline (Toll Free)</div>
                    <a href="tel:1800-425-0029" class="contact-value">1800-425-0029</a>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="icon">📧</span>
                  <div>
                    <div class="contact-label">Email Support</div>
                    <a href="mailto:support@civicconnect.kar.gov.in" class="contact-value">support&#64;civicconnect.kar.gov.in</a>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="icon">📍</span>
                  <div>
                    <div class="contact-label">Head Office</div>
                    <div class="contact-value">BBMP HQ, Hudson Circle<br>Bengaluru - 560002</div>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="icon">🕒</span>
                  <div>
                    <div class="contact-label">Working Hours</div>
                    <div class="contact-value">Mon–Sat: 9:00 AM – 5:30 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="container">
          <div class="bottom-content">
            <p>© 2024 CivicConnect | Government of Karnataka | Bruhat Bengaluru Mahanagara Palike. All rights reserved.</p>
            <div class="bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <a href="#">Accessibility</a>
              <a href="#">Sitemap</a>
              <a href="#">RTI</a>
            </div>
          </div>
          <div class="bottom-badges">
            <span class="badge-item">🔒 SSL Secured</span>
            <span class="badge-item">🌐 GIGW Compliant</span>
            <span class="badge-item">♿ WCAG 2.1 AA</span>
            <span class="badge-item">Last Updated: March 2024</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--bg-dark);
      color: rgba(255,255,255,0.75);
      font-size: 0.875rem;
    }

    .footer-gov-bar {
      background: rgba(255,255,255,0.04);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 20px 0;

      .gov-logos {
        display: flex;
        align-items: center;
        gap: 32px;
        flex-wrap: wrap;
      }

      .gov-logo-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .gov-emblem { font-size: 1.75rem; }

        .gov-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
        }

        .gov-sub {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.5);
          margin-top: 1px;
        }
      }

      .gov-divider {
        width: 1px;
        height: 40px;
        background: rgba(255,255,255,0.15);
      }
    }

    .footer-main {
      padding: 56px 0 40px;

      .footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1.5fr;
        gap: 40px;

        @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; }
        @media (max-width: 576px)  { grid-template-columns: 1fr; }
      }
    }

    .footer-brand {
      .footer-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .brand-name { font-size: 1.1rem; font-weight: 800; color: white; }
        .brand-tagline { font-size: 0.72rem; color: rgba(255,255,255,0.5); }
      }

      .brand-desc {
        font-size: 0.82rem;
        color: rgba(255,255,255,0.55);
        line-height: 1.7;
        margin-bottom: 20px;
      }

      .social-links {
        display: flex;
        gap: 8px;

        .social-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
          transition: all 0.2s;
          text-decoration: none;

          &:hover {
            background: var(--secondary);
            border-color: var(--secondary);
            color: white;
          }
        }
      }
    }

    .footer-links-col {
      h4 {
        font-size: 0.875rem;
        font-weight: 700;
        color: white;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }

      ul {
        display: flex;
        flex-direction: column;
        gap: 10px;
        list-style: none;
        padding: 0;

        li a {
          color: rgba(255,255,255,0.6);
          font-size: 0.82rem;
          text-decoration: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;

          &::before {
            content: '›';
            font-size: 1rem;
            color: var(--secondary);
          }

          &:hover { color: white; }
        }
      }
    }

    .footer-contact-col {
      h4 {
        font-size: 0.875rem;
        font-weight: 700;
        color: white;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }

      .contact-items { display: flex; flex-direction: column; gap: 16px; }

      .contact-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }

        .contact-label { font-size: 0.72rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }

        .contact-value {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          line-height: 1.5;
          &:hover { color: var(--secondary); }
        }
      }
    }

    .footer-bottom {
      background: rgba(0,0,0,0.2);
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 20px 0;

      .bottom-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 12px;

        p { font-size: 0.78rem; color: rgba(255,255,255,0.45); margin: 0; }

        .bottom-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;

          a {
            font-size: 0.78rem;
            color: rgba(255,255,255,0.5);
            text-decoration: none;
            &:hover { color: var(--secondary); }
          }
        }
      }

      .bottom-badges {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;

        .badge-item {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  `]
})
export class FooterComponent {}
