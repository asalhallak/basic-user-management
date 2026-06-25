import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { User } from '../models';
import { AccountService, AlertService } from '../services';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let userValue: User | null = null;
    let logoutSpy: jasmine.Spy;
    let alertErrorSpy: jasmine.Spy;

    const accountServiceStub = {
        get userValue(): User | null {
            return userValue;
        },
        logout: () => undefined
    };

    const alertServiceStub = {
        error: (_message: string) => undefined
    };

    beforeEach(() => {
        userValue = null;
        logoutSpy = spyOn(accountServiceStub, 'logout');
        alertErrorSpy = spyOn(alertServiceStub, 'error');
        spyOn(console, 'error');

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
                { provide: AccountService, useValue: accountServiceStub },
                { provide: AlertService, useValue: alertServiceStub }
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('shows a global error alert and re-throws the parsed message', () => {
        let thrownMessage: string | undefined;

        http.get(`${environment.apiUrl}/api/v1/users`).subscribe({
            error: message => { thrownMessage = message; }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users`);
        req.flush(
            { message: 'A user with this loginName already exists.' },
            { status: 409, statusText: 'Conflict' }
        );

        expect(alertErrorSpy).toHaveBeenCalledWith('A user with this loginName already exists.');
        expect(logoutSpy).not.toHaveBeenCalled();
        expect(thrownMessage).toBe('A user with this loginName already exists.');
    });

    it('logs out and shows a session-expired message on 401 when logged in', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;
        let thrownMessage: string | undefined;

        http.get(`${environment.apiUrl}/api/v1/users`).subscribe({
            error: message => { thrownMessage = message; }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users`);
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(logoutSpy).toHaveBeenCalled();
        expect(alertErrorSpy).toHaveBeenCalledWith('Your session has expired. Please log in again.');
        expect(thrownMessage).toBe('Unauthorized');
    });

    it('logs out and shows a session-expired message on 403 when logged in', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;
        let thrownMessage: string | undefined;

        http.get(`${environment.apiUrl}/api/v1/users`).subscribe({
            error: message => { thrownMessage = message; }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users`);
        req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

        expect(logoutSpy).toHaveBeenCalled();
        expect(alertErrorSpy).toHaveBeenCalledWith('Your session has expired. Please log in again.');
        expect(thrownMessage).toBe('Forbidden');
    });

    it('shows the parsed message on 401 when not logged in without logging out', () => {
        userValue = null;
        let thrownMessage: string | undefined;

        http.post(`${environment.apiUrl}/api/v1/auth/login`, {}).subscribe({
            error: message => { thrownMessage = message; }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/auth/login`);
        req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });

        expect(logoutSpy).not.toHaveBeenCalled();
        expect(alertErrorSpy).toHaveBeenCalledWith('Invalid credentials');
        expect(thrownMessage).toBe('Invalid credentials');
    });
});
