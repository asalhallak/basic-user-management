# VS Code setup

Use this guide to debug the API, run common tasks, and send REST requests from Visual Studio Code.

## Recommended extensions

Open the workspace and install the extensions listed in [`.vscode/extensions.json`](../.vscode/extensions.json):

| Extension | Purpose |
|-----------|---------|
| C# (`ms-dotnettools.csharp`) | .NET debugging and IntelliSense |
| Angular Language Service (`angular.ng-template`) | Angular templates and navigation |
| REST Client (`humao.rest-client`) | Send requests from `docs/api-examples.http` |

VS Code prompts you to install recommended extensions when you open the folder.

## Workspace settings

[`.vscode/settings.json`](../.vscode/settings.json) configures:

- **REST Client** — `baseUrl` is set to `http://localhost:5000/api/v1` for `api-examples.http`
- **File explorer** — hides `node_modules`, `bin`, and `obj` folders

## First-time setup

From a terminal in the repository root:

```bash
make check-deps
make install
make setup
```

Or run the **setup** task: **Terminal → Run Task… → setup**.

## Debug the API

1. Start the database if it is not already running: `make db-up` or `make setup`.
2. Open **Run and Debug** (Ctrl+Shift+D / Cmd+Shift+D).
3. Select **Launch API** and press F5.

The debugger builds the API project, starts it on `http://localhost:5000`, and attaches breakpoints in controllers and services.

To attach to an API process started elsewhere (for example `make run-api`), choose **Attach to API** and pick the `UserManagement.API` process.

## Run tasks from the editor

**Terminal → Run Task…** lists Makefile-backed tasks from [`.vscode/tasks.json`](../.vscode/tasks.json):

| Task | Equivalent | Notes |
|------|------------|-------|
| `build-api` | `make build-api` | Default build task (Ctrl+Shift+B / Cmd+Shift+B) |
| `setup` | `make setup` | Start SQL Server and apply migrations |
| `run-api` | `make run-api` | Background task; API listens on port 5000 |
| `run-frontend` | `make run-frontend` | Background task; Angular dev server on port 4200 |

Start `run-api` and `run-frontend` in separate task terminals when you prefer tasks over `make` in a shell.

## Test endpoints with REST Client

1. Start the API (`make run-api`, the **run-api** task, or **Launch API** debug configuration).
2. Open [`docs/api-examples.http`](api-examples.http).
3. Send **Login** first, then use the returned JWT for protected routes.

See [rest-client-guide.md](rest-client-guide.md) for variable capture, request order, and troubleshooting.

## Related docs

- [quick-start.md](quick-start.md) — install, run, and verify the full stack
- [code-map.md](code-map.md) — where to change API, auth, and UI code
- [CONTRIBUTING.md](../CONTRIBUTING.md) — pull request workflow
