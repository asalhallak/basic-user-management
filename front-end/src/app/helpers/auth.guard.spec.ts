import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { User } from '../models';
import { AccountService } from '../services';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let userValue: User | null = null;
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const accountServiceStub = {
        get userValue(): User | null {
            return userValue;
        }
    };

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/users/add' } as RouterStateSnapshot;

    beforeEach(() => {
        userValue = null;
        routerSpy.navigate.calls.reset();

        TestBed.configureTestingModule({
            providers: [
                AuthGuard,
                { provide: Router, useValue: routerSpy },
                { provide: AccountService, useValue: accountServiceStub }
            ]
        });

        guard = TestBed.inject(AuthGuard);
    });

    it('allows access when a user session exists', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;

        expect(guard.canActivate(route, state)).toBe(true);
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('redirects to login with returnUrl when no session exists', () => {
        userValue = null;

        expect(guard.canActivate(route, state)).toBe(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(
            ['/account/login'],
            { queryParams: { returnUrl: '/users/add' } }
        );
    });

    it('redirects to login when session exists without a token', () => {
        userValue = { userName: 'admin' } as User;

        expect(guard.canActivate(route, state)).toBe(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(
            ['/account/login'],
            { queryParams: { returnUrl: '/users/add' } }
        );
    });

    it('redirects to login when session has an empty token', () => {
        userValue = { userName: 'admin', token: '' } as User;

        expect(guard.canActivate(route, state)).toBe(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(
            ['/account/login'],
            { queryParams: { returnUrl: '/users/add' } }
        );
    });
});
