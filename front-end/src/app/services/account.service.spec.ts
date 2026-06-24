import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { User } from '../models';
import { AccountService } from './account.service';

describe('AccountService', () => {
    let service: AccountService;
    let httpMock: HttpTestingController;
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const configureService = (storedUser?: User) => {
        localStorage.clear();
        if (storedUser) {
            localStorage.setItem('user', JSON.stringify(storedUser));
        }

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AccountService,
                { provide: Router, useValue: routerSpy }
            ]
        });

        service = TestBed.inject(AccountService);
        httpMock = TestBed.inject(HttpTestingController);
    };

    beforeEach(() => {
        routerSpy.navigate.calls.reset();
        configureService();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('login POSTs credentials to the auth endpoint', () => {
        const apiUser = { userName: 'admin', token: 'jwt-token' };

        service.login('admin', '123456789').subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/auth/login`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ userName: 'admin', password: '123456789' });
        req.flush(apiUser);
    });

    it('login stores the API response in localStorage and userValue', () => {
        const apiUser = { userName: 'admin', token: 'jwt-token' } as User;

        service.login('admin', '123456789').subscribe(user => {
            expect(user).toEqual(apiUser);
            expect(service.userValue).toEqual(apiUser);
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(apiUser);
        });

        httpMock.expectOne(`${environment.apiUrl}/api/v1/auth/login`).flush(apiUser);
    });

    it('logout clears localStorage and navigates to login', () => {
        localStorage.setItem('user', JSON.stringify({ userName: 'admin', token: 'jwt-token' }));

        service.logout();

        expect(localStorage.getItem('user')).toBeNull();
        expect(service.userValue).toBeNull();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/account/login']);
    });

    it('update PUTs params to the users endpoint', () => {
        configureService({ id: '1', userName: 'admin', token: 'jwt-token' } as User);
        const params = { displayName: 'Jane Smith', isActive: true };

        service.update('42', params).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users/42`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(params);
        req.flush({});
    });

    it('update merges params into localStorage when editing the logged-in user', () => {
        const loggedInUser = { id: '7', userName: 'admin', token: 'jwt-token', displayName: 'Admin' } as User;
        configureService(loggedInUser);

        const params = { displayName: 'Admin Updated' };

        service.update('7', params).subscribe(() => {
            const expectedUser = { ...loggedInUser, ...params };
            expect(service.userValue).toEqual(expectedUser);
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(expectedUser);
        });

        httpMock.expectOne(`${environment.apiUrl}/api/v1/users/7`).flush({});
    });

    it('update does not change localStorage when editing another user', () => {
        const loggedInUser = { id: '7', userName: 'admin', token: 'jwt-token', displayName: 'Admin' } as User;
        configureService(loggedInUser);

        service.update('99', { displayName: 'Someone Else' }).subscribe(() => {
            expect(service.userValue).toEqual(loggedInUser);
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(loggedInUser);
        });

        httpMock.expectOne(`${environment.apiUrl}/api/v1/users/99`).flush({});
    });

    it('getById GETs the user from the users endpoint', () => {
        const apiUser = {
            id: '42',
            loginName: 'jdoe',
            displayName: 'Jane Doe'
        } as User;

        service.getById('42').subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users/42`);
        expect(req.request.method).toBe('GET');
        req.flush(apiUser);
    });

    it('getById returns the user from the API response', () => {
        const apiUser = {
            id: '42',
            loginName: 'jdoe',
            displayName: 'Jane Doe'
        } as User;

        service.getById('42').subscribe(user => {
            expect(user).toEqual(apiUser);
        });

        httpMock.expectOne(`${environment.apiUrl}/api/v1/users/42`).flush(apiUser);
    });

    it('getById does not change localStorage or userValue', () => {
        const loggedInUser = { id: '7', userName: 'admin', token: 'jwt-token' } as User;
        configureService(loggedInUser);

        const fetchedUser = {
            id: '42',
            loginName: 'jdoe',
            displayName: 'Jane Doe'
        } as User;

        service.getById('42').subscribe(() => {
            expect(service.userValue).toEqual(loggedInUser);
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(loggedInUser);
        });

        httpMock.expectOne(`${environment.apiUrl}/api/v1/users/42`).flush(fetchedUser);
    });

    it('getAll GETs users from the users endpoint', () => {
        service.getAll().subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users`);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('getAll returns the user list from the API response', () => {
        const apiUsers = [
            { id: '1', loginName: 'admin', displayName: 'Admin' },
            { id: '42', loginName: 'jdoe', displayName: 'Jane Doe' }
        ] as User[];

        service.getAll().subscribe(users => {
            expect(users).toEqual(apiUsers);
        });

        httpMock.expectOne(`${environment.apiUrl}/api/v1/users`).flush(apiUsers);
    });

    it('getAll does not change localStorage or userValue', () => {
        const loggedInUser = { id: '7', userName: 'admin', token: 'jwt-token' } as User;
        configureService(loggedInUser);

        const apiUsers = [{ id: '42', loginName: 'jdoe', displayName: 'Jane Doe' }] as User[];

        service.getAll().subscribe(() => {
            expect(service.userValue).toEqual(loggedInUser);
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(loggedInUser);
        });

        httpMock.expectOne(`${environment.apiUrl}/api/v1/users`).flush(apiUsers);
    });
});
