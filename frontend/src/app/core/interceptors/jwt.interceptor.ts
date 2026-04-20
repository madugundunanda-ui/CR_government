import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const token = localStorage.getItem('civic_jwt_token');

    // Attach token to all non-auth requests
    if (token && !req.url.includes('/api/auth/')) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
                // Token expired or invalid — clear session and redirect
                localStorage.removeItem('civic_jwt_token');
                localStorage.removeItem('civic_user');
                router.navigate(['/auth/login']);
            }
            return throwError(() => err);
        })
    );
};