# Contributor onboarding

A short path from clone to your first useful change. For full setup steps, see [quick-start.md](quick-start.md). For pull request expectations, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## 10-minute setup

From the repository root:

```bash
make check-deps
make install
make setup
```

Run the stack in two terminals, then smoke-test:

```bash
# Terminal 1
make run-api

# Terminal 2
make run-frontend

# Terminal 3 (after API and front end are up)
make verify
```

Sign in at `http://localhost:4200` with `admin` / `123456789`.

## Suggested reading order

Read in this order the first time you touch the project:

| Step | Doc | Why |
|------|-----|-----|
| 1 | [quick-start.md](quick-start.md) | Install, run, and verify the stack |
| 2 | [glossary.md](glossary.md) | Terms like `loginName`, JWT, and fake backend |
| 3 | [code-map.md](code-map.md) | Where to change API, auth, schema, and UI |
| 4 | [faq.md](faq.md) | Common pitfalls (auth vs users, `status` vs `verify`) |
| 5 | [improvement-ideas.md](improvement-ideas.md) | Known gaps and good first tasks if you are looking for what to build |

Then branch by what you are changing:

| Goal | Read next |
|------|-----------|
| API or services | [api-request-flow.md](api-request-flow.md), [api-responses.md](api-responses.md), [api-errors.md](api-errors.md) |
| Angular / JWT | [front-end-auth.md](front-end-auth.md), [README — Front-end and API integration](../README.md#front-end-and-api-integration) |
| Database / migrations | [database.md](database.md), [code-map.md — Add an EF Core migration](code-map.md#add-an-ef-core-migration) |
| Scripts / Makefile | [scripts.md](scripts.md), [environment-variables.md](environment-variables.md) |
| Before opening a PR | [manual-testing.md](manual-testing.md), [ci-and-builds.md](ci-and-builds.md) |

## First hands-on tasks

Good low-risk ways to learn the codebase:

1. **API-only smoke test** — Run `make setup`, `make run-api`, and `make verify-api` without starting the Angular dev server.
2. **REST Client** — Follow [rest-client-guide.md](rest-client-guide.md) and send requests from [api-examples.http](api-examples.http).
3. **Trace a request** — Log in, list users, and follow the flow in [api-request-flow.md](api-request-flow.md) from controller to SQL Server.
4. **UI walkthrough** — Complete the table in [manual-testing.md](manual-testing.md#3-manual-ui-walkthrough).

## Before you open a pull request

```bash
make ci
```

When your change affects runtime behavior, also run `make verify` (or `make verify-api` for API-only work) and follow [manual-testing.md](manual-testing.md).

Documentation-only changes don't require `make verify`; `make ci` is still the minimum check before opening a PR.

## Related docs

- [docs/README.md](README.md) — full documentation index
- [CONTRIBUTING.md](../CONTRIBUTING.md) — branch naming, PR checklist, conventions
- [README](../README.md) — architecture, API reference, troubleshooting
