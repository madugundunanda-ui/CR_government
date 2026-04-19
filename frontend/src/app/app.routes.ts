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
  {
    path: 'citizen',
    canActivate: [authGuard],
    data: { role: 'citizen' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./citizen/dashboard/citizen-dashboard.component').then(m => m.CitizenDashboardComponent),
      },
      {
        path: 'raise-complaint',
        loadComponent: () => import('./citizen/raise-complaint/raise-complaint.component').then(m => m.RaiseComplaintComponent),
      },
      {
        path: 'complaint-history',
        loadComponent: () => import('./citizen/complaint-history/complaint-history.component').then(m => m.ComplaintHistoryComponent),
      },
    ],
  },
  {
    path: 'officer',
    canActivate: [authGuard],
    data: { role: 'officer' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./officer/dashboard/officer-dashboard.component').then(m => m.OfficerDashboardComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'admin' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
