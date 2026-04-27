import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const MOCK_RESPONSE = {
    message: 'Login successful',
    token: 'mock.jwt.token',
    userId: 1,
    name: 'Test User',
    email: 'citizen@test.com',
    role: 'CITIZEN' as const,
    approved: true,
};

describe('AuthService', () => {
    let service: AuthService;
    let http: HttpTestingController;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        localStorage.clear();
        router = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService, { provide: Router, useValue: router }],
        });
        service = TestBed.inject(AuthService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        localStorage.clear();
    });

    // TC-10: JWT persisted in localStorage
    it('TC-10: stores JWT token in localStorage after login', (done) => {
        service.login('citizen@test.com', 'pass', 'CITIZEN').subscribe(() => {
            expect(localStorage.getItem('civic_jwt_token')).toBe('mock.jwt.token');
            done();
        });
        http.expectOne(`${environment.apiUrl}/auth/login`).flush(MOCK_RESPONSE);
    });

    // TC-03: Routes to correct dashboard after login
    it('TC-03: redirects citizen to /citizen/dashboard after login', (done) => {
        service.login('citizen@test.com', 'pass', 'CITIZEN').subscribe(() => {
            expect(router.navigate).toHaveBeenCalledWith(['/citizen/dashboard']);
            done();
        });
        http.expectOne(`${environment.apiUrl}/auth/login`).flush(MOCK_RESPONSE);
    });

    it('TC-03b: redirects admin to /admin/dashboard after login', (done) => {
        const adminResp = { ...MOCK_RESPONSE, email: 'admin@test.com', role: 'ADMIN' as const };
        service.login('admin@test.com', 'pass', 'ADMIN').subscribe(() => {
            expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
            done();
        });
        http.expectOne(`${environment.apiUrl}/auth/login`).flush(adminResp);
    });

    it('TC-03c: redirects officer to /officer/dashboard after login', (done) => {
        const offResp = { ...MOCK_RESPONSE, email: 'off@test.com', role: 'OFFICER' as const };
        service.login('off@test.com', 'pass', 'OFFICER').subscribe(() => {
            expect(router.navigate).toHaveBeenCalledWith(['/officer/dashboard']);
            done();
        });
        http.expectOne(`${environment.apiUrl}/auth/login`).flush(offResp);
    });

    // TC-20: Logout clears session data
    it('TC-20: logout removes token and user from localStorage', (done) => {
        service.login('citizen@test.com', 'pass', 'CITIZEN').subscribe(() => {
            expect(localStorage.getItem('civic_jwt_token')).toBeTruthy();
            service.logout();
            expect(localStorage.getItem('civic_jwt_token')).toBeNull();
            expect(localStorage.getItem('civic_user')).toBeNull();
            expect(service.isLoggedIn()).toBeFalse();
            done();
        });
        http.expectOne(`${environment.apiUrl}/auth/login`).flush(MOCK_RESPONSE);
    });

    // TC-11: isLoggedIn false when token is expired
    it('TC-11: isLoggedIn returns false when token is expired', () => {
        // A JWT with exp in the past (payload: {"sub":"test","exp":1})
        const expiredToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxfQ.fake';
        localStorage.setItem('civic_jwt_token', expiredToken);
        expect(service.isTokenExpired()).toBeTrue();
    });

    // Role mismatch throws
    it('login throws if role does not match', (done) => {
        service.login('citizen@test.com', 'pass', 'ADMIN').subscribe({
            error: (err) => {
                expect(err.message).toContain('role');
                done();
            },
        });
        http.expectOne(`${environment.apiUrl}/auth/login`).flush(MOCK_RESPONSE);
    });

    // isLoggedIn false when no token
    it('isLoggedIn returns false when no token in localStorage', () => {
        expect(service.isLoggedIn()).toBeFalse();
    });

    // getRole returns correct role after login
    it('getRole returns CITIZEN after citizen login', (done) => {
        service.login('citizen@test.com', 'pass', 'CITIZEN').subscribe(() => {
            expect(service.getRole()).toBe('CITIZEN');
            done();
        });
        http.expectOne(`${environment.apiUrl}/auth/login`).flush(MOCK_RESPONSE);
    });
});