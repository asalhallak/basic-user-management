# CI and local builds

How GitHub Actions verifies changes and how to run the same checks on your machine. For day-to-day setup, see [quick-start.md](quick-start.md). For pull request expectations, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## What CI runs

On every push and pull request to `main`, [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs four build steps:

| Step | Command | Purpose |
|------|---------|---------|
| Build API | `dotnet restore` + `dotnet build --no-restore` | Compile the .NET solution |
| Test API | `dotnet test --no-build` | Run xUnit tests (`AuthController.Login`, `AuthService.Login`, `JwtHelper.GenerateToken`, `UsersService`) |
| Build front end | `npm ci` + `npm run build` | Production Angular build |
| Test front end | `npm test -- --watch=false --browsers=ChromeHeadless` | Run Karma/Jasmine unit tests (`extractHttpErrorMessage`, `JwtInterceptor`, `ErrorInterceptor`, `AuthGuard`, `AlertService`, `AccountService`) |

The workflow uses **.NET SDK 3.1.x** and **Node.js 16** (matching [`.nvmrc`](../.nvmrc)).

## What CI does not run

CI does **not**:

- Start Docker or SQL Server
- Apply EF Core migrations
- Run `make verify` or other runtime smoke checks
- Start the API or run integration tests against a live database

A green CI badge means the solution builds; it does not prove the stack runs end-to-end.

## Local equivalents

| Goal | Command | Notes |
|------|---------|-------|
| Match CI exactly | `make ci` | Uses `npm ci` (clean install from lockfile) |
| Quick local build | `make build` | Uses existing `node_modules`; faster for iterative work |
| API compile only | `make build-api` | .NET solution only |
| Front-end production build | `make build-frontend` | Angular `dist/` output |
| API unit tests | `make test-api` | xUnit run; same command as CI (run after `make build-api`) |
| Front-end unit tests | `make test-frontend` | Headless Karma run; same command as CI |
| Remove build artifacts | `make clean` | Deletes `bin`/`obj` and `front-end/dist` |
| Full runtime smoke check | `make verify` | Requires Docker, running API, and Angular dev server |
| API-only smoke check | `make verify-api` | Skips the front-end check (`SKIP_FRONTEND=1`) |

```bash
# Minimum before opening a PR (same as CI)
make ci
```

When your change affects runtime behavior (API routes, auth, database, front-end API calls), also run:

```bash
make setup
make run-api       # terminal 1
make run-frontend  # terminal 2
make verify        # terminal 3
```

## CI vs local build differences

| | CI (`make ci`) | Local dev (`make build`) |
|--|----------------|--------------------------|
| npm install | `npm ci` (strict lockfile) | `npm install` assumed already done |
| Database | Not used | Optional for compile; required for `make verify` |
| Node version | 16 (workflow) | Should match `.nvmrc` (16 recommended) |

If CI passes locally with `make ci` but `make build` fails, run `npm ci` in `front-end/` to sync dependencies with the lockfile.

## Common CI failures

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `dotnet build` errors | API compile or package issues | Run `make build-api` locally and fix reported errors |
| `npm ci` fails | `package-lock.json` out of sync with `package.json` | Run `npm install` in `front-end/` and commit the updated lockfile |
| `npm run build` fails with OpenSSL / `ERR_OSSL_EVP_UNSUPPORTED` | Node.js 17+ locally | Use Node 16 (`nvm use`) or `NODE_OPTIONS=--openssl-legacy-provider npm run build` |
| CI green but app broken at runtime | CI does not smoke-test | Run `make verify` after starting the stack |

## Workflow diagram

```mermaid
flowchart LR
    subgraph ci [GitHub Actions CI]
        Restore[dotnet restore]
        BuildApi[dotnet build]
        NpmCi[npm ci]
        BuildFe[npm run build]
        TestFe[npm test headless]
        Restore --> BuildApi
        NpmCi --> BuildFe
        BuildFe --> TestFe
    end

    subgraph local [Optional local checks]
        Setup[make setup]
        RunApi[make run-api]
        RunFe[make run-frontend]
        Verify[make verify]
        Setup --> RunApi
        RunApi --> Verify
        RunFe --> Verify
    end

    ci -->|merge when green| main[main branch]
    local -->|before PR when behavior changed| main
```

## Related docs

- [CONTRIBUTING.md](../CONTRIBUTING.md) — pull request checklist
- [README — Continuous integration](../README.md#continuous-integration)
- [quick-start.md](quick-start.md) — install, run, and verify the stack
- [README — Troubleshooting](../README.md#troubleshooting) — OpenSSL and migration issues
