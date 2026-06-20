# Glossary

Short definitions for terms used across the README, API, Angular app, and scripts. For where to change behavior, see [code-map.md](code-map.md).

## Authentication and security

| Term | Meaning in this project |
|------|-------------------------|
| **JWT** | JSON Web Token returned by `POST /api/v1/auth/login`. Signed with `JwtSecret` in `JwtHelper`; validated by JWT bearer middleware in `Startup.cs`. The Angular app stores it in `localStorage` and sends it as `Authorization: Bearer <token>` on protected routes. See [api-jwt-authentication.md](api-jwt-authentication.md) and [front-end-auth.md](front-end-auth.md). |
| **Bearer token** | HTTP header format the API expects on protected endpoints: `Authorization: Bearer <jwt>`. |
| **Login credentials** | Hardcoded development username/password (`admin` / `123456789`) validated in `AuthService`. Not stored in the database. |
| **User record** | A profile row in SQL Server (`Users` table) managed through CRUD endpoints. Creating a user does **not** create a login account. |
| **Register page** | Angular form that posts to `POST /api/v1/users`. It requires an existing JWT—it is not public sign-up. See [front-end-login-register.md](front-end-login-register.md). |
| **Fake backend** | `fakeBackendProvider` in `app.module.ts` that intercepts legacy tutorial HTTP routes (`/users/authenticate`, etc.). Remove it when using the real API exclusively. See [fake-backend.md](fake-backend.md). |
| **CORS** | Cross-Origin Resource Sharing — browser security requiring the API to allow requests from the Angular dev server origin (`http://localhost:4200`). Configured in `CorsOriginConfiguration.cs`. See [cors-configuration.md](cors-configuration.md). |
| **AuthGuard** | Angular route guard that redirects unauthenticated visitors to `/account/login` with a `returnUrl` query parameter. Checks `localStorage` only—not JWT expiry. See [angular-routing.md](angular-routing.md), [front-end-login-register.md](front-end-login-register.md), and [front-end-interceptors.md](front-end-interceptors.md). |

## API and data model

| Term | Meaning in this project |
|------|-------------------------|
| **`/api/v1`** | Base path for all REST endpoints (version 1). |
| **`userName`** | JSON field on the login request body (`Credentials.cs`). ASP.NET Core binding is case-insensitive, so `username` from the Angular app also works. |
| **`loginName`** | Unique identifier for a user **record** in the database and API (`UserResource`). Not the same as the hardcoded login username. |
| **`displayName`** | Human-readable name shown in the user list and editor. |
| **UserResource** | API DTO in `Resources/UserResource.cs`—the JSON shape returned and accepted by user endpoints. See [api-resources.md](api-resources.md). |
| **AddressResource** | Nested address object on create/update user requests. See [api-resources.md](api-resources.md). |
| **Entity** | Domain model class in `UserManagement.Domain/Entities/` (e.g. `User`, `Address`). Mapped to database tables by EF Core. See [domain-model.md](domain-model.md) for field mapping. |
| **Migration** | EF Core schema change file under `Migrations/`. Applied with `make migrate` or `dotnet ef database update`. |
| **Unit of work** | `IUnitOfWork` coordinates repositories and saves changes in a single transaction. See [repository-pattern.md](repository-pattern.md). |

## Architecture layers

| Term | Meaning in this project |
|------|-------------------------|
| **UserManagement.API** | ASP.NET Core web project—controllers, services, JWT setup, AutoMapper profiles. |
| **UserManagement.Domain** | Entities and repository interfaces; no database or HTTP dependencies. |
| **UserManagement.DataAccess.EFCore** | EF Core `ApplicationContext`, repository implementations, and migrations. |
| **Controller** | Thin HTTP adapter in `Controllers/V1/` that delegates to a service. `AuthController` handles login; `UsersController` handles all `/api/v1/users` CRUD — see [api-controllers.md](api-controllers.md) and [api-users-crud.md](api-users-crud.md). |
| **Service** | Business logic (`AuthService`, `UsersService`) between controllers and repositories. |
| **Repository** | Data-access class implementing a domain interface (e.g. `UserRepository`). See [repository-pattern.md](repository-pattern.md). |
| **AutoMapper** | Maps between domain entities and API resources via `DomainToResourceMappingProfile`. See [automapper-mapping.md](automapper-mapping.md). |

## Front end

| Term | Meaning in this project |
|------|-------------------------|
| **`apiUrl`** | Base URL in `environment.ts` (default `http://localhost:5000`). All HTTP calls prepend this value. |
| **Interceptor** | Angular `HTTP_INTERCEPTORS` chain: `JwtInterceptor` attaches the stored JWT to `environment.apiUrl` requests; `ErrorInterceptor` auto-logouts on `401`/`403` and re-throws error messages. See [front-end-interceptors.md](front-end-interceptors.md). |
| **AlertService** | Pub/sub service for Bootstrap alert banners (`success`, `error`, etc.). Rendered by `<alert>` in `app.component.html`. See [front-end-alerts.md](front-end-alerts.md). |
| **`AccountService`** | Angular singleton that calls auth and user CRUD endpoints, stores the JWT in `localStorage`, and exposes the current session. See [account-service.md](account-service.md). |
| **Users module** | Lazy-loaded Angular module at `/users` with list, add, and edit screens. See [front-end-users.md](front-end-users.md). |
| **Auth module** | Lazy-loaded Angular module at `/account` with login and register forms. See [front-end-login-register.md](front-end-login-register.md). |
| **NgModule** | Angular module boundary (`AppModule`, `AuthModule`, `UsersModule`). Root module registers interceptors; feature modules lazy-load on first navigation. See [front-end-modules.md](front-end-modules.md). |
| **App shell** | Root `AppComponent` layout: navbar (when logged in), global `<alert>`, and top-level `router-outlet`. See [front-end-shell.md](front-end-shell.md). |
| **`localStorage`** | Browser storage where `AccountService` persists the logged-in user object (including the token). |
| **SPA** | Single-page application—the Angular app served at `http://localhost:4200` during development. |

## Local development

| Term | Meaning in this project |
|------|-------------------------|
| **`make ci`** | Compile-only check matching GitHub Actions. Does not start Docker or dev servers. |
| **`make verify`** | Runtime smoke test: database up, JWT guard, login, authenticated users, and front end. |
| **`make status`** | Informational report of what appears to be running. Never fails. |
| **`make token`** | Fetches a JWT from the running API via `scripts/get-token.sh`. |
| **SA password** | SQL Server system administrator password in `docker-compose.yml`. Must match the API connection string. |
| **Host port 1434** | SQL Server port on your machine (mapped from container port 1433). |

## Related docs

- [solution-structure.md](solution-structure.md) — .NET solution layout, namespaces, and Angular folders
- [faq.md](faq.md) — common questions about auth, CI, and API quirks
- [improvement-ideas.md](improvement-ideas.md) — known gaps and good first contribution tasks
- [code-map.md](code-map.md) — where to change endpoints, auth, schema, and UI
- [api-jwt-authentication.md](api-jwt-authentication.md) — API login, token signing, and bearer validation
- [front-end-interceptors.md](front-end-interceptors.md) — JwtInterceptor, ErrorInterceptor, and request chain order
- [front-end-auth.md](front-end-auth.md) — JWT flow in the Angular app
- [front-end-shell.md](front-end-shell.md) — AppComponent navbar and home page layout
- [api-responses.md](api-responses.md) — example JSON response bodies
- [environment-variables.md](environment-variables.md) — configuration reference
