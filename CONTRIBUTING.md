# Contributing

Thank you for improving this sample project. The goal is to keep changes small, well documented, and easy to review.

## Before you start

1. Read the [README](README.md) for architecture, prerequisites, and local setup (or the shorter [docs/quick-start.md](docs/quick-start.md) checklist).
2. Skimming [docs/code-map.md](docs/code-map.md) helps you find the right files when changing API, auth, or UI behavior.
3. Verify your machine has the required tools:

   ```bash
   make check-deps
   ```

4. Install dependencies and prepare the database:

   ```bash
   make install
   make setup
   ```

## Local development workflow

Run the API and front end in separate terminals:

```bash
make run-api       # terminal 1 — http://localhost:5000
make run-frontend  # terminal 2 — http://localhost:4200
```

Smoke-test the stack when both are running:

```bash
make verify
```

For API-only checks (no Angular dev server):

```bash
make verify-api
```

### API testing

- **Documentation index:** See [`docs/README.md`](docs/README.md) for script usage, environment variables, and related assets.
- **REST Client:** Open [`docs/api-examples.http`](docs/api-examples.http) in VS Code or a JetBrains IDE. The [recommended extensions](.vscode/extensions.json) include REST Client.
- **curl:** Use [`scripts/get-token.sh`](scripts/get-token.sh) or `make token`, then follow the examples in [README — Try it with curl](README.md#try-it-with-curl).

### Builds

```bash
make build          # API + front end
make build-api      # .NET solution only
make build-frontend # Angular production build
make ci             # Same steps as GitHub Actions (restore + npm ci + production build)
make clean          # Remove .NET bin/obj and front-end dist (before a fresh build)
```

CI runs `make ci` on every push and pull request to `main` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Making changes

- **Scope:** Prefer focused changes. Documentation and small tooling improvements are welcome.
- **Conventions:** Match existing naming, layout, and Makefile patterns in the repository.
- **Editor settings:** [`.editorconfig`](.editorconfig) defines shared indentation and line-ending defaults for C#, TypeScript, Markdown, and shell scripts. Most editors apply it automatically. [`.gitattributes`](.gitattributes) keeps LF line endings in Git (especially for shell scripts).
- **Secrets:** Do not commit real credentials. `appsettings.json` and `docker-compose.yml` use development-only values. See [SECURITY.md](SECURITY.md) for the full list of intentional sample-app limitations.
- **Database:** After schema changes, add an EF Core migration under `UserManagementAPI/UserManagement.DataAccess.EFCore/Migrations/` and document any new setup steps in the README.

## Pull requests

1. Branch from `main` with a descriptive name (for example `docs/add-troubleshooting-note`).
2. Run `make build` (and `make verify` when your change affects runtime behavior).
3. Open a pull request against `main`. GitHub pre-fills [`.github/pull_request_template.md`](.github/pull_request_template.md) with a short checklist—fill in the summary and check applicable boxes.
4. Link related issues when applicable.

## Getting help

- **Troubleshooting:** See [README — Troubleshooting](README.md#troubleshooting).
- **Configuration:** See [README — Configuration reference](README.md#configuration-reference).
