import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AccountService } from '../services';
import { LayoutComponent } from './layout.component';

describe('Auth LayoutComponent', () => {
    let router: Router;
    let isLoggedIn = false;

    beforeEach(async () => {
        isLoggedIn = false;

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [LayoutComponent],
            providers: [
                {
                    provide: AccountService,
                    useValue: {
                        isLoggedIn: () => isLoggedIn
                    }
                }
            ]
        }).compileComponents();

        router = TestBed.inject(Router);
    });

    it('redirects to home when already logged in', () => {
        isLoggedIn = true;
        const navigateSpy = spyOn(router, 'navigate');

        TestBed.createComponent(LayoutComponent);

        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('does not redirect when logged out', () => {
        isLoggedIn = false;
        const navigateSpy = spyOn(router, 'navigate');

        TestBed.createComponent(LayoutComponent);

        expect(navigateSpy).not.toHaveBeenCalled();
    });
});
