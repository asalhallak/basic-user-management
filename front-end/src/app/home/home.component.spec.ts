import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { User } from '../models';
import { AccountService } from '../services';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let userValue: User | null = null;
    const accountServiceStub = {
        get userValue(): User | null {
            return userValue;
        }
    };

    beforeEach(async () => {
        userValue = null;

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HomeComponent],
            providers: [
                { provide: AccountService, useValue: accountServiceStub }
            ]
        }).compileComponents();
    });

    it('reads the logged-in user from AccountService on init', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;

        expect(component.user).toBe(userValue);
    });

    it('renders a personalized greeting when a session exists', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;

        fixture = TestBed.createComponent(HomeComponent);
        fixture.detectChanges();

        const heading = fixture.nativeElement.querySelector('h1');
        expect(heading.textContent).toContain('Hi admin!');
    });

    it('leaves user unset when no session exists', () => {
        userValue = null;

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;

        expect(component.user).toBeNull();
    });

    it('includes a link to manage users', () => {
        userValue = { userName: 'admin', token: 'jwt-token' } as User;

        fixture = TestBed.createComponent(HomeComponent);
        fixture.detectChanges();

        const link = fixture.nativeElement.querySelector('a[routerLink="/users"]');
        expect(link).toBeTruthy();
        expect(link.textContent).toContain('Manage Users');
    });
});
