# REST Client guide

Step-by-step instructions for exercising the API with [`api-examples.http`](api-examples.http) in VS Code or a JetBrains IDE. For response shapes, see [api-responses.md](api-responses.md).

## Prerequisites

1. Start the API: `make run-api` (listens on `http://localhost:5000`).
2. Install the **REST Client** extension:
   - **VS Code:** `humao.rest-client` (listed in [`.vscode/extensions.json`](../.vscode/extensions.json))
   - **JetBrains:** built-in HTTP Client (`.http` files work out of the box)

## Send your first request

1. Open [`api-examples.http`](api-examples.http) in the editor.
2. Click **Send Request** above the `### Log in` block (or use the shortcut shown in the editor gutter).
3. Confirm the response is `HTTP/1.1 200` with a JSON body containing `userName` and `token`.

The file uses REST Client variables so later requests can reuse the JWT automatically.

## How variables work

| Variable | Set in file | Purpose |
|----------|-------------|---------|
| `@baseUrl` | Top of `api-examples.http` | API root (`http://localhost:5000/api/v1`) |
| `@userName`, `@password` | Top of file | Default login credentials |
| `@token` | After login block | Captured from the login response |

The login request is named so the token can be extracted:

```http
# @name login
POST {{baseUrl}}/auth/login
...
```

The next line binds the JWT for all following requests:

```http
@token = {{login.response.body.token}}
```

Every protected request then includes:

```http
Authorization: Bearer {{token}}
```

Re-send **Log in** whenever the token expires (7-day lifetime; see [front-end-auth.md](front-end-auth.md#jwt-details)) or after restarting the API with a new `JwtSecret`.

## VS Code workspace settings

[`.vscode/settings.json`](../.vscode/settings.json) defines a shared `baseUrl` for REST Client environments. The examples file uses inline `@baseUrl` variables, so it works without selecting an environment. To point at a different host, change `@baseUrl` at the top of `api-examples.http` or override `rest-client.environmentVariables` in your user settings.

## Suggested request order

Work through the file top to bottom on a fresh database:

1. **Log in** — captures `@token`
2. **List users** — expect `200` and `[]` on an empty database
3. **Create a user** — note the `id` in the response body
4. **Get one user by ID** — replace `1` in the URL with the ID from step 3
5. **Update a user** — same ID substitution
6. **Delete a user** — same ID substitution

The file also includes negative tests at the bottom:

| Request | Expected status | What it verifies |
|---------|-----------------|------------------|
| Invalid login | `401` | Wrong password is rejected |
| Users without token | `401` | JWT protection is active |
| Users with invalid token | `401` | Forged or expired tokens are rejected |

## Tips

- **Replace placeholder IDs:** `GET`, `PUT`, and `DELETE` examples use `/users/1`. Use a real ID from **Create a user** or **List users**.
- **View formatted JSON:** VS Code opens responses in a split pane; use the preview toggle for readable JSON.
- **Parallel testing:** You can keep `api-examples.http` open while using `make token` and curl in a terminal—the approaches are independent.
- **API-only workflow:** Skip the Angular dev server; REST Client talks directly to the API.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Connection refused | Start the API with `make run-api` |
| `401` on protected routes after login | Re-send **Log in** to refresh `@token` |
| `Send Request` link missing | Install the REST Client extension and reload the editor |
| Wrong host or port | Update `@baseUrl` to match your running API |

For stack-wide checks, run `make status` (quick report) or `make verify-api` (automated smoke tests).

## Related docs

- [api-examples.http](api-examples.http) — ready-made requests
- [api-responses.md](api-responses.md) — example JSON response bodies
- [quick-start.md](quick-start.md) — install and run the stack
- [README — API examples (HTTP Client)](../README.md#api-examples-http-client)
