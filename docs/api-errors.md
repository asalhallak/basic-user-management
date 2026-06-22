# API errors and edge cases

What to expect when requests fail or hit unusual inputs. For successful response shapes, see [api-responses.md](api-responses.md). For request examples, see [api-examples.http](api-examples.http).

This sample API intentionally keeps validation and error handling minimal. The tables below describe **current behavior**, including gaps you may want to fix when extending the project.

## Authentication

| Situation | Status | Body | Notes |
|-----------|--------|------|-------|
| Valid credentials | `200` | `{ userName, token }` | See [api-responses.md](api-responses.md) |
| Wrong username or password | `401` | empty | `AuthService.Login` returns `null`; controller responds with `Unauthorized()` |
| Missing `Authorization` on a protected route | `401` | empty | JWT middleware rejects the request |
| Expired or malformed JWT | `401` | empty | Re-login via `POST /auth/login` |
| Valid JWT on `/users` routes | varies | varies | Protected routes succeed when the token is valid |

## Users — documented vs actual behavior

`GET /users/{id}` returns `404 Not Found` when the ID does not exist. The controller checks for a `null` result from `UsersService.Get` before mapping to `UserResource`.

| Situation | Documented | Actual today | Body |
|-----------|------------|--------------|------|
| `GET /users/{id}` — ID exists | `200` | `200` | user object |
| `GET /users/{id}` — ID missing | `404` | `404` | empty |
| `DELETE /users/{id}` — ID missing | `404` | `500` | developer exception page (in Development) |
| `PUT /users/{id}` — ID missing | `404` | `200` or `500` | may update nothing or fail depending on EF state |

When hardening the API further, add similar not-found checks for `DELETE` and `PUT` — see [code-map.md](code-map.md) and [api-users-crud.md](api-users-crud.md).

## Database constraint violations

`Users.LoginName` has a **unique index** at the database level (`IX_Users_LoginName`).

| Situation | Typical status | What you see |
|-----------|----------------|--------------|
| `POST /users` with a duplicate `loginName` | `500` | SQL Server unique-constraint error surfaced through EF Core |
| `POST /users` with `loginName: null` | `200` or `500` | Multiple `null` values are allowed by the filtered unique index |

There is no application-level duplicate check or `409 Conflict` response today.

## Malformed or incomplete JSON

ASP.NET Core model binding accepts partial bodies. Missing optional fields may default to `null`, `0`, or `false` depending on the property type. There is no `[Required]` validation on `UserResource`, so invalid create/update payloads may persist unexpected values or fail at the database layer.

## Development vs production errors

In **Development**, unhandled exceptions (for example deleting a non-existent user) return the ASP.NET Core developer exception page with a `500` status.

In **non-Development** environments, unhandled exceptions return a generic `500` without detailed stack traces.

## Quick troubleshooting

| Symptom | Likely cause | What to try |
|---------|--------------|-------------|
| `401` on every `/users` call | Missing, expired, or wrong JWT | `make token` or log in again |
| `500` on `POST /users` | Duplicate `loginName` | Use a unique `loginName` or delete the existing user |
| `404 Not Found` for `GET /users/{id}` | ID does not exist | Confirm the ID with `GET /users` first |
| `500` on `DELETE /users/{id}` | ID does not exist | Confirm the ID with `GET /users` first |

## Related docs

- [api-responses.md](api-responses.md) — success response JSON
- [api-examples.http](api-examples.http) — includes invalid-login and missing-token examples
- [code-map.md](code-map.md) — where to change `UsersController` and `UsersService`
- [README — HTTP status codes](../README.md#http-status-codes)
