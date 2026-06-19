# Database guide

How the SQL Server database is configured, migrated, and inspected during local development. For the entity-relationship diagram and column list, see [README — Database schema](../README.md#database-schema). For a field-by-field map between entities, API JSON, and SQL columns, see [domain-model.md](domain-model.md). For a full list of Docker and connection-string settings alongside other configuration, see [environment-variables.md](environment-variables.md).

## Local connection

| Setting | Value | Where it is defined |
|---------|-------|---------------------|
| Host | `127.0.0.1` | `appsettings.json` connection string |
| Port | `1434` (host) → `1433` (container) | `docker-compose.yml` |
| Database | `UserManagement` | `appsettings.json` |
| User | `sa` | `appsettings.json` |
| Password | See `docker-compose.yml` → `SA_PASSWORD` | Must match `appsettings.json` |

The API reads `ConnectionStrings:DefaultConnection` from `UserManagementAPI/UserManagement.API/appsettings.json`. If you change the host port or SA password in Docker, update the connection string to match.

**GUI clients:** Point Azure Data Studio, DBeaver, or similar at `127.0.0.1,1434` with SQL Server authentication (`sa` + the compose password). Enable trust server certificate when prompted on newer SQL Server images.

## Start and stop

```bash
make db-up      # start SQL Server (docker compose up -d)
make db-down    # stop the container
make db-logs    # follow container logs when migrations fail
make status     # confirm the db container is running
```

First-time setup applies migrations automatically:

```bash
make setup      # db-up + migrate
```

## Migrations

EF Core migrations live in `UserManagementAPI/UserManagement.DataAccess.EFCore/Migrations/`. The initial migration (`20201129195226_init`) creates `Users` and `Addresses` with a unique index on `Users.LoginName`.

**Apply pending migrations:**

```bash
make migrate
```

**Add a migration after changing entities** (`UserManagement.Domain/Entities/`):

```bash
cd UserManagementAPI/UserManagement.DataAccess.EFCore
dotnet ef migrations add <MigrationName> --startup-project ../UserManagement.API
make migrate
```

See [code-map.md](code-map.md) for which files to edit when changing the schema.

## Inspect data with sqlcmd

With the database container running, query from inside the container (password must match `SA_PASSWORD` in `docker-compose.yml`):

```bash
# List tables
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
  -P 'B!8y!nHXT@C@pVC#Bp%n&B5' -C -d UserManagement \
  -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"

# Count users
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
  -P 'B!8y!nHXT@C@pVC#Bp%n&B5' -C -d UserManagement \
  -Q "SELECT COUNT(*) AS UserCount FROM Users"
```

If `mssql-tools18` is not found, try `/opt/mssql-tools/bin/sqlcmd` (older images) and omit `-C`.

**Sample rows:**

```bash
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
  -P 'B!8y!nHXT@C@pVC#Bp%n&B5' -C -d UserManagement \
  -Q "SELECT Id, LoginName, DisplayName FROM Users"
```

No seed data is inserted by migrations. An empty `Users` table after `make setup` is expected until you create records through the API or UI.

## Reset the database

Wipe the Docker volume and re-apply migrations:

```bash
make db-reset
```

This runs `docker compose down -v`, then `make setup`. All user and address rows are deleted.

## Common issues

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Connection refused on port `1434` | Container not running | `make db-up` and wait 15–30 seconds |
| Login failed for `sa` | Password mismatch | Align `SA_PASSWORD` in `docker-compose.yml` with `appsettings.json` |
| `Cannot open database "UserManagement"` | Migrations not applied | `make migrate` |
| Migration retries exhausted | SQL Server still starting | `make db-logs`, wait, then `make migrate` |
| Duplicate `loginName` on create | Unique index on `Users.LoginName` | Use a different `loginName` or delete the existing row |

Full troubleshooting: [README — Troubleshooting](../README.md#troubleshooting).

## Related docs

- [code-map.md](code-map.md) — entity and repository file locations
- [api-errors.md](api-errors.md) — duplicate `loginName` and constraint errors
- [quick-start.md](quick-start.md) — first-time `make setup` workflow
- [README — Configuration reference](../README.md#configuration-reference) — ports and connection string alignment
