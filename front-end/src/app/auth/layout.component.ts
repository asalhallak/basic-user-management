import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '../services';

/**
 * Auth feature shell with a nested router outlet for login and register routes.
 * Redirects to home when a session already exists.
 *
 * @see docs/front-end-shell.md
 */
@Component({ templateUrl: 'layout.component.html' })
export class LayoutComponent {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) {
        // redirect to home if already logged in
        if (this.accountService.userValue) {
            this.router.navigate(['/']);
        }
    }
}
