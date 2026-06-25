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
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['register']);
    const activatedRouteStub = {} as ActivatedRoute;

    Object.defineProperty(accountServiceSpy, 'userValue', {
        get: () => userValue
    });

    beforeEach(async () => {
        userValue = null;
        routerSpy.navigate.calls.reset();
        alertServiceSpy.clear.calls.reset();
        alertServiceSpy.success.calls.reset();
        accountServiceSpy.register.calls.reset();

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

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const validForm = {
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'jdoe',
        password: 'secret1'
    };

    it('does not call register when the form is invalid', () => {
        component.onSubmit();

        expect(component.submitted).toBe(true);
        expect(alertServiceSpy.clear).toHaveBeenCalled();
        expect(accountServiceSpy.register).not.toHaveBeenCalled();
    });

    it('redirects to login when the form is valid but no session exists', () => {
        component.form.setValue(validForm);

        component.onSubmit();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['../login'], { relativeTo: activatedRouteStub });
        expect(accountServiceSpy.register).not.toHaveBeenCalled();
    });

    it('calls register with mapped API fields when the form is valid and a session exists', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;
        accountServiceSpy.register.and.returnValue(of({}));
        component.form.setValue(validForm);

        component.onSubmit();

        expect(accountServiceSpy.register).toHaveBeenCalledWith({
            loginName: 'jdoe',
            displayName: 'Jane Doe',
            isActive: true
        });
    });

    it('shows a success alert and navigates to login when registration succeeds', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;
        accountServiceSpy.register.and.returnValue(of({}));
        component.form.setValue(validForm);

        component.onSubmit();

        expect(alertServiceSpy.success).toHaveBeenCalledWith(
            'Registration successful',
            { keepAfterRouteChange: true }
        );
        expect(routerSpy.navigate).toHaveBeenCalledWith(['../login'], { relativeTo: activatedRouteStub });
    });

    it('resets loading when registration fails', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;
        accountServiceSpy.register.and.returnValue(throwError(() => new Error('Conflict')));
        component.form.setValue(validForm);
        component.loading = true;

        component.onSubmit();

        expect(component.loading).toBe(false);
    });
});
