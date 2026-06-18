# Manual testing checklist

A short pre-pull-request checklist for verifying changes locally. CI only compiles the solution (see [ci-and-builds.md](ci-and-builds.md)); runtime smoke checks are your responsibility.

## Quick reference

| Goal | Command | Requires |
|------|---------|----------|
| Compile like CI | `make ci` | .NET SDK, Node.js 16 |
| See what is running | `make status` | Docker (for DB row) |
| Full stack smoke test | `make verify` | Docker, running API, Angular dev server |
| API-only smoke test | `make verify-api` | Docker, running API |
| Get a JWT for curl | `make token` | Running API |

## Pre-PR checklist

Copy this into your pull request description when you changed runtime behavior:

- [ ] `make ci` passes (minimum for every PR)
- [ ] `make setup` succeeds on a clean database (when migrations or Docker config changed)
- [ ] `make verify` or `make verify-api` passes (when API, auth, or scripts changed)
- [ ] Manual UI walkthrough completed (when front-end or auth flow changed)
- [ ] README, `docs/`, or CONTRIBUTING updated (when setup or workflow changed)

## 1. Build verification

From the repository root:

```bash
make ci
```

This matches [GitHub Actions CI](../.github/workflows/ci.yml): `dotnet restore/build` and `npm ci` + production Angular build. No database or dev servers required.

For faster iterative builds during development, `make build` is fine; run `make ci` before opening the PR.

## 2. Runtime smoke tests

Start the stack:

```bash
make setup        # first time or after db-reset
make run-api      # terminal 1
make run-frontend # terminal 2 (skip for API-only changes)
```

Check status, then run automated smoke checks:

```bash
make status
make verify       # or: make verify-api
```

`make verify` confirms the database container is up, the API returns `401` without a token, login succeeds, authenticated `GET /users` works, and the Angular dev server responds on port `4200`. See [README — Verify the stack](../README.md#verify-the-stack) for environment variable overrides.

## 3. Manual UI walkthrough

Use this when you touched Angular components, routing, interceptors, or the login flow.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open `http://localhost:4200` while logged out | Redirect to `/account/login` |
| 2 | Sign in with `admin` / `123456789` | Land on home page (`/`) |
| 3 | Navigate to **Users** | User list loads (may be empty) |
| 4 | Create a user with a unique `loginName` | User appears in the list |
| 5 | Edit the user | Changes persist after refresh |
| 6 | Delete the user | User removed from the list |
| 7 | Log out and revisit `/users` | Redirect back to login |

**Register page note:** `POST /users` requires a JWT. The register form is not public sign-up — log in first. See [README — Authentication vs user data](../README.md#authentication-vs-user-data).

## 4. API spot checks

When you changed controllers, services, or DTOs, exercise endpoints beyond the smoke script:

- **REST Client:** Follow [rest-client-guide.md](rest-client-guide.md), then send requests from [api-examples.http](api-examples.http).
- **curl:** `TOKEN=$(make token)` then use the examples in [README — Try it with curl](../README.md#try-it-with-curl).
- **Response shapes:** Compare bodies against [api-responses.md](api-responses.md).
- **Edge cases:** Try invalid login, missing JWT, and duplicate `loginName` per [api-errors.md](api-errors.md).

## 5. Database changes

After editing entities or adding migrations:

```bash
make db-reset     # optional: confirm migrations apply on a clean volume
make migrate
make verify-api
```

Inspect schema or data with sqlcmd examples in [database.md](database.md).

## When something fails

| Failure | First step |
|---------|------------|
| `make ci` — OpenSSL / Webpack error | Use Node.js 16 (`.nvmrc`); see [ci-and-builds.md](ci-and-builds.md) |
| `make migrate` — connection refused | Wait 15–30s after `make db-up`, or run `make db-logs` |
| `make verify` — front end check fails | Confirm `make run-frontend` is running, or use `make verify-api` |
| UI login works in curl but not browser | Remove `fakeBackendProvider` from `app.module.ts`; clear `localStorage` |

Full troubleshooting: [README — Troubleshooting](../README.md#troubleshooting).

## Related docs

- [CONTRIBUTING.md](../CONTRIBUTING.md) — pull request workflow
- [quick-start.md](quick-start.md) — install, run, and everyday commands
- [ci-and-builds.md](ci-and-builds.md) — what CI runs vs local smoke checks
- [scripts.md](scripts.md) — shell scripts reference and when to use status vs verify
- [code-map.md](code-map.md) — where to change API, auth, schema, and UI
