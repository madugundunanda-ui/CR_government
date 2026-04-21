import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  // ─── Citizen ────────────────────────────────────────────────────────────────
  {
    path: 'citizen',
    canActivate: [authGuard],
    data: { role: 'CITIZEN' },
    children: [
      { path: 'dashboard', loadComponent: () => import('./citizen/dashboard/citizen-dashboard.component').then(m => m.CitizenDashboardComponent) },
      { path: 'raise-complaint', loadComponent: () => import('./citizen/raise-complaint/raise-complaint.component').then(m => m.RaiseComplaintComponent) },
      { path: 'complaint-history', loadComponent: () => import('./citizen/complaint-history/complaint-history.component').then(m => m.ComplaintHistoryComponent) },
    ],
  },
  // ─── Officer ────────────────────────────────────────────────────────────────
  {
    path: 'officer',
    canActivate: [authGuard],
    data: { role: 'OFFICER' },
    children: [
      { path: 'dashboard', loadComponent: () => import('./officer/dashboard/officer-dashboard.component').then(m => m.OfficerDashboardComponent) },
      { path: 'assigned-complaints', loadComponent: () => import('./officer/assigned-complaints/assigned-complaints.component').then(m => m.AssignedComplaintsComponent) },
    ],
  },
  // ─── Admin ──────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'all-complaints', loadComponent: () => import('./admin/all-complaints/all-complaints.component').then(m => m.AdminAllComplaintsComponent) },
      { path: 'officers', loadComponent: () => import('./admin/officers/officers.component').then(m => m.OfficersComponent) },
      { path: 'citizens', loadComponent: () => import('./admin/citizens/citizens.component').then(m => m.CitizensComponent) },
      { path: 'departments', loadComponent: () => import('./admin/departments/departments.component').then(m => m.DepartmentsComponent) },
      { path: 'analytics', loadComponent: () => import('./admin/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'audit-logs', loadComponent: () => import('./admin/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent) },
    ],
  },
  // ─── Shared (all roles) ─────────────────────────────────────────────────────
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/notifications/notifications.component').then(m => m.NotificationsComponent),
  },
  { path: '**', redirectTo: '' },
];