# Improvement ideas and known gaps

This sample app intentionally keeps auth, validation, and error handling simple so the layered .NET + Angular layout stays easy to follow. The gaps below are **documented behavior**, not oversights — they are good starting points if you want to practice extending a real-world-style codebase.

For security limitations before any deployment, see [SECURITY.md](../SECURITY.md). For API error details, see [api-errors.md](api-errors.md).

## Quick reference

| Area | Current state | Good first step |
|------|---------------|-----------------|
| Login | Hardcoded `admin` / `123456789` in `AuthService` | Validate against database users or wire ASP.NET Identity |
| JWT | Development secret in `appsettings.json`; 7-day lifetime | Move secret to user secrets / env vars; add refresh or shorter TTL |
| User `GET` by ID | `200` with `null` when ID is missing | Return `404 NotFound()` from controller or service |
| User `DELETE` | `500` when ID is missing | Check existence first; return `404` |
| Duplicate `loginName` | `500` from database constraint | Catch unique violation; return `409 Conflict` |
| Validation | No `[Required]` on API models | Add FluentValidation or data annotations on `UserResource` |
| Fake backend | Still registered in `app.module.ts` | Remove `fakeBackendProvider` when using the real API |
| Register form | Field names don't match API (`username` vs `loginName`) | Align form and `AccountService` with [front-end-models.md](front-end-models.md) and [user model](../README.md#user-model) |
| Tests | Karma/Protractor configured; no specs; no .NET test project | Add `AuthService` unit tests or API integration tests |
| CORS / HTTPS | Permissive for localhost | Tighten before any non-local deployment |

## API hardening

Documented mismatches between intended REST behavior and the current implementation are listed in [api-errors.md](api-errors.md). The highest-impact fixes for API consumers:

1. **Not-found handling** — `UsersService.Get` uses `FirstOrDefault()`; the controller always returns `Ok(...)`. Add an explicit check and `NotFound()` when the entity is missing. Start in `UserManagement.API/Services/UsersService.cs` and `Controllers/V1/UsersController.cs` ([code-map](code-map.md)).
2. **Conflict responses** — Duplicate `loginName` values surface as `500`. Catch `DbUpdateException` (or check before insert) and return `409` with a clear message.
3. **Input validation** — Partial JSON bodies can persist unexpected defaults. Add validation on `UserResource` and return `400 Bad Request` with problem details.

## Front-end integration

The Angular app was adapted from a tutorial that used a local fake backend. When pointing at the real API:

- Remove `fakeBackendProvider` from `front-end/src/app/app.module.ts` ([front-end-auth.md](front-end-auth.md)).
- Log in with the [default credentials](../README.md#default-login) before using register or user management screens.
- Align the register form with API field names (`loginName`, `displayName`, nested `address`). See [front-end-models.md](front-end-models.md) and [README — Front-end and API integration](../README.md#front-end-and-api-integration).

## Testing

The repository has no automated tests yet. Suggested starting points (see also [README — Testing](../README.md#testing)):

| Target | Suggestion |
|--------|------------|
| `AuthService.Login` | Unit test: valid credentials return a token; invalid return `null` |
| `UsersController` | Integration test with in-memory EF provider or Testcontainers SQL Server |
| `AccountService.login` | Angular unit test: maps API response into `localStorage` |

Run `make ci` after adding tests to confirm builds still pass.

## Security and configuration

Before exposing this stack beyond `localhost`, work through [SECURITY.md](../SECURITY.md) and [environment-variables.md](environment-variables.md):

- Replace `JwtSecret` and database passwords (never commit production values).
- Replace hardcoded login in `AuthService` with real credential validation.
- Restrict CORS origins in `CorsOriginConfiguration.cs`.
- Enable HTTPS and set `RequireHttpsMetadata` appropriately for JWT bearer middleware.

## How to pick a task

1. Skim this page and [code-map.md](code-map.md) to find files to change.
2. Follow [onboarding.md](onboarding.md) for local setup and [manual-testing.md](manual-testing.md) before opening a PR.
3. Prefer **one focused change** per pull request (for example, only `404` handling, or only removing the fake backend).

## Related docs

- [api-jwt-authentication.md](api-jwt-authentication.md) — API login, token signing, and bearer validation
- [api-errors.md](api-errors.md) — current error statuses and edge cases
- [code-map.md](code-map.md) — file locations by task
- [repository-pattern.md](repository-pattern.md) — repository interfaces, UnitOfWork, and CRUD flow
- [faq.md](faq.md) — auth vs users, `status` vs `verify`, deploy safety
- [front-end-models.md](front-end-models.md) — Angular form fields vs API JSON
- [SECURITY.md](../SECURITY.md) — vulnerability reporting and known limitations
- [CONTRIBUTING.md](../CONTRIBUTING.md) — branch workflow and PR checklist
