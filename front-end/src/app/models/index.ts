/**
 * Barrel re-exports for shared TypeScript models used across services and components.
 *
 * `User` is a legacy tutorial shape; API payloads may use different field names.
 * `Alert` and `AlertType` back the global toast component and `AlertService`.
 *
 * @see docs/front-end-models.md
 * @see docs/front-end-alerts.md
 */
export * from './alert';
export * from './user';
