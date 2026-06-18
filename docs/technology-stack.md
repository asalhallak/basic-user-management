# Technology stack reference

Pinned versions and toolchain expectations for this repository. Use this page when upgrading dependencies, debugging version mismatches, or aligning your local environment with CI.

For setup commands, see [quick-start.md](quick-start.md). For CI build steps and Node.js compatibility notes, see [ci-and-builds.md](ci-and-builds.md).

## Toolchain (local and CI)

| Tool | Version | Where defined |
|------|---------|---------------|
| .NET SDK | **3.1.x** | `UserManagementAPI/**/*.csproj` (`netcoreapp3.1`), [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
| Node.js | **16** | [`.nvmrc`](../.nvmrc), CI workflow |
| npm | Bundled with Node 16 | Used via `npm ci` / `npm install` in `front-end/` |
| Docker | Required for SQL Server | [docker-compose.yml](../docker-compose.yml) |
| dotnet-ef | Global tool (latest compatible) | Installed by `make install-ef` |

Verify prerequisites:

```bash
make check-deps
```

## Back-end packages

| Package | Version | Project |
|---------|---------|---------|
| ASP.NET Core | 3.1 (`netcoreapp3.1`) | All API projects |
| Entity Framework Core | 5.0.0 | `UserManagement.DataAccess.EFCore` |
| EF Core SQL Server provider | 5.0.0 | `UserManagement.DataAccess.EFCore` |
| JWT Bearer authentication | 3.1.10 | `UserManagement.API` |
| AutoMapper | 10.1.1 | `UserManagement.API` |
| AutoMapper DI extensions | 8.1.0 | `UserManagement.API` |
| System.IdentityModel.Tokens.Jwt | 6.8.0 | `UserManagement.API` |

Source of truth: `UserManagementAPI/UserManagement.API/UserManagement.API.csproj` and `UserManagementAPI/UserManagement.DataAccess.EFCore/UserManagement.DataAccess.EFCore.csproj`.

## Front-end packages

| Package | Version | Notes |
|---------|---------|-------|
| Angular | ~11.0.1 | Core framework packages |
| Angular CLI | ~11.0.2 | Dev dependency |
| Angular Material / CDK | ^11.0.1 | UI components |
| RxJS | ~6.6.0 | Reactive streams |
| TypeScript | ~4.0.x | See `front-end/package.json` devDependencies |

Source of truth: `front-end/package.json` and `front-end/package-lock.json`.

**Node 17+ note:** Angular 11 builds may fail with OpenSSL/Webpack errors on newer Node versions. CI and local development expect Node **16**. See [ci-and-builds.md](ci-and-builds.md) and [faq.md](faq.md).

## Database

| Component | Value | Where defined |
|-----------|-------|---------------|
| Engine | Microsoft SQL Server (Docker) | `docker-compose.yml` image `mcr.microsoft.com/mssql/server` |
| Host port | `1434` → container `1433` | `docker-compose.yml` |
| Database name | `UserManagement` | `UserManagementAPI/UserManagement.API/appsettings.json` |

Connection string and SA password must stay aligned between Docker and `appsettings.json`. See [environment-variables.md](environment-variables.md) and [database.md](database.md).

## Authentication

| Setting | Value | Where defined |
|---------|-------|---------------|
| Scheme | JWT Bearer | `Startup.cs` |
| Signing secret | Development sample value | `appsettings.json` → `JwtSecret` |
| Token lifetime | 7 days | `UserManagement.API/Helpers/JwtHelper.cs` |
| Login credentials | Hardcoded `admin` / `123456789` | `AuthService.cs` |

See [SECURITY.md](../SECURITY.md) before any non-local deployment.

## CI parity

GitHub Actions runs on every push and pull request to `main`:

```bash
make ci
```

This restores and builds the .NET solution, then runs `npm ci` and a production Angular build — matching [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). It does **not** start Docker or dev servers. Runtime checks use `make verify` instead.

## Upgrade guidance

This sample intentionally targets older but stable versions (ASP.NET Core 3.1, Angular 11). Upgrading is a multi-step effort:

1. **Node.js / Angular** — Upgrade Node and Angular together; expect breaking changes in build tooling and dependencies.
2. **.NET / EF Core** — Target framework and EF Core versions should move in lockstep; regenerate or review migrations after entity changes.
3. **SQL Server image** — Pin a specific tag in `docker-compose.yml` if you need reproducible container versions (currently uses the rolling `latest` channel tag).

For intentional gaps and smaller improvement tasks, see [improvement-ideas.md](improvement-ideas.md).

## Related docs

- [ci-and-builds.md](ci-and-builds.md) — CI scope, `make ci` vs local builds, common failures
- [environment-variables.md](environment-variables.md) — connection strings, JWT secret, script overrides
- [glossary.md](glossary.md) — project terminology
- [README — Tech stack](../README.md#tech-stack) — high-level overview table
