# Code map

A quick reference for where to change common behavior. For architecture and setup, see the [repository README](../README.md).

## By task

| Goal | Start here | Notes |
|------|------------|-------|
| Add or change an API endpoint | `UserManagementAPI/UserManagement.API/Controllers/V1/` | Wire through a service in `Services/` and DTOs in `Resources/`; see [api-controllers.md](api-controllers.md) and [api-resources.md](api-resources.md) |
| Change login or JWT behavior | `UserManagementAPI/UserManagement.API/Services/AuthService.cs`, `Helpers/JwtHelper.cs` | Login is hardcoded for local dev; JWT secret is in `appsettings.json`; see [api-services.md](api-services.md) and [api-jwt-authentication.md](api-jwt-authentication.md) |
| Change user CRUD logic | `UserManagementAPI/UserManagement.API/Services/UsersService.cs` | Controllers stay thin; persistence goes through `IUnitOfWork`; see [api-services.md](api-services.md) and [api-users-crud.md](api-users-crud.md) |
| Add or change a database table/column | `UserManagementAPI/UserManagement.Domain/Entities/` | Add an EF migration under `UserManagement.DataAccess.EFCore/Migrations/` (see [database.md](database.md) and [domain-model.md](domain-model.md)) |
| Change repository queries | `UserManagementAPI/UserManagement.DataAccess.EFCore/Repositories/` | Implement interfaces from `UserManagement.Domain/Interfaces/`; see [repository-pattern.md](repository-pattern.md) |
| Map entities ↔ API models | `UserManagementAPI/UserManagement.API/Mapper/DomainToResourceMappingProfile.cs` | Uses AutoMapper profiles; see [automapper-mapping.md](automapper-mapping.md) |
| Adjust CORS for the Angular app | `UserManagementAPI/UserManagement.API/MiddlewareConfiguration/CorsOriginConfiguration.cs` | Permissive for local development; see [cors-configuration.md](cors-configuration.md) |
| Change API base URL from the UI | `front-end/src/environments/environment.ts` | Production URL in `environment.prod.ts` |
| Change login/register UI | `front-end/src/app/auth/` | Login/register forms, `returnUrl`, and register quirks; see [front-end-login-register.md](front-end-login-register.md) and [front-end-models.md](front-end-models.md) |
| Change user list/editor UI | `front-end/src/app/users/` | List and add/edit components post to `/api/v1/users`; see [front-end-users.md](front-end-users.md) |
| Tutorial fake backend (legacy) | `front-end/src/app/helpers/fake-backend.ts` | Not registered in `app.module.ts`; reference only — see [fake-backend.md](fake-backend.md) |
| Understand JWT flow in the UI | [front-end-auth.md](front-end-auth.md) | `AccountService`, interceptors, `AuthGuard`, and `localStorage`; see [client-server-auth.md](client-server-auth.md) for client vs server layers |
| Change JWT attachment or global HTTP errors | `front-end/src/app/helpers/jwt.interceptor.ts`, `error.interceptor.ts` | Registration order in `app.module.ts`; see [front-end-interceptors.md](front-end-interceptors.md) |
| Change how API error bodies become toast text | `front-end/src/app/helpers/error-message.util.ts` | Used by `ErrorInterceptor` via `extractHttpErrorMessage()`; handles plain text, `{ message }`, validation `errors`, and `{ title }`; see [front-end-interceptors.md](front-end-interceptors.md) and [front-end-alerts.md](front-end-alerts.md) |
| Change front-end API calls or session | `front-end/src/app/services/account.service.ts` | Login, logout, and user CRUD HTTP methods; see [account-service.md](account-service.md) |
| Change success/error banners | `front-end/src/app/services/alert.service.ts`, `components/alert.component.ts` | Global `<alert>` in `app.component.html`; see [front-end-alerts.md](front-end-alerts.md) |
| Change navbar, logout, or home page | `front-end/src/app/app.component.html`, `home/home.component.html` | Root shell and post-login landing; see [front-end-shell.md](front-end-shell.md) |
| Add a lazy-loaded feature module | `front-end/src/app/app-routing.module.ts`, new folder under `app/` | Follow Auth/Users module pattern; see [front-end-modules.md](front-end-modules.md) |

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

Business logic lives in `Services/` (`AuthService`, `UsersService`). JWT middleware and `[Authorize]` are configured in [`Startup.cs`](../UserManagementAPI/UserManagement.API/Startup.cs). For controller conventions and how to add endpoints, see [api-controllers.md](api-controllers.md). For per-endpoint Users CRUD behavior and quirks, see [api-users-crud.md](api-users-crud.md). For token signing and validation details, see [api-jwt-authentication.md](api-jwt-authentication.md). For the HTTP pipeline order, see [api-request-flow.md](api-request-flow.md).

## Angular routes

| URL | Component | Auth | Purpose |
|-----|-----------|------|---------|
| `/` | `HomeComponent` | JWT required | Landing page after login |
| `/users` | `ListComponent` | JWT required | Browse users |
| `/users/add` | `AddEditComponent` | JWT required | Create a user |
| `/users/edit/:id` | `AddEditComponent` | JWT required | Edit a user |
| `/account/login` | `LoginComponent` | Public | Sign in |
| `/account/register` | `RegisterComponent` | Public | Register form (posts to protected API) |

Route definitions: `front-end/src/app/app-routing.module.ts`, `auth/auth-routing.module.ts`, and `users/users-routing.module.ts`. Unauthenticated visitors are redirected to `/account/login` by `AuthGuard`. For lazy loading, layout components, and `returnUrl` behavior, see [angular-routing.md](angular-routing.md). For list/editor component behavior and form fields, see [front-end-users.md](front-end-users.md).

## Related docs

- [cors-configuration.md](cors-configuration.md) — cross-origin policy for Angular ↔ API and production tightening
- [automapper-mapping.md](automapper-mapping.md) — entity ↔ DTO mapping profile and controller usage
- [domain-model.md](domain-model.md) — entity, API resource, and database column mapping
- [api-resources.md](api-resources.md) — API DTO classes, JSON properties, and endpoint matrix
- [repository-pattern.md](repository-pattern.md) — GenericRepository, UnitOfWork, and CRUD persistence flow
- [solution-structure.md](solution-structure.md) — .NET project references, DI registration, and Angular folder layout
- [api-controllers.md](api-controllers.md) — AuthController, UsersController, routing conventions, and add-endpoint checklist
- [api-services.md](api-services.md) — AuthService, UsersService, DI registration, quirks, and add-service checklist
- [api-request-flow.md](api-request-flow.md) — middleware pipeline and controller → service → repository flow
- [database.md](database.md) — connection settings, migrations, sqlcmd, and reset
- [quick-start.md](quick-start.md) — install, run, verify
- [api-jwt-authentication.md](api-jwt-authentication.md) — API login, JWT signing, and bearer validation
- [front-end-auth.md](front-end-auth.md) — JWT storage, interceptors, and route guards
- [front-end-interceptors.md](front-end-interceptors.md) — JwtInterceptor, ErrorInterceptor, chain order, and error re-throw flow
- [fake-backend.md](fake-backend.md) — tutorial fake-backend routes, storage, and removal
- [front-end-users.md](front-end-users.md) — Users module list/editor components and CRUD UI flow
- [front-end-alerts.md](front-end-alerts.md) — AlertService, global alert component, and form feedback patterns
- [front-end-shell.md](front-end-shell.md) — AppComponent navbar, nested layouts, and HomeComponent quirks
- [front-end-login-register.md](front-end-login-register.md) — AuthModule login/register UI and returnUrl flow
- [angular-routing.md](angular-routing.md) — lazy-loaded modules, route map, and AuthGuard flow
- [front-end-modules.md](front-end-modules.md) — AppModule vs lazy feature modules, shared services, and module pitfalls
- [api-users-crud.md](api-users-crud.md) — per-endpoint Users CRUD walkthrough and quirks
- [api-responses.md](api-responses.md) — example API response JSON
- [api-errors.md](api-errors.md) — error statuses and edge cases
- [README — Development notes](../README.md#development-notes)
- [README — Authentication vs user data](../README.md#authentication-vs-user-data)
- [CONTRIBUTING.md](../CONTRIBUTING.md) — pull request workflow
