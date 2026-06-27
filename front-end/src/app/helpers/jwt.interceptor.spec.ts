import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { User } from '../models';
import { AccountService } from '../services';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let userValue: User | null = null;

    const accountServiceStub = {
        get userValue(): User | null {
            return userValue;
        }
    };

    beforeEach(() => {
        userValue = null;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
                { provide: AccountService, useValue: accountServiceStub }
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('adds Authorization header for API requests when logged in', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;

        http.get(`${environment.apiUrl}/api/v1/users`).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users`);
        expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
        req.flush([]);
    });

    it('does not add Authorization header when not logged in', () => {
        userValue = null;

        http.get(`${environment.apiUrl}/api/v1/users`).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users`);
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush([]);
    });

    it('does not add Authorization header for non-API URLs', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;

        http.get('https://example.com/assets/config.json').subscribe();

        const req = httpMock.expectOne('https://example.com/assets/config.json');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('does not add Authorization header when session has no token', () => {
        userValue = { userName: 'admin' } as User;

        http.get(`${environment.apiUrl}/api/v1/users`).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users`);
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush([]);
    });

    it('does not add Authorization header when session has an empty token', () => {
        userValue = { userName: 'admin', token: '' } as User;

        http.get(`${environment.apiUrl}/api/v1/users`).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/users`);
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush([]);
    });
});
