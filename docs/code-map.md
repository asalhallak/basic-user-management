# Code map

A quick reference for where to change common behavior. For architecture and setup, see the [repository README](../README.md).

## By task

| Goal | Start here | Notes |
|------|------------|-------|
| Add or change an API endpoint | `UserManagementAPI/UserManagement.API/Controllers/V1/` | Wire through a service in `Services/` and DTOs in `Resources/` |
| Change login or JWT behavior | `UserManagementAPI/UserManagement.API/Services/AuthService.cs`, `Helpers/JwtHelper.cs` | Login is hardcoded for local dev; JWT secret is in `appsettings.json` |
| Change user CRUD logic | `UserManagementAPI/UserManagement.API/Services/UsersService.cs` | Controllers stay thin; persistence goes through `IUnitOfWork` |
| Add or change a database table/column | `UserManagementAPI/UserManagement.Domain/Entities/` | Add an EF migration under `UserManagement.DataAccess.EFCore/Migrations/` (see below) |
| Change repository queries | `UserManagementAPI/UserManagement.DataAccess.EFCore/Repositories/` | Implement interfaces from `UserManagement.Domain/Interfaces/` |
| Map entities ↔ API models | `UserManagementAPI/UserManagement.API/Mapper/DomainToResourceMappingProfile.cs` | Uses AutoMapper profiles |
| Adjust CORS for the Angular app | `UserManagementAPI/UserManagement.API/MiddlewareConfiguration/CorsOriginConfiguration.cs` | Permissive for local development |
| Change API base URL from the UI | `front-end/src/environments/environment.ts` | Production URL in `environment.prod.ts` |
| Change login/register UI | `front-end/src/app/auth/` | `account.service.ts` calls `/api/v1/auth/login` |
| Change user list/editor UI | `front-end/src/app/users/` | List and add/edit components post to `/api/v1/users` |
| Remove tutorial fake backend | `front-end/src/app/app.module.ts` | Drop `fakeBackendProvider` when using the real API only |

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

Use [`api-examples.http`](api-examples.http) or the [curl examples](../README.md#try-it-with-curl) in the README.

## Related docs

- [quick-start.md](quick-start.md) — install, run, verify
- [README — Development notes](../README.md#development-notes)
- [README — Authentication vs user data](../README.md#authentication-vs-user-data)
- [CONTRIBUTING.md](../CONTRIBUTING.md) — pull request workflow
