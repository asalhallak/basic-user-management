# Front-end authentication

How the Angular app signs in, stores the JWT, and attaches it to API requests. For login credentials and API endpoints, see the [README](../README.md#default-login) and [API reference](../README.md#api-reference).

## Overview

```mermaid
sequenceDiagram
    participant UI as LoginComponent
    participant Account as AccountService
    participant Storage as localStorage
    participant JWT as JwtInterceptor
    participant API as UserManagement.API

    UI->>Account: login(username, password)
    Account->>API: POST /api/v1/auth/login
    API-->>Account: { userName, token }
    Account->>Storage: setItem("user", JSON)
    Account-->>UI: navigate to home

    Note over JWT,API: Subsequent API calls
    UI->>JWT: HttpClient request to apiUrl
    JWT->>API: Authorization: Bearer &lt;token&gt;
```

Login is the only unauthenticated API call from the browser. All `/api/v1/users` routes require a valid JWT (see [Authentication vs user data](../README.md#authentication-vs-user-data)).

## Stored session

After a successful login, `AccountService` persists the API response in browser `localStorage` under the key `user`:

```json
{
  "userName": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

On startup, the service reads this value into a `BehaviorSubject`, so a page refresh keeps the user signed in until they log out or the token is rejected.

| Action | Where | Effect |
|--------|-------|--------|
| Login | `account.service.ts` → `login()` | Writes `user` to `localStorage` |
| Logout | `account.service.ts` → `logout()` | Removes `user`, redirects to `/account/login` |
| Expired/invalid token | `error.interceptor.ts` | `401` or `403` triggers automatic logout |

## JWT details

Tokens are issued by `JwtHelper.GenerateToken` on the API:

| Property | Value |
|----------|-------|
| Signing key | `JwtSecret` in `appsettings.json` |
| Algorithm | HMAC-SHA256 |
| Lifetime | 7 days (`DateTime.UtcNow.AddDays(7)`) |
| Claim | `ClaimTypes.Name` set to the login username |
| Issuer / audience | Not validated (sample-app simplification) |

Decode a token at [jwt.io](https://jwt.io) to inspect claims during debugging. Re-login when protected routes return `401`.

## HTTP interceptors

Registered in `front-end/src/app/app.module.ts` (order matters — JWT runs before error handling). For the full chain including the fake backend, registration order, and error re-throw flow, see [front-end-interceptors.md](front-end-interceptors.md).

| Interceptor | File | Behavior |
|-------------|------|----------|
| `JwtInterceptor` | `helpers/jwt.interceptor.ts` | When `AccountService.isLoggedIn()` is true and the request URL starts with `environment.apiUrl`, adds `Authorization: Bearer <token>` |
| `ErrorInterceptor` | `helpers/error.interceptor.ts` | On `401` or `403` with a stored user, calls `logout()` and shows a session-expired alert; all HTTP errors show a global toast via `AlertService` |

See [front-end-alerts.md](front-end-alerts.md) for how error messages are parsed and displayed.

The JWT interceptor only attaches headers to requests aimed at the configured API base URL (`environment.apiUrl`). Third-party URLs are left unchanged.

## Route protection

`AuthGuard` (`helpers/auth.guard.ts`) protects `/` and `/users/*`:

- If `AccountService.isLoggedIn()` returns true, navigation proceeds.
- Otherwise the user is redirected to `/account/login?returnUrl=<attempted path>`.

Public routes live under `/account` (login and register). Route tables are listed in [code-map.md — Angular routes](code-map.md#angular-routes). For lazy loading, layout components, and the full navigation flow, see [angular-routing.md](angular-routing.md).

## Common pitfalls

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| API calls lack `Authorization` header | Not logged in, or `apiUrl` mismatch | Log in; confirm `environment.apiUrl` matches the running API |
| Sudden redirect to login | Token expired or invalid | Log in again (tokens last 7 days) |
| Login works in REST Client but not UI | Stale tutorial `localStorage` or `fakeBackendProvider` re-enabled for debugging | Clear site data for `http://localhost:4200`; confirm `app.module.ts` does not register `fakeBackendProvider` — [fake-backend.md](fake-backend.md), [code-map.md](code-map.md) |
| Register returns `401` | User endpoints require JWT | Log in first; register is not public sign-up |

## Related files

| File | Role |
|------|------|
| `front-end/src/app/services/account.service.ts` | Login, logout, localStorage, user CRUD HTTP calls |
| `front-end/src/app/helpers/jwt.interceptor.ts` | Attach Bearer token |
| `front-end/src/app/helpers/error.interceptor.ts` | Auto-logout on auth errors |
| `front-end/src/app/helpers/auth.guard.ts` | Protect authenticated routes |
| `front-end/src/environments/environment.ts` | `apiUrl` for local development |
| `UserManagementAPI/UserManagement.API/Helpers/JwtHelper.cs` | Token generation |
| `UserManagementAPI/UserManagement.API/Services/AuthService.cs` | Hardcoded login validation |

## Related docs

- [client-server-auth.md](client-server-auth.md) — how client route protection differs from API JWT enforcement
- [front-end-interceptors.md](front-end-interceptors.md) — JwtInterceptor, ErrorInterceptor, chain order, and debugging
- [front-end-login-register.md](front-end-login-register.md) — AuthModule login/register forms, returnUrl, and register quirks
- [fake-backend.md](fake-backend.md) — tutorial fake-backend routes, storage, and removal
- [api-jwt-authentication.md](api-jwt-authentication.md) — API login, token signing, and bearer validation
- [account-service.md](account-service.md) — `AccountService` methods, endpoints, and component usage
- [front-end-models.md](front-end-models.md) — Angular form fields vs API JSON (`loginName`, register vs editor)
- [front-end-alerts.md](front-end-alerts.md) — success/error banners and AlertService usage
- [front-end-shell.md](front-end-shell.md) — AppComponent navbar, global alert host, and layouts
- [quick-start.md](quick-start.md) — run the stack and sign in
- [angular-routing.md](angular-routing.md) — route map, lazy modules, and AuthGuard redirect flow
- [code-map.md](code-map.md) — where to change login UI and auth behavior
- [api-responses.md](api-responses.md) — login response JSON shape
- [api-errors.md](api-errors.md) — error and edge-case behavior
- [README — Front-end and API integration](../README.md#front-end-and-api-integration) — model field mismatches between UI and API
