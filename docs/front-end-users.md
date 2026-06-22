# Front-end user management UI

How the Angular **Users** module lists, creates, edits, and deletes user records. For HTTP calls and session storage, see [account-service.md](account-service.md). For route URLs and lazy loading, see [angular-routing.md](angular-routing.md).

## Overview

```mermaid
flowchart TB
    subgraph routes [Routes under /users]
        List["/users → ListComponent"]
        Add["/users/add → AddEditComponent"]
        Edit["/users/edit/:id → AddEditComponent"]
    end

    subgraph svc [Services]
        Account[AccountService]
        Alert[AlertService]
    end

    subgraph api [API]
        Users["/api/v1/users"]
    end

    List -->|getAll, delete| Account
    Add -->|register| Account
    Edit -->|getById, update| Account
    List --> Alert
    Add --> Alert
    Edit --> Alert
    Account --> Users
```

| Property | Value |
|----------|-------|
| Module | `front-end/src/app/users/users.module.ts` |
| Lazy loaded | Yes — via `loadChildren` in `app-routing.module.ts` |
| Auth required | All routes protected by `AuthGuard` on the parent `/users` path |
| API alignment | List and editor use API field names (`loginName`, `displayName`, nested `address`) |

## Module layout

| File | Role |
|------|------|
| `users.module.ts` | Declares `LayoutComponent`, `ListComponent`, `AddEditComponent`; imports `ReactiveFormsModule` |
| `users-routing.module.ts` | Child routes under `LayoutComponent` |
| `layout.component.ts` | Wrapper with `<router-outlet>` and Bootstrap container padding |
| `list/list.component.ts` | Loads all users into a table; inline delete with spinner |
| `add-edit/add-edit.component.ts` | Shared create/edit reactive form |

### Routes

Defined in `users-routing.module.ts`:

| URL | Component | Mode |
|-----|-----------|------|
| `/users` | `ListComponent` | List all users |
| `/users/add` | `AddEditComponent` | `isAddMode = true` (no `:id` param) |
| `/users/edit/:id` | `AddEditComponent` | `isAddMode = false`; loads user via `getById(id)` |

The parent `LayoutComponent` renders child routes inside a padded container. Navigation links use relative `routerLink` values (`add`, `edit/{{user.id}}`).

## ListComponent

**File:** `front-end/src/app/users/list/list.component.ts`

On init, calls `accountService.getAll()` and binds the result to `users`. While loading, the template shows a centered spinner (`users` is `null`).

| Column | Source field | Notes |
|--------|--------------|-------|
| Display Name | `user.displayName` | |
| Username | `user.loginName` | Label says "Username"; API field is `loginName` |
| Date Of Birth | `user.dateOfBirth \| date` | Angular `DatePipe`; empty if API returns default/null |
| Actions | Edit / Delete buttons | Edit links to `edit/:id` |

### Delete flow

`deleteUser(id)` sets `user.isDeleting = true` on the row (shows a small spinner on the button), calls `accountService.delete(id)`, and removes the row from the local array on success.

| Behavior | Detail |
|----------|--------|
| Optimistic UI | Row stays until delete succeeds |
| Error handling | Failed load or delete shows `AlertService.error()`; delete failures reset `isDeleting` on the row |
| Confirmation | No confirm dialog before delete |

For API delete behavior and missing-ID quirks, see [api-users-crud.md](api-users-crud.md) and [api-errors.md](api-errors.md).

## AddEditComponent

**File:** `front-end/src/app/users/add-edit/add-edit.component.ts`

A single component handles both create and edit. Mode is determined from the route param:

```typescript
this.id = this.route.snapshot.params['id'];
this.isAddMode = !this.id;
```

### Form fields

Built with `FormBuilder` in `ngOnInit()`:

| Control | Validators | Sent to API |
|---------|------------|-------------|
| `displayName` | `required` | ✓ |
| `loginName` | `required` | ✓ |
| `isActive` | `required` | ✓ (boolean select) |
| `salary` | `required` | ✓ |
| `profilePictureUrl` | `required` | ✓ |
| `address.city` | `required` | ✓ (nested) |
| `address.state` | `required` | ✓ |
| `address.country` | `required` | ✓ |
| `address.postalCode` | `required` | ✓ |
| `address.streetName` | `required` | ✓ |
| `address.streetNumber` | `required` | ✓ |

**Not collected in the form** (but exist on the API model):

| API field | Effect when omitted |
|-----------|---------------------|
| `dateOfBirth` | Defaults to `0001-01-01` or null depending on binding — list may show an empty date |
| `country` (user-level) | Only `address.country` is collected; top-level `country` on `UserResource` is not set |

See [front-end-models.md](front-end-models.md) for the full field mapping table.

### Submit flow

1. Set `submitted = true` and `alertService.clear()`.
2. Return early if `form.invalid`.
3. Set `loading = true`.
4. **Add mode:** `accountService.register(form.value)` → success alert → navigate to `../` (user list).
5. **Edit mode:** `accountService.update(id, form.value)` → success alert → navigate to `../../` (user list).

Errors call `alertService.error(error)` and reset `loading`. Success messages use `{ keepAfterRouteChange: true }` so the banner survives navigation — see [front-end-alerts.md](front-end-alerts.md).

### Edit mode preload

When `!isAddMode`, `getById(id)` runs on init and `patchValue(user)` fills the form. While loading, the Save button shows a spinner (`loading = true`). If the request fails (for example `404` for a missing ID), `AlertService.error()` displays the message and the user is redirected to the user list.

## AccountService calls

| User action | AccountService method | HTTP |
|-------------|----------------------|------|
| Page load (list) | `getAll()` | `GET /api/v1/users` |
| Delete row | `delete(id)` | `DELETE /api/v1/users/{id}` |
| Add user | `register(form.value)` | `POST /api/v1/users` |
| Edit — load | `getById(id)` | `GET /api/v1/users/{id}` |
| Edit — save | `update(id, form.value)` | `PUT /api/v1/users/{id}` |

Despite the method name, `register()` creates a **user record**, not a login account. See [account-service.md — register() naming](account-service.md#register-naming).

## Known quirks

| Quirk | Detail | Suggested fix |
|-------|--------|---------------|
| Dead password validators | `passwordValidators` are defined in `ngOnInit()` but no password control exists | Remove unused validator setup |
| Missing `dateOfBirth` / user `country` | Form omits API fields the list displays | Add date picker and country field, or hide columns |
| `register()` for create | Method name suggests auth registration | Rename to `createUser()` when refactoring callers |
| ~~Delete errors silent~~ | ~~No `error` callback on delete `subscribe`~~ | Fixed — `AlertService.error()` and reset `isDeleting` on failure |
| ~~Edit load errors silent~~ | ~~`getById` has no error handler~~ | Fixed — `AlertService.error()` and redirect to list on failure |
| ~~Wrong validation message~~ | ~~`profilePictureUrl` invalid feedback says "Salary is required"~~ | Fixed — template copy corrected in `add-edit.component.html` |
| ~~`console.log` calls~~ | ~~Debug logging left in `onSubmit` and `getById`~~ | Fixed — removed from `add-edit.component.ts` |

These are documented starting points in [improvement-ideas.md](improvement-ideas.md).

## Manual testing

Follow the user-management steps in [manual-testing.md — Manual UI walkthrough](manual-testing.md#3-manual-ui-walkthrough):

1. Log in with `admin` / `123456789`.
2. Open **Users** — list loads (may be empty).
3. Create a user with a unique `loginName`.
4. Edit and delete the user.
5. Confirm unauthenticated access redirects to login.

## Related files

| File | Role |
|------|------|
| `front-end/src/app/users/users.module.ts` | Module declaration |
| `front-end/src/app/users/users-routing.module.ts` | Child route table |
| `front-end/src/app/users/list/list.component.ts` | User table and delete |
| `front-end/src/app/users/add-edit/add-edit.component.ts` | Create/edit form logic |
| `front-end/src/app/services/account.service.ts` | HTTP client for CRUD |
| `front-end/src/app/services/alert.service.ts` | Success/error banners |
| `front-end/src/app/helpers/auth.guard.ts` | Blocks unauthenticated access |

## Related docs

- [account-service.md](account-service.md) — HTTP methods, session, and component usage table
- [front-end-models.md](front-end-models.md) — form fields vs API JSON shapes
- [front-end-alerts.md](front-end-alerts.md) — AlertService and form feedback patterns
- [angular-routing.md](angular-routing.md) — lazy-loaded `UsersModule` and AuthGuard flow
- [api-users-crud.md](api-users-crud.md) — back-end CRUD behavior and quirks
- [api-responses.md](api-responses.md) — example JSON for list, get, create, update
- [manual-testing.md](manual-testing.md) — pre-PR UI walkthrough checklist
- [code-map.md](code-map.md) — where to change user list and editor UI
- [improvement-ideas.md](improvement-ideas.md) — suggested fixes for quirks above
