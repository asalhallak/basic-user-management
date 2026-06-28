import { Component } from '@angular/core';

/**
 * Auth feature shell with a nested router outlet for login and register routes.
 * Session redirects live in child components: login sends signed-in users away;
 * register requires a JWT and redirects when logged out.
 *
 * @see docs/front-end-shell.md
 */
@Component({ templateUrl: 'layout.component.html' })
export class LayoutComponent { }
