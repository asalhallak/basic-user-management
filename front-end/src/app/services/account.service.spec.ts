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

    beforeEach(() => {
        localStorage.clear();
        routerSpy.navigate.calls.reset();

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AccountService,
                { provide: Router, useValue: routerSpy }
            ]
        });

        service = TestBed.inject(AccountService);
        httpMock = TestBed.inject(HttpTestingController);
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
});
