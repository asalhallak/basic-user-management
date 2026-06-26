import { Component } from '@angular/core';

import { AccountService } from './services';
import { User } from './models';

/**
 * Root shell: navbar visibility, logout, and the global alert host.
 * Subscribes to `AccountService.user` so the template reacts to login state.
 *
 * @see docs/front-end-shell.md
 */
@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {
    user: User;

    constructor(private accountService: AccountService) {
        this.accountService.user.subscribe(x => this.user = x);
    }

    logout() {
        this.accountService.logout();
    }
}
