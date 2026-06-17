# Documentation

Supplementary guides and assets for local development. The main setup guide lives in the [repository README](../README.md).

## Contents

| Resource | Description |
|----------|-------------|
| [quick-start.md](quick-start.md) | One-page checklist: install, run, verify, and everyday commands |
| [code-map.md](code-map.md) | Where to change API endpoints, auth, database schema, and Angular UI |
| [database.md](database.md) | SQL Server connection, migrations, sqlcmd inspection, and reset |
| [front-end-auth.md](front-end-auth.md) | How the Angular app stores the JWT, interceptors, and route guards |
| [api-responses.md](api-responses.md) | Example JSON response bodies for every `/api/v1` endpoint |
| [api-errors.md](api-errors.md) | Error statuses, database constraint failures, and known API edge cases |
| [api-examples.http](api-examples.http) | REST Client requests for every `/api/v1` endpoint (login, CRUD, and error cases) |
| [rest-client-guide.md](rest-client-guide.md) | How to send requests with the REST Client extension and capture the JWT |
| [../scripts/check-deps.sh](../scripts/check-deps.sh) | Verify Docker, .NET, Node.js, npm, and curl are installed (`make check-deps`) |
| [../scripts/get-token.sh](../scripts/get-token.sh) | Fetch a JWT from the running API (`make token`) |
| [../scripts/status.sh](../scripts/status.sh) | Show whether database, API, and front end are running (`make status`) |
| [../scripts/verify-stack.sh](../scripts/verify-stack.sh) | Smoke-check database, API auth, and front end (`make verify`) |

## Quick start

New to the project? Start with **[quick-start.md](quick-start.md)** for a condensed setup checklist.

For the full guide, follow [Getting started](../README.md#getting-started) in the README, then:

1. Start the API: `make run-api`.
2. Follow **[rest-client-guide.md](rest-client-guide.md)** to send requests from `api-examples.http` (install REST Client, log in, capture the JWT).

## Environment variables

Scripts and smoke checks accept the same overrides:

| Variable | Default | Used by |
|----------|---------|---------|
| `API_URL` | `http://localhost:5000` | `get-token.sh`, `verify-stack.sh` |
| `AUTH_USER` | `admin` | `get-token.sh`, `verify-stack.sh` |
| `AUTH_PASSWORD` | `123456789` | `get-token.sh`, `verify-stack.sh` |
| `FRONTEND_URL` | `http://localhost:4200` | `verify-stack.sh` |
| `SKIP_FRONTEND` | `0` | `verify-stack.sh` (set to `1` for API-only checks) |

Run `./scripts/<name>.sh --help` for usage details on each script.

## Related project docs

- [CONTRIBUTING.md](../CONTRIBUTING.md) — workflow, builds, and pull request expectations
- [SECURITY.md](../SECURITY.md) — reporting vulnerabilities and known sample-app limitations
