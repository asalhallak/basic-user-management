# Documentation

Supplementary guides and assets for local development. The main setup guide lives in the [repository README](../README.md).

## Contents

| Resource | Description |
|----------|-------------|
| [onboarding.md](onboarding.md) | New contributor path: setup, reading order, first tasks, and pre-PR checks |
| [quick-start.md](quick-start.md) | One-page checklist: install, run, verify, and everyday commands |
| [day-2-workflows.md](day-2-workflows.md) | Daily dev loop, after `git pull`, API-only work, resets, and troubleshooting flow |
| [code-map.md](code-map.md) | Where to change API endpoints, auth, database schema, and Angular UI |
| [database.md](database.md) | SQL Server connection, migrations, sqlcmd inspection, and reset |
| [front-end-auth.md](front-end-auth.md) | How the Angular app stores the JWT, interceptors, and route guards |
| [api-responses.md](api-responses.md) | Example JSON response bodies for every `/api/v1` endpoint |
| [api-request-flow.md](api-request-flow.md) | HTTP middleware pipeline and layered flow from controller to SQL Server |
| [ci-and-builds.md](ci-and-builds.md) | What GitHub Actions CI runs, `make ci` vs `make build`, and common failures |
| [manual-testing.md](manual-testing.md) | Pre-PR checklist: `make ci`, smoke tests, UI walkthrough, and API spot checks |
| [faq.md](faq.md) | Short answers: auth vs users, status vs verify, CI vs smoke tests, and common pitfalls |
| [glossary.md](glossary.md) | Definitions for JWT, loginName vs userName, layers, and local-dev commands |
| [improvement-ideas.md](improvement-ideas.md) | Known gaps, intentional simplifications, and good first contribution ideas |
| [environment-variables.md](environment-variables.md) | Consolidated reference for Docker, API, Angular, script, and CI settings |
| [scripts.md](scripts.md) | Shell scripts reference: when to use status vs verify, exit codes, and examples |
| [api-errors.md](api-errors.md) | Error statuses, database constraint failures, and known API edge cases |
| [api-examples.http](api-examples.http) | REST Client requests for every `/api/v1` endpoint (login, CRUD, and error cases) |
| [rest-client-guide.md](rest-client-guide.md) | How to send requests with the REST Client extension and capture the JWT |
| [vscode-setup.md](vscode-setup.md) | VS Code debugging (F5), workspace tasks, extensions, and REST Client workflow |
| [coding-standards.md](coding-standards.md) | EditorConfig, Git line endings, and formatting expectations for C# and Angular |
| [technology-stack.md](technology-stack.md) | Pinned .NET, Angular, EF Core, Node.js, and Docker versions with upgrade notes |
| [../scripts/check-deps.sh](../scripts/check-deps.sh) | Verify Docker, .NET, Node.js, npm, and curl are installed (`make check-deps`) |
| [../scripts/get-token.sh](../scripts/get-token.sh) | Fetch a JWT from the running API (`make token`) |
| [../scripts/status.sh](../scripts/status.sh) | Show whether database, API, and front end are running (`make status`) |
| [../scripts/verify-stack.sh](../scripts/verify-stack.sh) | Smoke-check database, API auth, and front end (`make verify`) |

## Quick start

New to the project? Start with **[onboarding.md](onboarding.md)** for setup, a suggested reading order, and first tasks. Use **[quick-start.md](quick-start.md)** as a one-page command checklist.

For the full guide, follow [Getting started](../README.md#getting-started) in the README, then:

1. Start the API: `make run-api`.
2. Optional: follow **[vscode-setup.md](vscode-setup.md)** to debug the API from the editor or run Makefile tasks from **Run Task…**.
3. Follow **[rest-client-guide.md](rest-client-guide.md)** to send requests from `api-examples.http` (install REST Client, log in, capture the JWT).

## Environment variables

Script overrides (`API_URL`, `AUTH_USER`, `AUTH_PASSWORD`, `FRONTEND_URL`, `SKIP_FRONTEND`) and application settings (connection strings, JWT secret, Angular `apiUrl`) are documented in **[environment-variables.md](environment-variables.md)**.

For per-script behavior, Makefile equivalents, and when to use `status` vs `verify`, see **[scripts.md](scripts.md)**. Run `./scripts/<name>.sh --help` for inline usage.

## Related project docs

- [CONTRIBUTING.md](../CONTRIBUTING.md) — workflow, builds, and pull request expectations
- [SECURITY.md](../SECURITY.md) — reporting vulnerabilities and known sample-app limitations
