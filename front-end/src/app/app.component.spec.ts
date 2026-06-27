import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { User } from './models';
import { AccountService } from './services';
import { AppComponent } from './app.component';

@Component({ selector: 'alert', template: '' })
class AlertStubComponent {}

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let userSubject: BehaviorSubject<User>;
    let logoutSpy: jasmine.Spy;

    beforeEach(async () => {
        userSubject = new BehaviorSubject<User>(null);
        logoutSpy = jasmine.createSpy('logout');

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent, AlertStubComponent],
            providers: [
                {
                    provide: AccountService,
                    useValue: {
                        user: userSubject.asObservable(),
                        isLoggedIn: () => {
                            const user = userSubject.value;
                            const token = user?.token;
                            return typeof token === 'string' && token.length > 0;
                        },
                        logout: logoutSpy
                    }
                }
            ]
        }).compileComponents();
    });

    it('subscribes to AccountService.user and updates the local user', () => {
        const session = { userName: 'admin', token: 'jwt-token' } as User;

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;

        userSubject.next(session);

        expect(component.user).toBe(session);
    });

    it('shows the navbar when a session exists', () => {
        userSubject.next({ userName: 'admin', token: 'jwt-token' } as User);

        fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        const navbar = fixture.nativeElement.querySelector('nav.navbar');
        expect(navbar).toBeTruthy();
        expect(fixture.nativeElement.querySelector('a[routerLink="/users"]')).toBeTruthy();
    });

    it('hides the navbar when logged out', () => {
        userSubject.next(null);

        fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('nav.navbar')).toBeNull();
    });

    it('hides the navbar when session has an empty token', () => {
        userSubject.next({ userName: 'admin', token: '' } as User);

        fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('nav.navbar')).toBeNull();
    });

    it('delegates logout to AccountService', () => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;

        component.logout();

        expect(logoutSpy).toHaveBeenCalled();
    });
});
