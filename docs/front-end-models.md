# Front-end models and API field mapping

How Angular forms and TypeScript types relate to the API JSON shape. For entity ↔ SQL mapping on the back end, see [domain-model.md](domain-model.md). For JWT and interceptors, see [front-end-auth.md](front-end-auth.md).

## Overview

The Angular app mixes two naming styles:

| Style | Where it appears | Example fields |
|-------|------------------|------------------|
| **API-aligned** | User list/editor (`users/add-edit/`) | `loginName`, `displayName`, nested `address` |
| **Legacy tutorial** | Register form, `models/user.ts` | `username`, `firstName`, `lastName`, `password` |

Login uses a third name (`username` in the request body) that maps to the API's `userName` through case-insensitive model binding.

```mermaid
flowchart LR
    subgraph angular [Angular]
        Login[LoginComponent]
        Register[RegisterComponent]
        Editor[AddEditComponent]
        Model[models/user.ts]
    end

    subgraph api [API JSON]
        Cred["Credentials: userName, password"]
        UserRes["UserResource: loginName, displayName, address"]
    end

    Login -->|userName, password| Cred
    Register -->|"maps on submit: loginName, displayName"| UserRes
    Editor -->|loginName, displayName, address| UserRes
    Model -.->|outdated shape| UserRes
```

## Field mapping reference

### Login (`POST /api/v1/auth/login`)

| Angular (`account.service.ts`) | API (`Credentials.cs`) | Notes |
|--------------------------------|------------------------|-------|
| `userName` | `userName` | Login form control is still named `username` in the template |
| `password` | `password` | Compared to hardcoded dev credentials in `AuthService` |

Stored session in `localStorage` uses the API response shape: `{ userName, token }`.

### User CRUD (`/api/v1/users`)

| API field (`UserResource`) | User editor (`add-edit.component`) | Register form | `models/user.ts` |
|----------------------------|------------------------------------|---------------|------------------|
| `loginName` | ✓ form control | `username` → mapped in `onSubmit()` | `username` |
| `displayName` | ✓ form control | `firstName` + `lastName` → mapped in `onSubmit()` | `firstName` / `lastName` |
| `dateOfBirth` | ✓ form control (`type="date"`) | — | ✓ |
| `country` | via `address.country` | — | — |
| `isActive` | ✓ form control | — | — |
| `salary` | ✓ form control | — | — |
| `profilePictureUrl` | ✓ form control | — | — |
| `address` | ✓ nested form group | — | — |
| `password` | not sent | ✓ (ignored by API) | ✓ |

The **user list and editor** post the correct JSON shape directly. The **register page** keeps legacy form labels but maps them to `loginName` and `displayName` in `onSubmit()` before calling the API. The **`User` TypeScript class** still reflects the original tutorial shape and is not used for register payloads.

## Source file map

| Concern | File |
|---------|------|
| Legacy TypeScript model | `front-end/src/app/models/user.ts` |
| HTTP client (login, CRUD) | `front-end/src/app/services/account.service.ts` |
| Login form | `front-end/src/app/auth/login/login.component.ts` |
| Register form (legacy fields) | `front-end/src/app/auth/register/register.component.ts` |
| User create/edit (API-aligned) | `front-end/src/app/users/add-edit/add-edit.component.ts` |
| User list | `front-end/src/app/users/list/list.component.ts` |

## Register form mapping (current behavior)

Registration already posts valid minimal user records when you are logged in:

1. Log in first — `POST /users` requires a JWT (see [Authentication vs user data](../README.md#authentication-vs-user-data)).
2. `RegisterComponent.onSubmit()` maps `{ username, firstName, lastName }` to `{ loginName, displayName, isActive: true }`.
3. The password field is validated in the UI but not sent to the API — user records have no password column.

Optional follow-ups: rename form controls to match API field names, update `models/user.ts` to match `UserResource`, or use **Users → Add** for full address and salary fields. See [front-end-login-register.md](front-end-login-register.md) and [improvement-ideas.md](improvement-ideas.md).

## Related docs

- [domain-model.md](domain-model.md) — entity, resource, and SQL column mapping
- [api-resources.md](api-resources.md) — API DTO reference and endpoint matrix
- [account-service.md](account-service.md) — HTTP methods, session, and which components call the API
- [front-end-login-register.md](front-end-login-register.md) — AuthModule login/register forms and legacy field quirks
- [front-end-users.md](front-end-users.md) — Users module list/editor components and form fields
- [front-end-auth.md](front-end-auth.md) — JWT storage, interceptors, and route guards
- [fake-backend.md](fake-backend.md) — tutorial fake-backend routes, storage, and removal
- [api-responses.md](api-responses.md) — example JSON bodies
- [README — Front-end and API integration](../README.md#front-end-and-api-integration) — fake backend and integration checklist
- [code-map.md](code-map.md) — where to change login, register, and user editor UI
