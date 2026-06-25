import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { User } from '../models';
import { AccountService } from '../services';
import { LayoutComponent } from './layout.component';

describe('Auth LayoutComponent', () => {
    let router: Router;
    let userValue: User | null = null;

    beforeEach(async () => {
        userValue = null;

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [LayoutComponent],
            providers: [
                {
                    provide: AccountService,
                    useValue: {
                        get userValue(): User | null {
                            return userValue;
                        }
                    }
                }
            ]
        }).compileComponents();

        router = TestBed.inject(Router);
    });

    it('redirects to home when a session already exists', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;
        const navigateSpy = spyOn(router, 'navigate');

        TestBed.createComponent(LayoutComponent);

        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('does not redirect when logged out', () => {
        userValue = null;
        const navigateSpy = spyOn(router, 'navigate');

        TestBed.createComponent(LayoutComponent);

        expect(navigateSpy).not.toHaveBeenCalled();
    });
});
