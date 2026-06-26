/**
 * Legacy tutorial user shape used for session storage and loosely typed HTTP responses.
 *
 * The API returns `{ userName, token }` on login and `UserResource` fields on CRUD.
 * This class mixes tutorial names (`username`, `firstName`) with API names (`loginName`,
 * `userName`). Prefer explicit payload objects in components when posting to the API.
 *
 * @see docs/front-end-models.md
 */
export class User {
    /** Primary key from `GET/PUT/DELETE /api/v1/users/{id}` (string in Angular, int in API). */
    id: string;
    /** Legacy login form control name; maps to API `userName` in login requests. */
    username: string;
    /** JWT login response and session field — matches API `Credentials.userName`. */
    userName: string;
    /** API-aligned unique login identifier (`UserResource.loginName`). */
    loginName: string;
    /** API-aligned display name (`UserResource.displayName`). */
    displayName: string;
    /** ISO date string from the user editor (`UserResource.dateOfBirth`). */
    dateOfBirth: string;
    /** Country code or name (`UserResource.country`). */
    country: string;
    /** Register form only — not persisted by the API. */
    password: string;
    /** Legacy register form field; mapped to `displayName` on submit. */
    firstName: string;
    /** Legacy register form field; appended to `displayName` on submit. */
    lastName: string;
    /** JWT bearer token returned by `POST /api/v1/auth/login`. */
    token: string;
}
