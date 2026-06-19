# Environment and configuration reference

A single index of settings used across Docker, the API, the Angular app, shell scripts, and CI. Values must stay aligned when you change ports or passwords locally.

## Quick alignment checklist

When changing local ports or credentials, update these together:

| Change | Files to update |
|--------|-----------------|
| SQL host port | `docker-compose.yml` (`ports`), `appsettings.json` (`DefaultConnection`) |
| SA password | `docker-compose.yml` (`SA_PASSWORD`), `appsettings.json` (`DefaultConnection`) |
| API port | `launchSettings.json`, script defaults (`API_URL`), `environment.ts` (`apiUrl`) |
| JWT secret | `appsettings.json` (`JwtSecret`) only (front end does not sign tokens) |

See [database.md](database.md) for connection-string details and [README — Configuration reference](../README.md#configuration-reference) for default values.

## Shell script variables

Scripts under `scripts/` and Makefile smoke targets accept the same overrides. Run `./scripts/<name>.sh --help` for usage. For per-script behavior, exit codes, and when to use `status` vs `verify`, see [scripts.md](scripts.md).

| Variable | Default | Used by | Purpose |
|----------|---------|---------|---------|
| `API_URL` | `http://localhost:5000` | `get-token.sh`, `status.sh`, `verify-stack.sh` | Base URL for `/api/v1` endpoints |
| `AUTH_USER` | `admin` | `get-token.sh`, `verify-stack.sh` | Login username for smoke checks |
| `AUTH_PASSWORD` | `123456789` | `get-token.sh`, `verify-stack.sh` | Login password for smoke checks |
| `FRONTEND_URL` | `http://localhost:4200` | `status.sh`, `verify-stack.sh` | Angular dev server to probe |
| `SKIP_FRONTEND` | `0` | `verify-stack.sh` | Set to `1` for API-only checks (`make verify-api`) |

**Examples:**

```bash
# API on a different port
API_URL=http://localhost:5050 make token

# API-only smoke test (no Angular dev server)
SKIP_FRONTEND=1 ./scripts/verify-stack.sh
# or: make verify-api
```

Makefile equivalents: `make status`, `make verify`, `make verify-api`, `make token`.

## Docker Compose

| Setting | Location | Default | Notes |
|---------|----------|---------|-------|
| `SA_PASSWORD` | `docker-compose.yml` → `db.environment` | See compose file | Must match the password in `appsettings.json` |
| `ACCEPT_EULA` | `docker-compose.yml` | `Y` | Required for the SQL Server image |
| Host port | `docker-compose.yml` → `ports` | `1434:1433` | Host `1434` maps to container `1433` |

Start/stop: `make db-up`, `make db-down`, `make db-reset`.

## API (`appsettings.json`)

| Key | Purpose | Notes |
|-----|---------|-------|
| `ConnectionStrings:DefaultConnection` | SQL Server connection | Host `127.0.0.1,1434`; password must match `SA_PASSWORD` |
| `JwtSecret` | Symmetric key for signing JWTs | Development-only; replace before any real deployment |
| `Logging:LogLevel` | ASP.NET Core log verbosity | `Information` by default |
| `AllowedHosts` | Host filtering | `*` for local development |

JWT lifetime (7 days) is set in code: `UserManagementAPI/UserManagement.API/Helpers/JwtHelper.cs`. Issuer and audience validation are disabled for simplicity. See [api-jwt-authentication.md](api-jwt-authentication.md) for the full login and validation flow.

**Development overrides:** ASP.NET Core also reads `appsettings.Development.json` when `ASPNETCORE_ENVIRONMENT=Development` (the default for `dotnet run`). Use it for local-only overrides without editing the committed base file.

## Angular environments

| File | When used | Key setting |
|------|-----------|-------------|
| `front-end/src/environments/environment.ts` | `ng serve` / `npm start` | `apiUrl: 'http://localhost:5000'` |
| `front-end/src/environments/environment.prod.ts` | `ng build` / `npm run build` | Production API URL |

The JWT interceptor (`helpers/jwt.interceptor.ts`) only attaches `Authorization` headers to requests whose URL starts with `environment.apiUrl`. See [front-end-auth.md](front-end-auth.md).

## Local service URLs

| Service | Default URL | Config source |
|---------|-------------|---------------|
| SQL Server (host) | `127.0.0.1:1434` | `docker-compose.yml`, connection string |
| API (HTTP) | `http://localhost:5000` | `launchSettings.json`, `API_URL`, `environment.apiUrl` |
| API (HTTPS) | `https://localhost:5001` | `launchSettings.json` (optional profile) |
| Angular dev server | `http://localhost:4200` | `ng serve` default, `FRONTEND_URL` |

## CI and build tooling

| Setting | Where | Value | Notes |
|---------|-------|-------|-------|
| Node.js | `.nvmrc`, `.github/workflows/ci.yml` | `16` | Angular 11 compatibility; see [ci-and-builds.md](ci-and-builds.md) |
| .NET SDK | `ci.yml` | `3.1.x` | Matches `UserManagement.API.csproj` target |
| `NODE_OPTIONS` | Local only (Node 17+) | `--openssl-legacy-provider` | Workaround for Angular 11 Webpack on newer Node; CI uses Node 16 |

CI does not start Docker or run smoke scripts — only `dotnet build` and `npm run build`. Use `make ci` locally to match.

## Hardcoded development credentials

These are intentional sample values, not environment variables:

| Concern | Location | Value |
|---------|----------|-------|
| Login | `AuthService.cs` | `admin` / `123456789` |
| Script defaults | `get-token.sh`, `verify-stack.sh` | Same as above |

User records in SQL Server are separate from login accounts. See [README — Authentication vs user data](../README.md#authentication-vs-user-data).

## Related docs

- [database.md](database.md) — connection string, migrations, sqlcmd, reset
- [api-jwt-authentication.md](api-jwt-authentication.md) — API login, token signing, and bearer validation
- [front-end-auth.md](front-end-auth.md) — JWT storage and interceptors
- [ci-and-builds.md](ci-and-builds.md) — CI vs local builds
- [SECURITY.md](../SECURITY.md) — known limitations before deployment
- [README — Configuration reference](../README.md#configuration-reference) — ports and defaults in the main guide
