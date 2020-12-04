import { Component } from '@angular/core';

import { AccountService } from './services';
import { User } from './models';

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {

    constructor(private accountService: AccountService) {
    }

    logout() {
        this.accountService.logout();
    }
}
