import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AccountService, AlertService } from '../../services';
import { AddEditComponent } from './add-edit.component';

describe('AddEditComponent', () => {
    let component: AddEditComponent;
    let fixture: ComponentFixture<AddEditComponent>;
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['clear', 'success']);
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['register', 'update', 'getById']);
    const activatedRouteStub = {
        snapshot: { params: {} as Record<string, string> }
    };

    const validForm = {
        displayName: 'Jane Doe',
        loginName: 'jdoe',
        dateOfBirth: '1990-05-15',
        country: 'US',
        isActive: true,
        salary: 75000,
        profilePictureUrl: '',
        address: {
            city: 'Seattle',
            postalCode: '98101',
            state: 'WA',
            streetNumber: '100',
            streetName: 'Main St',
            country: 'US'
        }
    };

    beforeEach(async () => {
        activatedRouteStub.snapshot.params = {};
        routerSpy.navigate.calls.reset();
        alertServiceSpy.clear.calls.reset();
        alertServiceSpy.success.calls.reset();
        accountServiceSpy.register.calls.reset();
        accountServiceSpy.update.calls.reset();
        accountServiceSpy.getById.calls.reset();

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [AddEditComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: AlertService, useValue: alertServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AddEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('sets isAddMode when no id is in the route', () => {
        expect(component.isAddMode).toBe(true);
        expect(accountServiceSpy.getById).not.toHaveBeenCalled();
    });

    it('sets type on the submit button so Enter submits the form', () => {
        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    });

    it('groups address fields in a fieldset with a screen-reader legend', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const fieldset = compiled.querySelector('fieldset[formgroupname="address"]');

        expect(fieldset).toBeTruthy();
        expect(fieldset?.querySelector('legend.sr-only')?.textContent?.trim()).toBe('Address');
    });

    it('exposes accessible cancel and saving labels', () => {
        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('a[aria-label="Cancel and return to users list"]')).toBeTruthy();

        component.loading = true;
        fixture.detectChanges();

        expect(compiled.querySelector('form')?.getAttribute('aria-busy')).toBe('true');
        expect(compiled.querySelector('button[type="submit"]')?.getAttribute('aria-label')).toBe('Saving user');
    });

    it('associates labels with unique input ids including separate user and address country fields', () => {
        const compiled = fixture.nativeElement as HTMLElement;

        const labelFor = (id: string) =>
            compiled.querySelector(`label[for="${id}"]`) as HTMLLabelElement | null;

        expect(labelFor('displayName')?.textContent?.trim()).toContain('Display Name');
        expect(compiled.querySelector('#displayName')).toBeTruthy();
        expect(labelFor('userCountry')?.textContent?.trim()).toContain('Country');
        expect(compiled.querySelector('#userCountry')).toBeTruthy();
        expect(labelFor('addressCountry')?.textContent?.trim()).toContain('Country');
        expect(compiled.querySelector('#addressCountry')).toBeTruthy();
        expect(compiled.querySelectorAll('label[for="country"]').length).toBe(0);
    });

    it('does not call register when the form is invalid in add mode', () => {
        component.onSubmit();

        expect(component.submitted).toBe(true);
        expect(alertServiceSpy.clear).toHaveBeenCalled();
        expect(accountServiceSpy.register).not.toHaveBeenCalled();
    });

    it('calls register with form values when add mode submit is valid', () => {
        accountServiceSpy.register.and.returnValue(of({}));
        component.form.setValue(validForm);

        component.onSubmit();

        expect(accountServiceSpy.register).toHaveBeenCalledWith(validForm);
    });

    it('shows a success alert and navigates to the user list when create succeeds', () => {
        accountServiceSpy.register.and.returnValue(of({}));
        component.form.setValue(validForm);

        component.onSubmit();

        expect(alertServiceSpy.success).toHaveBeenCalledWith(
            'User added successfully',
            { keepAfterRouteChange: true }
        );
        expect(routerSpy.navigate).toHaveBeenCalledWith(['../'], { relativeTo: activatedRouteStub });
    });

    it('resets loading when create fails', () => {
        accountServiceSpy.register.and.returnValue(throwError(() => new Error('Conflict')));
        component.form.setValue(validForm);
        component.loading = true;

        component.onSubmit();

        expect(component.loading).toBe(false);
    });

    describe('edit mode', () => {
        const existingUser = {
            id: '42',
            loginName: 'jdoe',
            displayName: 'Jane Doe',
            dateOfBirth: '1990-05-15T00:00:00',
            country: 'US',
            isActive: true,
            salary: 75000,
            profilePictureUrl: '',
            address: validForm.address
        };

        beforeEach(() => {
            activatedRouteStub.snapshot.params = { id: '42' };
            accountServiceSpy.getById.and.returnValue(of(existingUser));

            fixture = TestBed.createComponent(AddEditComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('loads the user and patches the form with a date-only dateOfBirth', () => {
            expect(component.isAddMode).toBe(false);
            expect(accountServiceSpy.getById).toHaveBeenCalledWith('42');
            expect(component.form.value).toEqual({
                displayName: existingUser.displayName,
                loginName: existingUser.loginName,
                dateOfBirth: '1990-05-15',
                country: existingUser.country,
                isActive: existingUser.isActive,
                salary: existingUser.salary,
                profilePictureUrl: existingUser.profilePictureUrl,
                address: existingUser.address
            });
            expect(component.loading).toBe(false);
        });

        it('navigates to the user list when getById fails', () => {
            accountServiceSpy.getById.and.returnValue(throwError(() => new Error('Not found')));
            activatedRouteStub.snapshot.params = { id: '99' };

            fixture = TestBed.createComponent(AddEditComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(routerSpy.navigate).toHaveBeenCalledWith(['../'], { relativeTo: activatedRouteStub });
        });

        it('calls update with id and form values when edit mode submit is valid', () => {
            accountServiceSpy.update.and.returnValue(of({}));
            component.form.setValue(validForm);

            component.onSubmit();

            expect(accountServiceSpy.update).toHaveBeenCalledWith('42', validForm);
        });

        it('shows a success alert and navigates up two levels when update succeeds', () => {
            accountServiceSpy.update.and.returnValue(of({}));
            component.form.setValue(validForm);

            component.onSubmit();

            expect(alertServiceSpy.success).toHaveBeenCalledWith(
                'Update successful',
                { keepAfterRouteChange: true }
            );
            expect(routerSpy.navigate).toHaveBeenCalledWith(['../../'], { relativeTo: activatedRouteStub });
        });

        it('resets loading when update fails', () => {
            accountServiceSpy.update.and.returnValue(throwError(() => new Error('Server error')));
            component.form.setValue(validForm);
            component.loading = true;

            component.onSubmit();

            expect(component.loading).toBe(false);
        });
    });
});
