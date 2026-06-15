# Basic User Management

A full-stack sample application for managing users with authentication, built as a learning-friendly reference for layered .NET APIs and Angular front ends.

## Table of contents

- [What it does](#what-it-does)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Configuration reference](#configuration-reference)
- [Getting started](#getting-started)
- [Makefile shortcuts](#makefile-shortcuts)
- [Verify the stack](#verify-the-stack)
- [Default login](#default-login)
- [Authentication vs user data](#authentication-vs-user-data)
- [Front-end and API integration](#front-end-and-api-integration)
- [API reference](#api-reference)
- [API examples (HTTP Client)](#api-examples-http-client)
- [Database schema](#database-schema)
- [Try it with curl](#try-it-with-curl)
- [Project structure](#project-structure)
- [Development notes](#development-notes)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## What it does

- **Authenticate** with JWT bearer tokens
- **List, create, update, and delete** users through a REST API
- **Manage user profiles** including display name, date of birth, country, salary, profile picture, and linked address
- **Browse and edit users** from an Angular single-page app

## Architecture

```mermaid
flowchart LR
    subgraph client [Front end]
        Angular[Angular 11 SPA]
    end

    subgraph api [Back end]
        Controllers[API Controllers]
        Services[Services]
        Domain[Domain Layer]
        EF[EF Core]
    end

    subgraph data [Data]
        SQL[(SQL Server)]
    end

    Angular -->|HTTP + JWT| Controllers
    Controllers --> Services
    Services --> Domain
    Services --> EF
    EF --> SQL
```

The solution follows a classic layered layout:

| Layer | Project | Responsibility |
|-------|---------|----------------|
| API | `UserManagement.API` | HTTP endpoints, JWT auth, AutoMapper profiles |
| Domain | `UserManagement.Domain` | Entities and repository interfaces |
| Data | `UserManagement.DataAccess.EFCore` | EF Core context, repositories, migrations |

## Tech stack

| Area | Technology |
|------|------------|
| API | ASP.NET Core 3.1 |
| ORM | Entity Framework Core 5 |
| Database | Microsoft SQL Server |
| Auth | JWT Bearer tokens |
| Front end | Angular 11, Angular Material |
| Containers | Docker Compose |

## Prerequisites

- [.NET SDK 3.1+](https://dotnet.microsoft.com/download)
- [Node.js 12+](https://nodejs.org/) and npm
- [Docker](https://www.docker.com/) (for the database)
- [curl](https://curl.se/) (for smoke checks and API examples)
- [dotnet-ef](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) global tool (for migrations)

Verify required tools are installed:

```bash
make check-deps
```

## Configuration reference

These values must stay aligned across Docker, the API, and the front end when running locally.

| Setting | Location | Value (default) | Notes |
|---------|----------|-----------------|-------|
| SQL host port | `docker-compose.yml` | `1434:1433` | Host port `1434` maps to container `1433` |
| SA password | `docker-compose.yml` → `SA_PASSWORD` | See compose file | Must match the API connection string password |
| Connection string | `UserManagementAPI/UserManagement.API/appsettings.json` | `Server=127.0.0.1,1434;Database=UserManagement;...` | Update host port and password together with Docker |
| JWT signing secret | `appsettings.json` → `JwtSecret` | Development-only value | Replace before any real deployment |
| JWT lifetime | `UserManagementAPI/UserManagement.API/Helpers/JwtHelper.cs` | 7 days | Tokens expire; log in again when requests return `401` |
| API base URL | `front-end/src/environments/environment.ts` | `http://localhost:5000` | Production URL is in `environment.prod.ts` |

### Ports at a glance

| Service | URL or port | Used for |
|---------|-------------|----------|
| SQL Server (host) | `127.0.0.1:1434` | Database connections from the API |
| API (HTTP) | `http://localhost:5000` | REST endpoints and Angular `apiUrl` |
| API (HTTPS) | `https://localhost:5001` | Optional TLS profile in `launchSettings.json` |
| Angular dev server | `http://localhost:4200` | Browser UI during `npm start` |

To point the front end at a different API host, change `apiUrl` in the environment file and rebuild or restart `ng serve`.

## Getting started

**Quick setup** (dependencies, database, and migrations):

```bash
make check-deps
make install
make setup
```

Then run the API and front end in separate terminals:

```bash
make run-api       # terminal 1
make run-frontend  # terminal 2
```

Or follow steps 3–4 below manually.

### 1. Start the database

From the repository root:

```bash
docker compose up -d
```

SQL Server listens on **port 1434** on the host (mapped from container port 1433). Connection details are in `UserManagementAPI/UserManagement.API/appsettings.json`.

### 2. Apply database migrations

```bash
dotnet tool install --global dotnet-ef
cd UserManagementAPI/UserManagement.DataAccess.EFCore
dotnet ef database update --startup-project ../UserManagement.API
```

### 3. Run the API

```bash
cd UserManagementAPI/UserManagement.API
dotnet run
```

The API is available at:

- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`

### 4. Run the front end

```bash
cd front-end
npm install
npm start
```

Open `http://localhost:4200` in your browser. The app is configured to call the API at `http://localhost:5000` (see `front-end/src/environments/environment.ts`).

### Build commands

```bash
# Build the .NET solution
cd UserManagementAPI
dotnet build

# Production build of the Angular app
cd front-end
npm run build
```

Production API URL can be changed in `front-end/src/environments/environment.prod.ts`.

### Stop the database

```bash
docker compose down
```

To remove persisted data as well, add `-v` to delete the Docker volume.

## Makefile shortcuts

The repository root includes a `Makefile` that wraps the commands above for day-to-day development:

| Target | What it does |
|--------|----------------|
| `make help` | List all targets |
| `make check-deps` | Verify Docker, .NET, Node.js, and npm are on PATH |
| `make install` | Run `npm install` and `dotnet restore` |
| `make setup` | Start the database and apply migrations (first-time setup) |
| `make db-up` | Start the SQL Server container |
| `make db-down` | Stop the SQL Server container |
| `make db-reset` | Wipe the database volume and re-apply migrations |
| `make migrate` | Apply EF Core migrations (retries until SQL Server is ready) |
| `make run-api` | Run the API with `dotnet run` (listens on `http://localhost:5000`) |
| `make run-frontend` | Run the Angular dev server with `npm start` (listens on `http://localhost:4200`) |
| `make build-api` | Build the .NET solution |
| `make build-frontend` | Production build of the Angular app |
| `make build` | Build API and front end |
| `make verify` | Run `./scripts/verify-stack.sh` (full stack) |
| `make verify-api` | Run verify-stack with `SKIP_FRONTEND=1` (API only) |
| `make token` | Print a JWT from the running API (for curl or manual testing) |

Example local workflow:

```bash
make setup
make run-api       # terminal 1
make run-frontend  # terminal 2
make verify        # terminal 3 (after API and front end are up)
```

## Verify the stack

After starting all services, confirm each layer is reachable:

| Check | Command or action | Expected result |
|-------|-------------------|-----------------|
| Database | `docker compose ps` | `db` container is running |
| API | `curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/v1/users` | `401` (unauthorized without a token) |
| Auth | `POST /api/v1/auth/login` with default credentials | `200` with a JWT in the response body |
| Authenticated API | `GET /api/v1/users` with the JWT from login | `200` with a JSON array (may be empty) |
| Front end | Open `http://localhost:4200` or run `./scripts/verify-stack.sh` | Login page loads (`200` from dev server) |

Or run the helper script from the repository root (requires Docker, a running API, and the Angular dev server):

```bash
./scripts/verify-stack.sh
```

The script checks the database container, confirms the API returns `401` without a token, logs in with the [default credentials](#default-login), verifies `GET /api/v1/users` succeeds with the returned JWT, and confirms the front end responds on port `4200`.

| Variable | Default | Purpose |
|----------|---------|---------|
| `API_URL` | `http://localhost:5000` | Base URL for auth and users endpoints |
| `FRONTEND_URL` | `http://localhost:4200` | Angular dev server to smoke-check |
| `AUTH_USER` | `admin` | Login username for the auth check |
| `AUTH_PASSWORD` | `123456789` | Login password for the auth check |
| `SKIP_FRONTEND` | `0` | Set to `1` to skip the front-end check (API-only workflow) |

Override defaults when needed:

```bash
API_URL=http://localhost:5000 FRONTEND_URL=http://localhost:4200 ./scripts/verify-stack.sh
```

API-only check (database + JWT + login + authenticated users, no Angular dev server):

```bash
SKIP_FRONTEND=1 ./scripts/verify-stack.sh
```

A `401` from the users endpoint without a token means the API is up and JWT protection is working.

## Default login

Authentication is intentionally simple for local development:

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `123456789` |

After login, the JWT is attached to subsequent API requests automatically.

## Authentication vs user data

Login and user CRUD are intentionally separate in this sample:

| Concern | How it works |
|---------|--------------|
| **Login** | Hardcoded in `AuthService` (`admin` / `123456789`). Not backed by database users. |
| **User records** | Stored in SQL Server via EF Core. Created through the API or Angular UI after you are logged in. |
| **Register page** | Posts to `POST /api/v1/users`, which requires a JWT. It is not a public sign-up flow. |
| **Seed data** | Migrations create empty tables. No users are inserted automatically. |

Creating a user through the API or UI does **not** create a new login account. To add real credential-based auth, wire `AuthService.Login` to validate against stored users (or an identity provider).

## Front-end and API integration

The Angular app was adapted from a tutorial that used a local fake backend. When pointing it at the real API, keep these mismatches in mind:

| Area | Front end | API | Notes |
|------|-----------|-----|-------|
| Login payload | `{ username, password }` in `account.service.ts` | `{ userName, password }` in `Credentials.cs` | ASP.NET Core model binding is case-insensitive, so login usually works. Prefer `userName` for consistency with the API. |
| User model | `username`, `firstName`, `lastName` (register form) | `loginName`, `displayName`, nested `address` | User list/editor aligns with the API; the register form does not. |
| Fake backend | `fakeBackendProvider` in `app.module.ts` | N/A | Intercepts legacy `/users/authenticate` routes. Remove this provider when using the real API exclusively. |

**Recommended steps to use the real API end-to-end:**

1. Remove `fakeBackendProvider` from the `providers` array in `front-end/src/app/app.module.ts`.
2. Log in with the [default credentials](#default-login) before using register or user management screens.
3. Align register/create payloads with the [user model](#user-model) (`loginName`, `displayName`, `address`, etc.).

## API reference

Base path: `/api/v1`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | No | Exchange credentials for a JWT |

**Request body:**

```json
{
  "userName": "admin",
  "password": "123456789"
}
```

**Response:**

```json
{
  "userName": "admin",
  "token": "<jwt>"
}
```

### Users

All user endpoints require a valid `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users |
| `GET` | `/users/{id}` | Get one user by ID |
| `POST` | `/users` | Create a user |
| `PUT` | `/users/{id}` | Update a user |
| `DELETE` | `/users/{id}` | Delete a user |

### HTTP status codes

| Status | When |
|--------|------|
| `200 OK` | Successful login, read, create, update, or delete |
| `401 Unauthorized` | Missing/invalid JWT on a protected route, or invalid login credentials |
| `404 Not Found` | Requested user ID does not exist (when the service throws for a missing record) |

Protected routes always require `Authorization: Bearer <token>`. Re-authenticate when a token expires (see [Configuration reference](#configuration-reference)).

### User model

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | Assigned by the database |
| `loginName` | string | Unique |
| `displayName` | string | |
| `dateOfBirth` | datetime | |
| `country` | string | |
| `isActive` | bool | |
| `salary` | float | |
| `profilePictureUrl` | string | Optional URL |
| `address` | object | Nested address (see below) |

### Address model

When creating or updating a user, the nested `address` object supports:

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | Assigned by the database on create |
| `city` | string | |
| `country` | string | |
| `postalCode` | string | |
| `state` | string | |
| `streetName` | string | |
| `streetNumber` | string | |

**Example create-user body:**

```json
{
  "loginName": "jdoe",
  "displayName": "Jane Doe",
  "dateOfBirth": "1990-05-15T00:00:00",
  "country": "US",
  "isActive": true,
  "salary": 75000,
  "profilePictureUrl": "https://example.com/avatar.png",
  "address": {
    "city": "Seattle",
    "country": "US",
    "postalCode": "98101",
    "state": "WA",
    "streetName": "Main St",
    "streetNumber": "100"
  }
}
```

## API examples (HTTP Client)

For interactive testing in VS Code (REST Client extension) or JetBrains IDEs, use the ready-made request file:

```
docs/api-examples.http
```

The file logs in, captures the JWT from the response, and exercises every `/api/v1` endpoint. Start the API with `make run-api` before sending requests.

## Database schema

The database has two related tables created by the initial EF Core migration:

```mermaid
erDiagram
    Users ||--o| Addresses : "has optional"
    Users {
        int Id PK
        string LoginName UK
        string DisplayName
        datetime DateOfBirth
        string Country
        int AddressId FK
        bool IsActive
        float Salary
        string ProfilePictureUrl
    }
    Addresses {
        int Id PK
        string City
        string Country
        string PostalCode
        string State
        string StreetName
        string StreetNumber
    }
```

| Constraint | Column | Notes |
|------------|--------|-------|
| Primary key | `Users.Id`, `Addresses.Id` | Identity columns |
| Unique | `Users.LoginName` | Enforced at the database level |
| Foreign key | `Users.AddressId` → `Addresses.Id` | Optional one-to-one; `ON DELETE RESTRICT` |

Migrations live in `UserManagementAPI/UserManagement.DataAccess.EFCore/Migrations/`. Apply them with `make migrate` or the steps in [Getting started](#getting-started).

## Try it with curl

These examples assume the API is running on `http://localhost:5000`.

**1. Log in and capture the token:**

```bash
TOKEN=$(./scripts/get-token.sh)
```

Or with `make`:

```bash
TOKEN=$(make token)
```

Manual alternative (no helper script):

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"123456789"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
```

Override login defaults with `API_URL`, `AUTH_USER`, and `AUTH_PASSWORD` (same as [verify-stack](#verify-the-stack)).

**2. List users:**

```bash
curl -s http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

**3. Create a user:**

```bash
curl -s -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginName": "jdoe",
    "displayName": "Jane Doe",
    "dateOfBirth": "1990-05-15T00:00:00",
    "country": "US",
    "isActive": true,
    "salary": 75000,
    "address": {
      "city": "Seattle",
      "country": "US",
      "postalCode": "98101",
      "state": "WA",
      "streetName": "Main St",
      "streetNumber": "100"
    }
  }'
```

**4. Update a user (replace `{id}` with the user ID):**

```bash
curl -s -X PUT http://localhost:5000/api/v1/users/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Jane Smith","isActive":true}'
```

**5. Delete a user:**

```bash
curl -s -X DELETE http://localhost:5000/api/v1/users/{id} \
  -H "Authorization: Bearer $TOKEN"
```

## Project structure

```
.
├── Makefile                    # Common dev commands (make help)
├── docker-compose.yml          # SQL Server container
├── docs/
│   └── api-examples.http       # REST Client requests for local API testing
├── scripts/
│   ├── check-deps.sh           # Verify local prerequisites
│   ├── get-token.sh            # Fetch a JWT from the local API
│   └── verify-stack.sh         # Smoke-check database + API locally
├── front-end/                  # Angular SPA
│   └── src/app/
│       ├── auth/               # Login & register
│       ├── users/              # User list & editor
│       └── services/           # API client & alerts
└── UserManagementAPI/
    ├── UserManagement.API/           # Web API entry point
    ├── UserManagement.Domain/        # Entities & interfaces
    └── UserManagement.DataAccess.EFCore/  # Persistence & migrations
```

## Development notes

- **CORS** is configured for local front-end development. See `MiddlewareConfiguration/CorsOriginConfiguration.cs`.
- **Migrations** live in `UserManagement.DataAccess.EFCore/Migrations/`. Create new ones with `dotnet ef migrations add <Name> --startup-project ../UserManagement.API`.
- **Secrets**: `appsettings.json` contains a development JWT secret and database password. Replace these before deploying anywhere real.
- **JWT configuration**: Tokens are signed with the `JwtSecret` value from `appsettings.json`. Issuer and audience validation are disabled for simplicity in this sample.
- **Repository pattern**: Data access goes through `IUnitOfWork` and repository interfaces in `UserManagement.Domain`, with EF Core implementations in `UserManagement.DataAccess.EFCore`.

## Testing

The repository exposes test-related npm scripts but does not include automated tests yet.

| Command | Location | Status |
|---------|----------|--------|
| `npm test` | `front-end/` | Karma/Jasmine configured; no `*.spec.ts` files present |
| `npm run lint` | `front-end/` | TSLint available |
| `npm run e2e` | `front-end/` | Protractor configured; no e2e specs present |
| `dotnet test` | N/A | No .NET test projects in the solution |

**Smoke testing:** Use `./scripts/verify-stack.sh` or the [Verify the stack](#verify-the-stack) checklist after starting Docker, the API, and the front end.

**Good first tests to add:**

- `AuthService.Login` returns a token for valid credentials and `null` otherwise
- `UsersController` CRUD with an in-memory database or test container
- Angular `AccountService.login` maps the API response into local storage

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Migration fails with a connection error | SQL Server container is still starting | Wait 15–30 seconds after `docker compose up -d`, then retry `dotnet ef database update` |
| `Cannot open database "UserManagement"` | Migrations not applied | Run the migration step from [Getting started](#getting-started) |
| Port `1434` already in use | Another SQL Server instance on the host | Stop the conflicting service or change the host port in `docker-compose.yml` and update `appsettings.json` to match |
| API returns `401` on all user endpoints | Missing or expired JWT | Log in again via `/api/v1/auth/login` and include `Authorization: Bearer <token>` |
| Front end cannot reach the API | API not running or wrong URL | Confirm `dotnet run` is active and `environment.apiUrl` points to `http://localhost:5000` |
| Login works in curl but not in the UI | Fake backend still enabled or stale local storage | Remove `fakeBackendProvider` from `app.module.ts` and clear browser local storage |
| Register fails with `401` | User endpoints require a JWT | Log in first; register is not a public endpoint (see [Authentication vs user data](#authentication-vs-user-data)) |
| `dotnet ef` command not found | EF Core CLI tool not installed | Run `dotnet tool install --global dotnet-ef` |

**Reset the database completely:**

```bash
make db-reset
```

Or manually:

```bash
docker compose down -v
docker compose up -d
# wait for SQL Server to start, then re-apply migrations
cd UserManagementAPI/UserManagement.DataAccess.EFCore
dotnet ef database update --startup-project ../UserManagement.API
```

## License

This project is provided as-is for educational and demonstration purposes.
