/**
 * Development environment configuration used by `ng serve` and `npm start`.
 *
 * `apiUrl` must match the running API (default `http://localhost:5000` per launchSettings.json).
 * Production builds swap this file for `environment.prod.ts` via `angular.json` fileReplacements.
 *
 * @see docs/environment-variables.md
 * @see docs/front-end-auth.md
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
