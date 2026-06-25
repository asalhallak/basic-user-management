import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { Alert, AlertType } from '../models';
import { AlertService } from '../services';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
    let component: AlertComponent;
    let fixture: ComponentFixture<AlertComponent>;
    let alertService: AlertService;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'users', component: AlertComponent }])],
            declarations: [AlertComponent],
            providers: [AlertService]
        }).compileComponents();

        fixture = TestBed.createComponent(AlertComponent);
        component = fixture.componentInstance;
        alertService = TestBed.inject(AlertService);
        router = TestBed.inject(Router);
    });

    it('displays alerts emitted on the default channel', () => {
        fixture.detectChanges();

        alertService.success('Saved');

        expect(component.alerts.length).toBe(1);
        expect(component.alerts[0].message).toBe('Saved');
        expect(component.alerts[0].type).toBe(AlertType.Success);
    });

    it('only shows alerts that match the component id', () => {
        component.id = 'sidebar';
        fixture.detectChanges();

        alertService.success('Default message');
        alertService.alert(new Alert({ id: 'sidebar', type: AlertType.Info, message: 'Sidebar message' }));

        expect(component.alerts.length).toBe(1);
        expect(component.alerts[0].message).toBe('Sidebar message');
    });

    it('clears alerts without keepAfterRouteChange when an empty alert is received', () => {
        fixture.detectChanges();

        alertService.success('First');
        alertService.info('Second');
        alertService.clear();

        expect(component.alerts).toEqual([]);
    });

    it('keeps alerts marked keepAfterRouteChange when cleared', () => {
        fixture.detectChanges();

        alertService.success('Persistent', { keepAfterRouteChange: true });
        alertService.error('Temporary');
        alertService.clear();

        expect(component.alerts.length).toBe(1);
        expect(component.alerts[0].message).toBe('Persistent');
        expect(component.alerts[0].keepAfterRouteChange).toBeUndefined();
    });

    it('clears alerts on route navigation', async () => {
        const clearSpy = spyOn(alertService, 'clear').and.callThrough();
        fixture.detectChanges();

        await router.navigateByUrl('/users');

        expect(clearSpy).toHaveBeenCalledWith('default-alert');
    });

    it('removeAlert removes the alert immediately when fade is disabled', () => {
        component.fade = false;
        fixture.detectChanges();

        const alert = new Alert({ type: AlertType.Info, message: 'Dismiss me' });
        alertService.alert(alert);

        component.removeAlert(alert);

        expect(component.alerts).toEqual([]);
    });

    it('removeAlert fades out the alert when fade is enabled', fakeAsync(() => {
        fixture.detectChanges();

        const alert = new Alert({ type: AlertType.Warning, message: 'Fade out' });
        alertService.alert(alert);

        component.removeAlert(alert);

        expect(component.alerts.length).toBe(1);
        expect(component.alerts[0].fade).toBe(true);

        tick(250);

        expect(component.alerts).toEqual([]);
    }));

    it('auto-closes alerts after three seconds', fakeAsync(() => {
        fixture.detectChanges();

        alertService.info('Auto dismiss', { autoClose: true });

        expect(component.alerts.length).toBe(1);

        tick(3000);
        tick(250);

        expect(component.alerts).toEqual([]);
    }));

    it('cssClass maps alert types to Bootstrap classes', () => {
        fixture.detectChanges();

        expect(component.cssClass(new Alert({ type: AlertType.Success, message: 'ok' }))).toContain('alert-success');
        expect(component.cssClass(new Alert({ type: AlertType.Error, message: 'fail' }))).toContain('alert-danger');
        expect(component.cssClass(new Alert({ type: AlertType.Info, message: 'note' }))).toContain('alert-info');
        expect(component.cssClass(new Alert({ type: AlertType.Warning, message: 'warn' }))).toContain('alert-warning');
    });

    it('cssClass adds fade when the alert has fade enabled', () => {
        fixture.detectChanges();

        const alert = new Alert({ type: AlertType.Info, message: 'fade', fade: true });

        expect(component.cssClass(alert)).toContain('fade');
    });
});
