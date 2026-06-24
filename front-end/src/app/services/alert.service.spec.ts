import { Alert, AlertType } from '../models';
import { AlertService } from './alert.service';

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        service = new AlertService();
    });

    it('emits success alerts on the default channel', () => {
        const alerts: AlertType[] = [];
        service.onAlert().subscribe(alert => alerts.push(alert.type));

        service.success('Saved');

        expect(alerts).toEqual([AlertType.Success]);
    });

    it('emits error, info, and warning alerts with the correct types', () => {
        const alerts: AlertType[] = [];
        service.onAlert().subscribe(alert => alerts.push(alert.type));

        service.error('Failed');
        service.info('Note');
        service.warn('Careful');

        expect(alerts).toEqual([AlertType.Error, AlertType.Info, AlertType.Warning]);
    });

    it('assigns the default alert id when none is provided', () => {
        let alertId: string | undefined;
        service.onAlert().subscribe(alert => { alertId = alert.id; });

        service.alert(new Alert({ type: AlertType.Info, message: 'Hello' }));

        expect(alertId).toBe('default-alert');
    });

    it('filters alerts by id', () => {
        const defaultAlerts: string[] = [];
        const customAlerts: string[] = [];

        service.onAlert().subscribe(alert => defaultAlerts.push(alert.message));
        service.onAlert('custom-alert').subscribe(alert => customAlerts.push(alert.message));

        service.success('Default message');
        service.alert(new Alert({ id: 'custom-alert', type: AlertType.Info, message: 'Custom message' }));

        expect(defaultAlerts).toEqual(['Default message']);
        expect(customAlerts).toEqual(['Custom message']);
    });

    it('forwards optional alert flags from convenience methods', () => {
        let keepAfterRouteChange: boolean | undefined;
        service.onAlert().subscribe(alert => {
            keepAfterRouteChange = alert.keepAfterRouteChange;
        });

        service.success('Saved', { keepAfterRouteChange: true });

        expect(keepAfterRouteChange).toBe(true);
    });

    it('clears alerts by emitting an empty alert for the target id', () => {
        const ids: string[] = [];
        service.onAlert('sidebar').subscribe(alert => ids.push(alert.id));

        service.clear('sidebar');

        expect(ids).toEqual(['sidebar']);
    });
});
