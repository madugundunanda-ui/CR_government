import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './jwt.interceptor';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

describe('jwtInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        localStorage.clear();
        router = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([jwtInterceptor])),
                provideHttpClientTesting(),
                { provide: Router, useValue: router },
            ],
        });
        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => { httpMock.verify(); localStorage.clear(); });

    // TC-10: JWT attached to requests when present
    it('TC-10: attaches Bearer token to requests when token is in localStorage', () => {
        localStorage.setItem('civic_jwt_token', 'test-token');
        http.get('/api/citizen/my-complaints').subscribe();
        const req = httpMock.expectOne('/api/citizen/my-complaints');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
        req.flush([]);
    });

    it('does not attach token to auth requests', () => {
        localStorage.setItem('civic_jwt_token', 'test-token');
        http.post('/api/auth/login', {}).subscribe();
        const req = httpMock.expectOne('/api/auth/login');
        expect(req.request.headers.get('Authorization')).toBeNull();
        req.flush({});
    });

    it('no Authorization header when no token in localStorage', () => {
        http.get('/api/citizen/my-complaints').subscribe();
        const req = httpMock.expectOne('/api/citizen/my-complaints');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush([]);
    });

    // TC-11: 401 response causes redirect to login
    it('TC-11: 401 response redirects to /auth/login and clears token', () => {
        localStorage.setItem('civic_jwt_token', 'expired-token');
        http.get('/api/citizen/my-complaints').subscribe({ error: () => { } });
        const req = httpMock.expectOne('/api/citizen/my-complaints');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
        expect(localStorage.getItem('civic_jwt_token')).toBeNull();
    });
});