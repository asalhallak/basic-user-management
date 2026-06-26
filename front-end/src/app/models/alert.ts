/**
 * Toast/banner message emitted by {@link AlertService} and rendered by `AlertComponent`.
 *
 * @see docs/front-end-alerts.md
 */
export class Alert {
    /** Host element id; defaults to `default-alert` in {@link AlertService}. */
    id: string;
    type: AlertType;
    message: string;
    /** When true, the banner auto-dismisses after a timeout. */
    autoClose: boolean;
    /** When true, the message survives Angular route changes. */
    keepAfterRouteChange: boolean;
    /** Enables CSS fade-out when clearing. */
    fade: boolean;

    constructor(init?: Partial<Alert>) {
        Object.assign(this, init);
    }
}

/** Severity levels for global alert banners. */
export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}
