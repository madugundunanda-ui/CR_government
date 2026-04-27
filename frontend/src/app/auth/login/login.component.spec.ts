import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
    let fixture: ComponentFixture<LoginComponent>;
    let component: LoginComponent;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        authService = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn', 'getRole', 'currentUser']);
        authService.isLoggedIn.and.returnValue(false);
        authService.currentUser.and.returnValue(null);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
            providers: [{ provide: AuthService, useValue: authService }],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('creates the login component', () => {
        expect(component).toBeTruthy();
    });

    // TC-02: Error message on invalid credentials
    it('TC-02: shows error message when login fails', () => {
        authService.login.and.returnValue(throwError(() => new Error('Invalid email or password')));
        component.loginForm.patchValue({ role: 'CITIZEN', email: 'bad@test.com', password: 'wrong' });
        component.onSubmit();
        expect(component.errorMsg).toContain('Invalid');
        expect(component.loading).toBeFalse();
    });

    // TC-15: API downtime shows user-friendly error
    it('TC-15: shows friendly error on API downtime/network failure', () => {
        authService.login.and.returnValue(throwError(() => new Error('Something went wrong.')));
        component.loginForm.patchValue({ role: 'CITIZEN', email: 'c@test.com', password: 'p' });
        component.onSubmit();
        expect(component.errorMsg).toBeTruthy();
        expect(component.errorMsg.length).toBeGreaterThan(0);
    });

    // TC-03: Successful login handled
    it('TC-03: login success clears error and stops loading', () => {
        authService.login.and.returnValue(of({} as any));
        component.loginForm.patchValue({ role: 'CITIZEN', email: 'c@test.com', password: 'pass' });
        component.onSubmit();
        expect(component.errorMsg).toBe('');
        expect(component.loading).toBeFalse();
    });

    it('form is invalid when empty', () => {
        expect(component.loginForm.valid).toBeFalse();
    });

    it('form is valid with all fields filled', () => {
        component.loginForm.patchValue({ role: 'CITIZEN', email: 'user@test.com', password: 'pass123' });
        expect(component.loginForm.valid).toBeTrue();
    });

    it('fillDemo auto-fills citizen credentials', () => {
        component.fillDemo('CITIZEN');
        expect(component.loginForm.get('email')?.value).toBe('citizen@demo.com');
        expect(component.loginForm.get('role')?.value).toBe('CITIZEN');
    });
});