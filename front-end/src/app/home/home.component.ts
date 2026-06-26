import { Component } from '@angular/core';

import { User } from '../models';
import { AccountService } from '../services';

/**
 * Protected home page shown after login. Greets the user with `userName` from the JWT session.
 *
 * @see docs/front-end-shell.md
 */
@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
    user: User;

    constructor(private accountService: AccountService) {
        this.user = this.accountService.userValue;
    }
}
