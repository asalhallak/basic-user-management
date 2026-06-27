/**
 * Production environment configuration used by `ng build` and `npm run build`.
 *
 * `angular.json` replaces `environment.ts` with this file for production builds.
 * Update `apiUrl` to your deployed API host before shipping; the default matches
 * the local API port so `npm run build` + static hosting still works against `make run-api`.
 *
 * @see docs/environment-variables.md
 * @see docs/cors-configuration.md
 */
export const environment = {
  production: true,
  apiUrl: 'http://localhost:5000'
};
