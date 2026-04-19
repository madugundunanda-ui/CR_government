import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredRole = route.data?.['role'];
  if (requiredRole && auth.getRole() !== requiredRole) {
    const roleRoutes: Record<string, string> = {
      citizen: '/citizen/dashboard',
      officer: '/officer/dashboard',
      admin: '/admin/dashboard',
    };
    const currentRole = auth.getRole();
    if (currentRole) router.navigate([roleRoutes[currentRole]]);
    return false;
  }
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    const roleRoutes: Record<string, string> = {
      citizen: '/citizen/dashboard',
      officer: '/officer/dashboard',
      admin: '/admin/dashboard',
    };
    const role = auth.getRole();
    if (role) router.navigate([roleRoutes[role]]);
    return false;
  }
  return true;
};
