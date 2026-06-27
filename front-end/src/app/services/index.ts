/**
 * Barrel re-exports for root-scoped application services.
 *
 * Both services use `@Injectable({ providedIn: 'root' })` and are imported via
 * `'./services'` or `'../services'` from feature modules without NgModule providers.
 *
 * @see docs/account-service.md
 * @see docs/front-end-alerts.md
 * @see docs/front-end-modules.md
 */
export * from './account.service';
export * from './alert.service';
