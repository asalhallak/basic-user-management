import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AccountService, AlertService } from '../../services';
import { User } from '../../models';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let userValue: User | null = null;
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['clear', 'success']);
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['register', 'isLoggedIn']);
    const activatedRouteStub = {} as ActivatedRoute;

    Object.defineProperty(accountServiceSpy, 'userValue', {
        get: () => userValue
    });

    const initComponent = (session: User | null = null) => {
        userValue = session;
        accountServiceSpy.isLoggedIn.and.callFake(() => {
            const token = userValue?.token;
            return typeof token === 'string' && token.length > 0;
        });
        routerSpy.navigate.calls.reset();
        alertServiceSpy.clear.calls.reset();
        alertServiceSpy.success.calls.reset();
        accountServiceSpy.register.calls.reset();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [RegisterComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: AlertService, useValue: alertServiceSpy }
            ]
        }).compileComponents();
    });

    const validForm = {
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'jdoe',
        password: 'secret1'
    };

    it('redirects to login on init when no session exists', () => {
        initComponent(null);

        expect(routerSpy.navigate).toHaveBeenCalledWith(['../login'], { relativeTo: activatedRouteStub });
        expect(component.form).toBeUndefined();
    });

    it('redirects to login on init when the session has an empty token', () => {
        initComponent({ userName: 'admin', token: '' } as User);

        expect(routerSpy.navigate).toHaveBeenCalledWith(['../login'], { relativeTo: activatedRouteStub });
        expect(component.form).toBeUndefined();
    });

    describe('when logged in', () => {
        beforeEach(() => {
            initComponent({ userName: 'admin', token: 'jwt-token' } as User);
        });

        it('does not call register when the form is invalid', () => {
            component.onSubmit();

            expect(component.submitted).toBe(true);
            expect(alertServiceSpy.clear).toHaveBeenCalled();
            expect(accountServiceSpy.register).not.toHaveBeenCalled();
        });

        it('calls register with mapped API fields when the form is valid', () => {
            accountServiceSpy.register.and.returnValue(of({}));
            component.form.setValue(validForm);

            component.onSubmit();

            expect(accountServiceSpy.register).toHaveBeenCalledWith({
                loginName: 'jdoe',
                displayName: 'Jane Doe',
                isActive: true
            });
        });

        it('shows a success alert and navigates to the user list when registration succeeds', () => {
            accountServiceSpy.register.and.returnValue(of({}));
            component.form.setValue(validForm);

            component.onSubmit();

            expect(alertServiceSpy.success).toHaveBeenCalledWith(
                'Registration successful',
                { keepAfterRouteChange: true }
            );
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
        });

        it('redirects to login on submit when the session expires before submit', () => {
            accountServiceSpy.isLoggedIn.and.returnValue(false);
            component.form.setValue(validForm);

            component.onSubmit();

            expect(routerSpy.navigate).toHaveBeenCalledWith(['../login'], { relativeTo: activatedRouteStub });
            expect(accountServiceSpy.register).not.toHaveBeenCalled();
        });

        it('resets loading when registration fails', () => {
            accountServiceSpy.register.and.returnValue(throwError(() => new Error('Conflict')));
            component.form.setValue(validForm);
            component.loading = true;

            component.onSubmit();

            expect(component.loading).toBe(false);
        });
    });
});
