/**
 * Barrel re-exports for route guards, HTTP interceptors, and error parsing helpers.
 *
 * Import from `'./helpers'` or `'../helpers'` instead of individual files.
 * `fakeBackendProvider` is intentionally omitted — see `fake-backend.ts` and docs/fake-backend.md.
 *
 * @see docs/front-end-interceptors.md
 * @see docs/front-end-modules.md
 */
export * from './auth.guard';
export * from './error-message.util';
export * from './error.interceptor';
export * from './jwt.interceptor';
