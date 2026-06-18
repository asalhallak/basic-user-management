# Glossary

Short definitions for terms used across the README, API, Angular app, and scripts. For where to change behavior, see [code-map.md](code-map.md).

## Authentication and security

| Term | Meaning in this project |
|------|-------------------------|
| **JWT** | JSON Web Token returned by `POST /api/v1/auth/login`. The Angular app stores it in `localStorage` and sends it as `Authorization: Bearer <token>` on protected routes. |
| **Bearer token** | HTTP header format the API expects on protected endpoints: `Authorization: Bearer <jwt>`. |
| **Login credentials** | Hardcoded development username/password (`admin` / `123456789`) validated in `AuthService`. Not stored in the database. |
| **User record** | A profile row in SQL Server (`Users` table) managed through CRUD endpoints. Creating a user does **not** create a login account. |
| **Register page** | Angular form that posts to `POST /api/v1/users`. It requires an existing JWT—it is not public sign-up. |
| **Fake backend** | `fakeBackendProvider` in `app.module.ts` that intercepts legacy tutorial HTTP routes. Remove it when using the real API exclusively. |
| **AuthGuard** | Angular route guard that redirects unauthenticated visitors to `/account/login`. |

## API and data model

| Term | Meaning in this project |
|------|-------------------------|
| **`/api/v1`** | Base path for all REST endpoints (version 1). |
| **`userName`** | JSON field on the login request body (`Credentials.cs`). ASP.NET Core binding is case-insensitive, so `username` from the Angular app also works. |
| **`loginName`** | Unique identifier for a user **record** in the database and API (`UserResource`). Not the same as the hardcoded login username. |
| **`displayName`** | Human-readable name shown in the user list and editor. |
| **UserResource** | API DTO in `Resources/UserResource.cs`—the JSON shape returned and accepted by user endpoints. |
| **AddressResource** | Nested address object on create/update user requests. |
| **Entity** | Domain model class in `UserManagement.Domain/Entities/` (e.g. `User`, `Address`). Mapped to database tables by EF Core. |
| **Migration** | EF Core schema change file under `Migrations/`. Applied with `make migrate` or `dotnet ef database update`. |
| **Unit of work** | `IUnitOfWork` coordinates repositories and saves changes in a single transaction. |

## Architecture layers

| Term | Meaning in this project |
|------|-------------------------|
| **UserManagement.API** | ASP.NET Core web project—controllers, services, JWT setup, AutoMapper profiles. |
| **UserManagement.Domain** | Entities and repository interfaces; no database or HTTP dependencies. |
| **UserManagement.DataAccess.EFCore** | EF Core `ApplicationContext`, repository implementations, and migrations. |
| **Controller** | Thin HTTP adapter in `Controllers/V1/` that delegates to a service. |
| **Service** | Business logic (`AuthService`, `UsersService`) between controllers and repositories. |
| **Repository** | Data-access class implementing a domain interface (e.g. `UserRepository`). |
| **AutoMapper** | Maps between domain entities and API resources via `DomainToResourceMappingProfile`. |

## Front end

| Term | Meaning in this project |
|------|-------------------------|
| **`apiUrl`** | Base URL in `environment.ts` (default `http://localhost:5000`). All HTTP calls prepend this value. |
| **Interceptor** | `jwt.interceptor.ts` attaches the stored JWT to outgoing API requests; `error.interceptor.ts` handles HTTP errors. |
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

- [faq.md](faq.md) — common questions about auth, CI, and API quirks
- [code-map.md](code-map.md) — where to change endpoints, auth, schema, and UI
- [front-end-auth.md](front-end-auth.md) — JWT flow in the Angular app
- [api-responses.md](api-responses.md) — example JSON response bodies
- [environment-variables.md](environment-variables.md) — configuration reference
