# API JWT authentication

How the ASP.NET Core API issues, validates, and protects routes with JWT bearer tokens. For controller structure and routing conventions, see [api-controllers.md](api-controllers.md). For the Angular client flow (localStorage, interceptors, guards), see [front-end-auth.md](front-end-auth.md). For middleware order in the HTTP pipeline, see [api-request-flow.md](api-request-flow.md).

## Overview

```mermaid
sequenceDiagram
    participant Client
    participant Auth as AuthController
    participant Svc as AuthService
    participant Jwt as JwtHelper
    participant MW as JWT Bearer middleware
    participant Users as UsersController

    Client->>Auth: POST /api/v1/auth/login { userName, password }
    Auth->>Svc: Login(credentials)
    Svc->>Jwt: GenerateToken(claims)
    Jwt-->>Svc: signed JWT
    Svc-->>Auth: { userName, token }
    Auth-->>Client: 200 OK

    Note over Client,Users: Protected request
    Client->>MW: Authorization: Bearer &lt;token&gt;
    MW->>Users: authenticated principal
    Users-->>Client: 200 JSON
```

| Route prefix | Auth required | Controller |
|--------------|---------------|------------|
| `/api/v1/auth` | No | `AuthController` — public login |
| `/api/v1/users` | Yes (`[Authorize]`) | `UsersController` — all CRUD actions |

Login credentials are hardcoded in `AuthService` for local development (`admin` / `123456789`). They are **not** stored in the database. See [README — Authentication vs user data](../README.md#authentication-vs-user-data).

## Login flow

1. **`AuthController.Login`** (`Controllers/V1/AuthController.cs`) accepts a JSON body mapped to `Credentials` (`userName`, `password`).
2. **`AuthService.Login`** (`Services/AuthService.cs`) compares credentials against the hardcoded values. On success it builds a `Claims` DTO and calls `JwtHelper.GenerateToken`.
3. **`JwtHelper.GenerateToken`** (`Helpers/JwtHelper.cs`) signs a JWT and returns the string. The `Claims` object is serialized as `{ "userName": "...", "token": "..." }` for the HTTP response.

Invalid credentials return `401 Unauthorized` with an empty body. Example response shapes are in [api-responses.md](api-responses.md).

### Request and response DTOs

| Class | File | JSON properties | Purpose |
|-------|------|-----------------|---------|
| `Credentials` | `Resources/Credentials.cs` | `userName`, `password` | Login request body |
| `Claims` | `Resources/Claim.cs` | `userName`, `token` | Login response body |

The Angular app sends `{ userName, password }` from `AccountService.login()`, matching the `Credentials` model.

## Token generation

`JwtHelper` creates tokens with these settings:

| Setting | Value | Source |
|---------|-------|--------|
| Signing algorithm | HMAC-SHA256 | `SecurityAlgorithms.HmacSha256Signature` |
| Signing key | `JwtSecret` from configuration | `appsettings.json` → `Encoding.ASCII.GetBytes` |
| Lifetime | 7 days | `DateTime.UtcNow.AddDays(7)` in `JwtHelper.cs` |
| Claims | `ClaimTypes.Name` = login `userName` | Single name claim in the token payload |

Issuer and audience claims are **not** set. The API does not validate issuer or audience on incoming tokens (see validation below).

To change token lifetime or add roles/claims, edit `JwtHelper.GenerateToken`. To rotate the signing key, update `JwtSecret` in `appsettings.json` (or user secrets / environment variables) and restart the API—existing tokens become invalid.

## Token validation (incoming requests)

JWT bearer authentication is registered in `Startup.ConfigureServices`:

```csharp
services.AddAuthentication(...)
    .AddJwtBearer(x =>
    {
        x.RequireHttpsMetadata = false;
        x.SaveToken = true;
        x.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });
```

| Parameter | Effect |
|-----------|--------|
| `ValidateIssuerSigningKey` | Token must be signed with `JwtSecret` |
| `ValidateIssuer` / `ValidateAudience` | Disabled for this sample |
| `RequireHttpsMetadata` | `false` — allows HTTP for local dev (see [SECURITY.md](../SECURITY.md)) |
| `SaveToken` | `true` — token available on the HTTP context after validation |

The middleware runs after routing (`UseAuthentication` → `UseAuthorization` in `Startup.Configure`). `UsersController` has a class-level `[Authorize]` attribute, so every action requires a valid bearer token.

### What happens when validation fails

| Situation | Typical response |
|-----------|------------------|
| No `Authorization` header | `401 Unauthorized` |
| Malformed or expired token | `401 Unauthorized` |
| Token signed with wrong key | `401 Unauthorized` |

Protected routes do not return `403` in the current implementation—missing or invalid auth yields `401`.

## Configuration reference

| Setting | Location | Notes |
|---------|----------|-------|
| `JwtSecret` | `appsettings.json` | Symmetric signing key; development-only value |
| JWT lifetime | `Helpers/JwtHelper.cs` | Hardcoded 7 days |
| Bearer scheme | `Startup.cs` | `JwtBearerDefaults.AuthenticationScheme` |

For environment overrides and deployment guidance, see [environment-variables.md](environment-variables.md) and [SECURITY.md](../SECURITY.md).

## Where to change behavior

| Goal | Start here |
|------|------------|
| Change login credentials or validate against DB users | `Services/AuthService.cs` |
| Change token lifetime, claims, or signing | `Helpers/JwtHelper.cs` |
| Change validation rules (issuer, audience, HTTPS) | `Startup.cs` — `AddJwtBearer` block |
| Add or remove protected endpoints | Controller `[Authorize]` attributes in `Controllers/V1/` |
| Change login request/response JSON shape | `Resources/Credentials.cs`, `Resources/Claim.cs` |

See also [code-map.md](code-map.md) and [improvement-ideas.md](improvement-ideas.md) for hardening suggestions (refresh tokens, shorter TTL, ASP.NET Identity).

## Related docs

- [client-server-auth.md](client-server-auth.md) — client vs server auth layers and expired-token scenarios
- [front-end-auth.md](front-end-auth.md) — Angular JWT storage, interceptors, and `AuthGuard`
- [api-resources.md](api-resources.md) — `Credentials` and `Claims` DTO reference
- [api-request-flow.md](api-request-flow.md) — full HTTP pipeline and authenticated request sequence
- [api-responses.md](api-responses.md) — login success and `401` response examples
- [environment-variables.md](environment-variables.md) — `JwtSecret` and configuration overrides
- [SECURITY.md](../SECURITY.md) — known limitations before deployment
- [glossary.md](glossary.md) — JWT, bearer token, and login vs user record terms
