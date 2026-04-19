# 🏛️ CivicConnect — Smart Civic Grievance Management System

A production-quality **Angular 17** frontend for a government-grade Citizen Service Request & Municipal Grievance Resolution System.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Open browser
http://localhost:4200
```

---

## 🔐 Demo Login Credentials

| Role       | Email               | Password  | Access Route         |
|------------|---------------------|-----------|----------------------|
| Citizen    | citizen@demo.com    | demo123   | /citizen/dashboard   |
| Officer    | officer@demo.com    | demo123   | /officer/dashboard   |
| Admin      | admin@demo.com      | demo123   | /admin/dashboard     |

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── guards/          # Auth guards (authGuard, guestGuard)
│   ├── models/          # TypeScript interfaces & types
│   └── services/        # AuthService, MockDataService
│
├── shared/
│   └── components/
│       ├── navbar/      # Sticky responsive navbar
│       └── footer/      # Government-style footer
│
├── auth/
│   ├── login/           # Role-based login page
│   └── register/        # Citizen registration with validation
│
├── home/                # Home page (Hero, Stats, Features, About, Testimonials)
│
├── citizen/
│   ├── dashboard/       # Citizen dashboard with complaint cards
│   ├── raise-complaint/ # Full complaint form with location capture
│   └── complaint-history/ # Table view + detail modal + filtering
│
├── officer/
│   └── dashboard/       # Officer complaint management UI
│
└── admin/
    └── dashboard/       # Admin analytics, department KPIs, officer mgmt
```

---

## 🎨 Design System

| Token          | Value              |
|----------------|--------------------|
| Primary        | `#1f3c88` (Navy Blue) |
| Secondary      | `#2a9d8f` (Teal)    |
| Background     | `#f5f7fa`           |
| Font           | Poppins (Google Fonts) |
| Border Radius  | 8px, 12px, 16px, 24px |
| Shadow System  | sm / md / lg / xl   |

---

## 📄 Pages

| Page                 | Route                          | Role       |
|----------------------|--------------------------------|------------|
| Home                 | `/`                            | Public     |
| Login                | `/auth/login`                  | Guest only |
| Register             | `/auth/register`               | Guest only |
| Citizen Dashboard    | `/citizen/dashboard`           | Citizen    |
| Raise Complaint      | `/citizen/raise-complaint`     | Citizen    |
| Complaint History    | `/citizen/complaint-history`   | Citizen    |
| Officer Dashboard    | `/officer/dashboard`           | Officer    |
| Admin Dashboard      | `/admin/dashboard`             | Admin      |

---

## ⚙️ Tech Stack

- **Angular 17** — Standalone components, Signals, Control flow (`@if`, `@for`)
- **TypeScript** — Strict mode
- **SCSS** — Global design tokens via CSS custom properties
- **Angular Router** — Lazy-loaded routes with auth guards
- **Reactive Forms** — Full validation, password strength meter
- **Angular Signals** — For reactive state management

---

## 🔗 Backend Integration

The project is **frontend-only with mock data**. To connect a real backend:

1. Replace `MockDataService` methods with HTTP calls via `HttpClient`
2. Update `AuthService.login()` to call your auth API
3. Set up JWT token storage and HTTP interceptors
4. Update routes/models to match your API response shape

---

## 🏛️ Government Design Reference

Modeled after:
- **BBMP Sahaaya** (Bengaluru grievance portal)
- **MyGov.in** (Government of India)
- **eGov Foundation** platform design

---

## 📱 Responsiveness

- Fully responsive from 320px to 1920px
- Mobile-first CSS using Flexbox and Grid
- Collapsible sidebar on mobile
- Touch-friendly interactive elements

---

*Built as a professional government-grade Angular frontend. Ready for backend integration.*
