import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AccountService, AlertService } from '../../services';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['clear']);
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['login', 'isLoggedIn']);
    const activatedRouteStub = {
        snapshot: { queryParams: {} as Record<string, string> }
    };

    beforeEach(async () => {
        routerSpy.navigateByUrl.calls.reset();
        alertServiceSpy.clear.calls.reset();
        accountServiceSpy.login.calls.reset();
        accountServiceSpy.isLoggedIn.and.returnValue(false);
        activatedRouteStub.snapshot.queryParams = {};

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [LoginComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: AlertService, useValue: alertServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('redirects to home on init when already logged in', () => {
        accountServiceSpy.isLoggedIn.and.returnValue(true);

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
        expect(component.form).toBeUndefined();
    });

    it('redirects to returnUrl on init when already logged in', () => {
        accountServiceSpy.isLoggedIn.and.returnValue(true);
        activatedRouteStub.snapshot.queryParams = { returnUrl: '/users' };

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/users');
    });

    it('does not call login when the form is invalid', () => {
        component.onSubmit();

        expect(component.submitted).toBe(true);
        expect(alertServiceSpy.clear).toHaveBeenCalled();
        expect(accountServiceSpy.login).not.toHaveBeenCalled();
    });

    it('associates labels with matching input ids', () => {
        const compiled = fixture.nativeElement as HTMLElement;

        const labelFor = (id: string) =>
            compiled.querySelector(`label[for="${id}"]`) as HTMLLabelElement | null;

        expect(labelFor('username')?.textContent?.trim()).toContain('Username');
        expect(compiled.querySelector('#username')).toBeTruthy();
        expect(labelFor('password')?.textContent?.trim()).toContain('Password');
        expect(compiled.querySelector('#password')).toBeTruthy();
    });

    it('sets autocomplete tokens on login inputs and type on the submit button', () => {
        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('#username')?.getAttribute('autocomplete')).toBe('username');
        expect(compiled.querySelector('#password')?.getAttribute('autocomplete')).toBe('current-password');
        expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    });

    it('sets aria-busy on the form and aria-label on the submit button while loading', () => {
        component.loading = true;
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('form')?.getAttribute('aria-busy')).toBe('true');
        expect(compiled.querySelector('button[type="submit"]')?.getAttribute('aria-label')).toBe('Signing in');
    });

    it('sets aria-label on the register link', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('a[aria-label="Go to register page"]')).toBeTruthy();
    });

    it('calls login with form values when the form is valid', () => {
        accountServiceSpy.login.and.returnValue(of({ userName: 'admin', token: 'jwt-token' }));
        component.form.setValue({ username: 'admin', password: '123456789' });

        component.onSubmit();

        expect(accountServiceSpy.login).toHaveBeenCalledWith('admin', '123456789');
    });

    it('navigates to home when login succeeds and no returnUrl is set', () => {
        accountServiceSpy.login.and.returnValue(of({ userName: 'admin', token: 'jwt-token' }));
        component.form.setValue({ username: 'admin', password: '123456789' });

        component.onSubmit();

        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('navigates to returnUrl when login succeeds', () => {
        activatedRouteStub.snapshot.queryParams = { returnUrl: '/users' };
        accountServiceSpy.login.and.returnValue(of({ userName: 'admin', token: 'jwt-token' }));
        component.form.setValue({ username: 'admin', password: '123456789' });

        component.onSubmit();

        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/users');
    });

    it('resets loading when login fails', () => {
        accountServiceSpy.login.and.returnValue(throwError(() => new Error('Unauthorized')));
        component.form.setValue({ username: 'admin', password: 'wrong' });
        component.loading = true;

        component.onSubmit();

        expect(component.loading).toBe(false);
    });
});
