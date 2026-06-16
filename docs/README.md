# Documentation

Supplementary guides and assets for local development. The main setup guide lives in the [repository README](../README.md).

## Contents

| Resource | Description |
|----------|-------------|
| [api-examples.http](api-examples.http) | REST Client requests for every `/api/v1` endpoint (login, CRUD, and error cases) |
| [../scripts/check-deps.sh](../scripts/check-deps.sh) | Verify Docker, .NET, Node.js, npm, and curl are installed (`make check-deps`) |
| [../scripts/get-token.sh](../scripts/get-token.sh) | Fetch a JWT from the running API (`make token`) |
| [../scripts/verify-stack.sh](../scripts/verify-stack.sh) | Smoke-check database, API auth, and front end (`make verify`) |

## Quick start

1. Follow [Getting started](../README.md#getting-started) in the README.
2. Start the API: `make run-api`.
3. Open `api-examples.http` in VS Code (REST Client extension) or a JetBrains IDE and send the **Log in** request first—the file captures the JWT for later requests.

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
