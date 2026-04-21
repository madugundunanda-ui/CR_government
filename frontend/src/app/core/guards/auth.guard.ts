import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/models';

const ROLE_ROUTES: Record<UserRole, string> = {
  CITIZEN:    '/citizen/dashboard',
  OFFICER:    '/officer/dashboard',
  SUPERVISOR: '/officer/dashboard',
  ADMIN:      '/admin/dashboard',
};

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredRole: UserRole | undefined = route.data?.['role'];
  const currentRole = auth.getRole();

  if (requiredRole && currentRole) {
    // SUPERVISOR is allowed anywhere OFFICER is allowed
    const effectiveRole = currentRole === 'SUPERVISOR' ? 'OFFICER' : currentRole;
    if (effectiveRole !== requiredRole && currentRole !== requiredRole) {
      router.navigate([ROLE_ROUTES[currentRole]]);
      return false;
    }
  }
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    const role = auth.getRole();
    if (role) router.navigate([ROLE_ROUTES[role]]);
    return false;
  }
  return true;
};

