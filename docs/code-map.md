# Code map

A quick reference for where to change common behavior. For architecture and setup, see the [repository README](../README.md).

## By task

| Goal | Start here | Notes |
|------|------------|-------|
| Add or change an API endpoint | `UserManagementAPI/UserManagement.API/Controllers/V1/` | Wire through a service in `Services/` and DTOs in `Resources/` |
| Change login or JWT behavior | `UserManagementAPI/UserManagement.API/Services/AuthService.cs`, `Helpers/JwtHelper.cs` | Login is hardcoded for local dev; JWT secret is in `appsettings.json`; see [api-jwt-authentication.md](api-jwt-authentication.md) |
| Change user CRUD logic | `UserManagementAPI/UserManagement.API/Services/UsersService.cs` | Controllers stay thin; persistence goes through `IUnitOfWork` |
| Add or change a database table/column | `UserManagementAPI/UserManagement.Domain/Entities/` | Add an EF migration under `UserManagement.DataAccess.EFCore/Migrations/` (see [database.md](database.md) and [domain-model.md](domain-model.md)) |
| Change repository queries | `UserManagementAPI/UserManagement.DataAccess.EFCore/Repositories/` | Implement interfaces from `UserManagement.Domain/Interfaces/`; see [repository-pattern.md](repository-pattern.md) |
| Map entities ↔ API models | `UserManagementAPI/UserManagement.API/Mapper/DomainToResourceMappingProfile.cs` | Uses AutoMapper profiles; see [automapper-mapping.md](automapper-mapping.md) |
| Adjust CORS for the Angular app | `UserManagementAPI/UserManagement.API/MiddlewareConfiguration/CorsOriginConfiguration.cs` | Permissive for local development |
| Change API base URL from the UI | `front-end/src/environments/environment.ts` | Production URL in `environment.prod.ts` |
| Change login/register UI | `front-end/src/app/auth/` | `account.service.ts` calls `/api/v1/auth/login`; see [front-end-models.md](front-end-models.md) for field-name alignment |
| Change user list/editor UI | `front-end/src/app/users/` | List and add/edit components post to `/api/v1/users` |
| Remove tutorial fake backend | `front-end/src/app/app.module.ts` | Drop `fakeBackendProvider` when using the real API only |
| Understand JWT flow in the UI | [front-end-auth.md](front-end-auth.md) | `AccountService`, interceptors, `AuthGuard`, and `localStorage` |

## Add an EF Core migration

After changing entities in `UserManagement.Domain/Entities/`:

```bash
cd UserManagementAPI/UserManagement.DataAccess.EFCore
dotnet ef migrations add <MigrationName> --startup-project ../UserManagement.API
make migrate   # or: dotnet ef database update --startup-project ../UserManagement.API
```

Document any new setup steps in the README if migrations require manual intervention.

## API-only development

You can work on the back end without running the Angular dev server:

```bash
make setup
make run-api
make verify-api    # SKIP_FRONTEND=1 smoke checks
make token         # JWT for curl or docs/api-examples.http
```

Use [`api-examples.http`](api-examples.http) or the [curl examples](../README.md#try-it-with-curl) in the README. Expected response shapes are in [api-responses.md](api-responses.md).

## API endpoints (V1)

All routes are defined under `UserManagementAPI/UserManagement.API/Controllers/V1/`. Protected endpoints require `Authorization: Bearer <token>`. Request and response shapes are in the [README API reference](../README.md#api-reference) and [api-responses.md](api-responses.md).

| Method | Route | Auth | Controller action | Source file |
|--------|-------|------|-------------------|-------------|
| `POST` | `/api/v1/auth/login` | No | `AuthController.Login` | [`AuthController.cs`](../UserManagementAPI/UserManagement.API/Controllers/V1/AuthController.cs) |
| `GET` | `/api/v1/users` | Yes | `UsersController.Get` | [`UsersController.cs`](../UserManagementAPI/UserManagement.API/Controllers/V1/UsersController.cs) |
| `GET` | `/api/v1/users/{id}` | Yes | `UsersController.Get` | [`UsersController.cs`](../UserManagementAPI/UserManagement.API/Controllers/V1/UsersController.cs) |
| `POST` | `/api/v1/users` | Yes | `UsersController.Add` | [`UsersController.cs`](../UserManagementAPI/UserManagement.API/Controllers/V1/UsersController.cs) |
| `PUT` | `/api/v1/users/{id}` | Yes | `UsersController.Update` | [`UsersController.cs`](../UserManagementAPI/UserManagement.API/Controllers/V1/UsersController.cs) |
| `DELETE` | `/api/v1/users/{id}` | Yes | `UsersController.Delete` | [`UsersController.cs`](../UserManagementAPI/UserManagement.API/Controllers/V1/UsersController.cs) |

Business logic lives in `Services/` (`AuthService`, `UsersService`). JWT middleware and `[Authorize]` are configured in [`Startup.cs`](../UserManagementAPI/UserManagement.API/Startup.cs). For token signing and validation details, see [api-jwt-authentication.md](api-jwt-authentication.md). For the HTTP pipeline order, see [api-request-flow.md](api-request-flow.md).

## Angular routes

| URL | Component | Auth | Purpose |
|-----|-----------|------|---------|
| `/` | `HomeComponent` | JWT required | Landing page after login |
| `/users` | `ListComponent` | JWT required | Browse users |
| `/users/add` | `AddEditComponent` | JWT required | Create a user |
| `/users/edit/:id` | `AddEditComponent` | JWT required | Edit a user |
| `/account/login` | `LoginComponent` | Public | Sign in |
| `/account/register` | `RegisterComponent` | Public | Register form (posts to protected API) |

Route definitions: `front-end/src/app/app-routing.module.ts`, `auth/auth-routing.module.ts`, and `users/users-routing.module.ts`. Unauthenticated visitors are redirected to `/account/login` by `AuthGuard`.

## Related docs

- [automapper-mapping.md](automapper-mapping.md) — entity ↔ DTO mapping profile and controller usage
- [domain-model.md](domain-model.md) — entity, API resource, and database column mapping
- [repository-pattern.md](repository-pattern.md) — GenericRepository, UnitOfWork, and CRUD persistence flow
- [solution-structure.md](solution-structure.md) — .NET project references, DI registration, and Angular folder layout
- [api-request-flow.md](api-request-flow.md) — middleware pipeline and controller → service → repository flow
- [database.md](database.md) — connection settings, migrations, sqlcmd, and reset
- [quick-start.md](quick-start.md) — install, run, verify
- [api-jwt-authentication.md](api-jwt-authentication.md) — API login, JWT signing, and bearer validation
- [front-end-auth.md](front-end-auth.md) — JWT storage, interceptors, and route guards
- [api-responses.md](api-responses.md) — example API response JSON
- [api-errors.md](api-errors.md) — error statuses and edge cases
- [README — Development notes](../README.md#development-notes)
- [README — Authentication vs user data](../README.md#authentication-vs-user-data)
- [CONTRIBUTING.md](../CONTRIBUTING.md) — pull request workflow
