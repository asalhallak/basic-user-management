import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Alert, AlertType } from '../models';

/**
 * Pub/sub service for global success, error, info, and warning banners.
 * Components subscribe via `onAlert()`; `<alert>` in `app.component.html` renders messages.
 * See docs/front-end-alerts.md.
 */
@Injectable({ providedIn: 'root' })
export class AlertService {
    private subject = new Subject<Alert>();
    private defaultId = 'default-alert';

    /** Observable stream filtered to alerts for the given host id (default: `default-alert`). */
    onAlert(id = this.defaultId): Observable<Alert> {
        return this.subject.asObservable().pipe(filter(x => x && x.id === id));
    }

    /** Publish a green success banner; optional `Alert` flags via `options` (e.g. `keepAfterRouteChange`). */
    success(message: string, options?: Partial<Alert>) {
        this.alert(new Alert({ ...options, type: AlertType.Success, message }));
    }

    /** Publish a red error banner; used by `ErrorInterceptor` and form failure handlers. */
    error(message: string, options?: Partial<Alert>) {
        this.alert(new Alert({ ...options, type: AlertType.Error, message }));
    }

    /** Publish a blue informational banner. */
    info(message: string, options?: Partial<Alert>) {
        this.alert(new Alert({ ...options, type: AlertType.Info, message }));
    }

    /** Publish a yellow warning banner. */
    warn(message: string, options?: Partial<Alert>) {
        this.alert(new Alert({ ...options, type: AlertType.Warning, message }));
    }

    /** Emit an alert event; assigns the default host id when `alert.id` is omitted. */
    alert(alert: Alert) {
        alert.id = alert.id || this.defaultId;
        this.subject.next(alert);
    }

    /** Clear visible alerts for the given host id (default: `default-alert`). */
    clear(id = this.defaultId) {
        this.subject.next(new Alert({ id }));
    }
}
