# Frequently asked questions

Short answers to common setup and behavior questions. For step-by-step setup, see [quick-start.md](quick-start.md). For full troubleshooting, see [README — Troubleshooting](../README.md#troubleshooting).

## Setup and tooling

### Which Node.js version should I use?

Use **Node.js 16** (see `.nvmrc` and [CI](../.github/workflows/ci.yml)). Angular 11 can fail on Node 17+ with OpenSSL/Webpack errors. Fix: switch to Node 16, or run `NODE_OPTIONS=--openssl-legacy-provider npm run build`. Details: [ci-and-builds.md](ci-and-builds.md).

### `make ci` passes but `make verify` fails — why?

`make ci` only compiles the API and front end (same as GitHub Actions). It does **not** start Docker, the API, or the Angular dev server. Smoke checks need a running stack:

```bash
make setup
make run-api      # terminal 1
make run-frontend # terminal 2 (unless using make verify-api)
make verify
```

See [manual-testing.md](manual-testing.md) for the pre-PR checklist.

### What is the difference between `make status` and `make verify`?

| Command | Fails on error? | What it checks |
|---------|-----------------|----------------|
| `make status` | No (informational) | Whether the database container, API, and front end appear reachable |
| `make verify` | Yes | Full smoke test: DB up, `401` without JWT, login, authenticated `GET /users`, and front end (unless `SKIP_FRONTEND=1`) |

Use `status` for a quick snapshot; use `verify` before opening a PR when runtime behavior changed. See [scripts.md](scripts.md).

## Authentication and users

### Why does the register page return `401`?

`POST /api/v1/users` requires a JWT. The register form is **not** public sign-up — log in with the [default credentials](../README.md#default-login) (`admin` / `123456789`) first. See [Authentication vs user data](../README.md#authentication-vs-user-data).

### I created a user — why can't I log in with that account?

Login and user records are separate in this sample:

- **Login** is hardcoded in `AuthService` (`admin` / `123456789`).
- **User CRUD** stores profiles in SQL Server.

Creating a user through the API or UI does not create a login account. To add real credential-based auth, wire `AuthService.Login` to validate against stored users or an identity provider.

### Should I remove the fake backend?

Yes, when using the real API exclusively. Remove `fakeBackendProvider` from the `providers` array in `front-end/src/app/app.module.ts`. The fake backend intercepts legacy tutorial routes (`/users/authenticate`) and can mask real API issues. See [front-end-auth.md](front-end-auth.md) and [README — Front-end and API integration](../README.md#front-end-and-api-integration).

### Why does `GET /api/v1/users` return `401` without a token?

That is expected. Protected routes require `Authorization: Bearer <token>`. A `401` without a token means the API is up and JWT protection is working. Log in via `POST /api/v1/auth/login` or run `make token`.

## API behavior

### Why does `GET /api/v1/users/{id}` return `null` for a missing user?

The controller maps the service result without checking for a missing record, so a non-existent ID currently returns `200 OK` with a `null` body instead of `404`. This is documented as a known edge case in [api-errors.md](api-errors.md).

### Why does creating a user with a duplicate `loginName` fail?

`Users.LoginName` has a unique database constraint. A duplicate insert returns `500` from the API. See [api-errors.md](api-errors.md).

## Security

### Is this project safe to deploy?

No, not as-is. It uses hardcoded credentials, a sample JWT secret, permissive CORS, and HTTP-friendly JWT settings. It is intended for **localhost learning only**. See [SECURITY.md](../SECURITY.md) before exposing it beyond your machine.

## Related docs

- [quick-start.md](quick-start.md) — install, run, verify
- [manual-testing.md](manual-testing.md) — pre-PR checklist
- [scripts.md](scripts.md) — shell scripts and Makefile targets
- [environment-variables.md](environment-variables.md) — configuration reference
- [code-map.md](code-map.md) — where to change API, auth, schema, and UI
