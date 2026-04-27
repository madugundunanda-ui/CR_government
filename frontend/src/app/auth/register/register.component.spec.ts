import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';

describe('RegisterComponent', () => {
    let fixture: ComponentFixture<RegisterComponent>;
    let component: RegisterComponent;
    let authService: jasmine.SpyObj<AuthService>;
    const registerResponse = {
        message: 'Registration successful',
        userId: 1,
        name: 'Test User',
        email: 'new@test.com',
        role: 'CITIZEN' as const,
        approved: true,
    };

    beforeEach(async () => {
        authService = jasmine.createSpyObj('AuthService', ['register']);

        await TestBed.configureTestingModule({
            imports: [RegisterComponent, ReactiveFormsModule, RouterTestingModule],
            providers: [{ provide: AuthService, useValue: authService }],
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // TC-01: Form field validation
    it('TC-01: form is invalid when fields are empty', () => {
        expect(component.registerForm.valid).toBeFalse();
    });

    it('TC-01b: fullName is invalid when less than 3 chars', () => {
        component.registerForm.patchValue({ fullName: 'AB' });
        expect(component.registerForm.get('fullName')?.valid).toBeFalse();
    });

    it('TC-01c: email validation rejects non-email format', () => {
        component.registerForm.patchValue({ email: 'notanemail' });
        expect(component.registerForm.get('email')?.valid).toBeFalse();
    });

    it('TC-01d: phone accepts 10-digit number', () => {
        component.registerForm.patchValue({ phone: '9876543210' });
        expect(component.registerForm.get('phone')?.valid).toBeTrue();
    });

    it('TC-01e: phone rejects non-10-digit', () => {
        component.registerForm.patchValue({ phone: '123' });
        expect(component.registerForm.get('phone')?.valid).toBeFalse();
    });

    it('TC-01f: password requires minimum 8 characters', () => {
        component.registerForm.patchValue({ password: 'short' });
        expect(component.registerForm.get('password')?.valid).toBeFalse();
        component.registerForm.patchValue({ password: 'longpassword' });
        expect(component.registerForm.get('password')?.valid).toBeTrue();
    });

    it('registration success shows success message', () => {
        authService.register.and.returnValue(of(registerResponse));
        component.registerForm.patchValue({
            fullName: 'Test User', email: 'new@test.com', phone: '9876543210',
            address: 'Test Address', ward: 'Ward 1', idType: 'AADHAAR', idNumber: '123456789012',
            password: 'password123', confirmPassword: 'password123', consent: true,
        });
        component.onSubmit();
        expect(component.successMsg).toContain('successful');
    });

    it('registration failure shows error message', () => {
        authService.register.and.returnValue(throwError(() => ({ error: { message: 'Email already registered' } })));
        component.registerForm.patchValue({
            fullName: 'Test User', email: 'dup@test.com', phone: '9876543210',
            address: 'Test Address', ward: 'Ward 1', idType: 'AADHAAR', idNumber: '123456789012',
            password: 'password123', confirmPassword: 'password123', consent: true,
        });
        component.onSubmit();
        expect(component.errorMsg).toBeTruthy();
    });

    it('password strength meter works', () => {
        component.registerForm.patchValue({ password: '' });
        expect(component.pwdStrength()).toBe(0);
        component.registerForm.patchValue({ password: 'Abcd1@#$' });
        expect(component.pwdStrength()).toBe(4);
    });
});