# API response reference

Example JSON bodies returned by `/api/v1` endpoints. For request shapes and curl examples, see the [README API reference](../README.md#api-reference) and [`api-examples.http`](api-examples.http).

All successful user payloads use **camelCase** property names (for example `loginName`, `displayName`).

## Authentication

### `POST /auth/login` — success (`200`)

```json
{
  "userName": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The `token` value is a JWT. Send it on protected routes as `Authorization: Bearer <token>`.

### `POST /auth/login` — invalid credentials (`401`)

Empty body. The API returns `401 Unauthorized` when the username or password does not match the hardcoded development credentials.

## Users

Protected routes require `Authorization: Bearer <token>`. Without a valid token, responses are `401 Unauthorized` with an empty body. For per-endpoint controller and service flow, see [api-users-crud.md](api-users-crud.md).

### `GET /users` — success (`200`)

Returns a JSON array. An empty database yields `[]`.

```json
[
  {
    "id": 1,
    "loginName": "jdoe",
    "displayName": "Jane Doe",
    "dateOfBirth": "1990-05-15T00:00:00",
    "country": "US",
    "isActive": true,
    "salary": 75000,
    "profilePictureUrl": "https://example.com/avatar.png",
    "address": {
      "id": 1,
      "city": "Seattle",
      "country": "US",
      "postalCode": "98101",
      "state": "WA",
      "streetName": "Main St",
      "streetNumber": "100"
    }
  }
]
```

### `GET /users/{id}` — success (`200`)

Returns a single user object with the same shape as one element from the list above.

### `GET /users/{id}` — not found

`404` with an empty body when the ID does not exist.

### `POST /users` — success (`200`)

Returns the created user as a mapped `UserResource` with server-assigned `id` (and `address.id` when an address was included). Property names match the request body plus generated IDs.

```json
{
  "id": 2,
  "loginName": "jdoe",
  "displayName": "Jane Doe",
  "dateOfBirth": "1990-05-15T00:00:00",
  "country": "US",
  "isActive": true,
  "salary": 75000,
  "profilePictureUrl": "https://example.com/avatar.png",
  "address": {
    "id": 2,
    "city": "Seattle",
    "country": "US",
    "postalCode": "98101",
    "state": "WA",
    "streetName": "Main St",
    "streetNumber": "100"
  }
}
```

### `PUT /users/{id}` — success (`200`)

Empty body. The update is applied in place; fetch the user with `GET /users/{id}` to read the current state.

### `DELETE /users/{id}` — success (`200`)

Empty body.

### `DELETE /users/{id}` — not found

`404` with an empty body when the ID does not exist.

## Quick reference

| Endpoint | Success status | Response body |
|----------|----------------|---------------|
| `POST /auth/login` | `200` | `{ userName, token }` |
| `POST /auth/login` | `401` | empty |
| `GET /users` | `200` | array of user objects |
| `GET /users/{id}` | `200` | single user object |
| `GET /users/{id}` | `404` | empty |
| `POST /users` | `200` | created user object |
| `PUT /users/{id}` | `200` | empty |
| `DELETE /users/{id}` | `200` | empty |
| `DELETE /users/{id}` | `404` | empty |
| Any protected route | `401` | empty (missing, expired, or invalid JWT) |

## Related docs

- [README — API reference](../README.md#api-reference) — endpoints, request models, and status codes
- [api-errors.md](api-errors.md) — error statuses and edge cases
- [api-examples.http](api-examples.http) — send requests with REST Client
- [code-map.md](code-map.md) — where to change controllers, services, and DTOs
