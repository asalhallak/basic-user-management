# Improvement ideas and known gaps

This sample app intentionally keeps auth, validation, and error handling simple so the layered .NET + Angular layout stays easy to follow. The gaps below are **documented behavior**, not oversights — they are good starting points if you want to practice extending a real-world-style codebase.

For security limitations before any deployment, see [SECURITY.md](../SECURITY.md). For API error details, see [api-errors.md](api-errors.md).

## Quick reference

| Area | Current state | Good first step |
|------|---------------|-----------------|
| Login | Hardcoded `admin` / `123456789` in `AuthService` | Validate against database users or wire ASP.NET Identity |
| JWT | Development secret in `appsettings.json`; 7-day lifetime | Move secret to user secrets / env vars; add refresh or shorter TTL |
| User `GET` by ID | ~~`200` with `null` when ID is missing~~ | Fixed — `UsersController.Get` returns `404 NotFound()` when the service returns `null` |
| User `DELETE` | ~~`500` when ID is missing~~ | Fixed — `UsersController.Delete` returns `404 NotFound()` when the user does not exist |
| User `PUT` | ~~`200` or `500` when ID is missing~~ | Fixed — `UsersController.Update` returns `404 NotFound()` when the user does not exist |
| Duplicate `loginName` | ~~`500` from database constraint~~ | Fixed — `UsersController` returns `409 Conflict` via `UsersService.LoginNameExists` |
| Validation | `[Required]` on `loginName` and `displayName`; other fields still optional | Extend with FluentValidation or more data annotations on `UserResource` |
| POST `/users` response | ~~Returns domain `User` entity instead of mapped `UserResource`~~ | Fixed — `UsersController.Add` maps the created entity to `UserResource` before returning |
| Fake backend | ~~Still registered in `app.module.ts`~~ | Fixed — `fakeBackendProvider` removed; the app uses the real API exclusively. Legacy interceptor code remains in `helpers/fake-backend.ts` for reference — see [fake-backend.md](fake-backend.md) |
| Register form | ~~Field names don't match API (`username` vs `loginName`)~~ | Fixed — `RegisterComponent.onSubmit()` maps legacy form fields to `loginName` and `displayName` before calling `POST /api/v1/users`; see [front-end-login-register.md](front-end-login-register.md) |
| Home greeting | ~~Template uses `firstName` but login stores `userName`~~ | Fixed — home page uses `user.userName` |
| Error toasts | ~~Each form handles API errors locally; no global alert from `ErrorInterceptor`~~ | Fixed — `ErrorInterceptor` calls `AlertService.error()` for all failed HTTP responses; session expiry shows a dedicated message on `401`/`403` with an active session. Components reset local state only in error handlers. Validation and conflict JSON is parsed in `extractHttpErrorMessage()` before display. |
| Add/edit `profilePictureUrl` | ~~Required in form despite optional on API~~ | Fixed — optional in add/edit form, matching `UserResource` and API docs |
| Tests | Karma/Jasmine configured; `extractHttpErrorMessage`, `AuthService.Login`, `AccountService.login`, `AccountService.update`, `AccountService.getById`, `AccountService.getAll`, and `AccountService.delete` unit tests added | Add API integration tests or Angular `AccountService.register` tests |
| CORS / HTTPS | Permissive for localhost | Tighten before any non-local deployment — see [cors-configuration.md](cors-configuration.md) |

## API hardening

Documented mismatches between intended REST behavior and the current implementation are listed in [api-errors.md](api-errors.md). The highest-impact fixes for API consumers:

1. ~~**Not-found handling** — `UsersService.Get` uses `FirstOrDefault()`; the controller always returns `Ok(...)`. Add an explicit check and `NotFound()` when the entity is missing.~~ Fixed for `GET /users/{id}` in `UsersController.Get(int id)`, `DELETE /users/{id}` in `UsersController.Delete(int id)`, and `PUT /users/{id}` in `UsersController.Update(int id, ...)`. See [code-map](code-map.md), [api-services.md](api-services.md), [api-controllers.md](api-controllers.md), and [api-users-crud.md](api-users-crud.md).
2. ~~**Conflict responses** — Duplicate `loginName` values surface as `500`. Catch `DbUpdateException` (or check before insert) and return `409` with a clear message.~~ Fixed — `UsersController.Add` and `Update` call `UsersService.LoginNameExists` and return `409 Conflict`.
3. ~~**Input validation** — Partial JSON bodies can persist unexpected defaults. Add validation on `UserResource` and return `400 Bad Request` with problem details.~~ Partially fixed — `loginName` and `displayName` are `[Required]` on `UserResource`; `[ApiController]` returns `400` when they are missing. Extend validation for nested `address` and numeric fields.

## Front-end integration

The Angular app was adapted from a tutorial that used a local fake backend. The app now targets the real API exclusively:

- ~~Remove `fakeBackendProvider` from `front-end/src/app/app.module.ts`~~ Fixed — provider removed; see [fake-backend.md](fake-backend.md) for legacy interceptor details.
- Add or change routes following the lazy-module pattern in [angular-routing.md](angular-routing.md).
- Log in with the [default credentials](../README.md#default-login) before using register or user management screens.
- ~~Align the register form with API field names (`loginName`, `displayName`, nested `address`).~~ Fixed — `RegisterComponent` maps legacy tutorial fields to `loginName` and `displayName` on submit; for full address and salary fields use **Users → Add** — see [front-end-login-register.md](front-end-login-register.md) and [front-end-users.md](front-end-users.md).
- ~~Surface API errors consistently via `AlertService` instead of per-form `subscribe` handlers.~~ Fixed — `ErrorInterceptor` shows global error toasts; see [front-end-alerts.md](front-end-alerts.md) and [front-end-interceptors.md](front-end-interceptors.md).

## Testing

The repository has minimal automated tests. Suggested starting points (see also [README — Testing](../README.md#testing)):

| Target | Suggestion |
|--------|------------|
| `extractHttpErrorMessage` | ~~Unit test parsing of validation, conflict, and plain-text API errors~~ Fixed — see `front-end/src/app/helpers/error-message.util.spec.ts` |
| `AuthService.Login` | ~~Unit test: valid credentials return a token; invalid return `null`~~ Fixed — see `UserManagement.API.Tests/AuthServiceTests.cs` |
| `UsersController` | Integration test with in-memory EF provider or Testcontainers SQL Server |
| `AccountService.login` | ~~Angular unit test: maps API response into `localStorage`~~ Fixed — see `front-end/src/app/services/account.service.spec.ts` |
| `AccountService.update` | ~~Angular unit test: PUT payload, session sync for own record, no sync for other users~~ Fixed — see `front-end/src/app/services/account.service.spec.ts` |
| `AccountService.getById` | ~~Angular unit test: GET by ID returns API user without changing session~~ Fixed — see `front-end/src/app/services/account.service.spec.ts` |
| `AccountService.getAll` | ~~Angular unit test: GET users list returns API array without changing session~~ Fixed — see `front-end/src/app/services/account.service.spec.ts` |
| `AccountService.delete` | ~~Angular unit test: DELETE by ID without changing session~~ Fixed — see `front-end/src/app/services/account.service.spec.ts` |

Run `make ci` after adding tests to confirm builds still pass.

## Security and configuration

Before exposing this stack beyond `localhost`, work through [SECURITY.md](../SECURITY.md) and [environment-variables.md](environment-variables.md):

- Replace `JwtSecret` and database passwords (never commit production values).
- Replace hardcoded login in `AuthService` with real credential validation.
- Restrict CORS origins in `CorsOriginConfiguration.cs` — see [cors-configuration.md](cors-configuration.md).
- Enable HTTPS and set `RequireHttpsMetadata` appropriately for JWT bearer middleware.

## How to pick a task

1. Skim this page and [code-map.md](code-map.md) to find files to change.
2. Follow [onboarding.md](onboarding.md) for local setup and [manual-testing.md](manual-testing.md) before opening a PR.
3. Prefer **one focused change** per pull request (for example, only `404` handling, or only removing the fake backend).

## Related docs

- [automapper-mapping.md](automapper-mapping.md) — entity ↔ DTO mapping and POST response consistency
- [api-controllers.md](api-controllers.md) — AuthController, UsersController, routing conventions, and add-endpoint checklist
- [api-services.md](api-services.md) — AuthService, UsersService, DI registration, and known quirks
- [api-resources.md](api-resources.md) — API DTO classes, JSON properties, and endpoint matrix
- [client-server-auth.md](client-server-auth.md) — client vs server auth layers and why AuthGuard alone is not security
- [api-jwt-authentication.md](api-jwt-authentication.md) — API login, token signing, and bearer validation
- [api-users-crud.md](api-users-crud.md) — per-endpoint Users CRUD behavior and quirks
- [api-errors.md](api-errors.md) — current error statuses and edge cases
- [code-map.md](code-map.md) — file locations by task
- [repository-pattern.md](repository-pattern.md) — repository interfaces, UnitOfWork, and CRUD flow
- [faq.md](faq.md) — auth vs users, `status` vs `verify`, deploy safety
- [angular-routing.md](angular-routing.md) — route map, lazy modules, and AuthGuard flow
- [front-end-modules.md](front-end-modules.md) — AppModule vs lazy feature modules and shared services
- [account-service.md](account-service.md) — front-end HTTP client, session, and endpoint mapping
- [front-end-login-register.md](front-end-login-register.md) — AuthModule login/register UI and legacy field quirks
- [front-end-users.md](front-end-users.md) — Users module list/editor UI and CRUD flow
- [front-end-models.md](front-end-models.md) — Angular form fields vs API JSON
- [fake-backend.md](fake-backend.md) — tutorial fake-backend routes, storage, and removal
- [front-end-interceptors.md](front-end-interceptors.md) — JwtInterceptor, ErrorInterceptor, and error re-throw flow
- [front-end-alerts.md](front-end-alerts.md) — AlertService and global alert component
- [front-end-shell.md](front-end-shell.md) — AppComponent navbar, layouts, and HomeComponent quirks
- [SECURITY.md](../SECURITY.md) — vulnerability reporting and known limitations
- [CONTRIBUTING.md](../CONTRIBUTING.md) — branch workflow and PR checklist
