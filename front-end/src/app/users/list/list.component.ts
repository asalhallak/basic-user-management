import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../../models';
import { AccountService } from '../../services';

/** User row with optional UI-only delete loading flag. */
type UserRow = User & { isDeleting?: boolean };

/**
 * Protected user list. Loads all users on init and supports inline delete with
 * per-row loading state (`isDeleting`). API errors surface via `ErrorInterceptor`.
 *
 * @see docs/front-end-users.md
 */
@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    users: UserRow[] | null = null;

    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe({
                next: users => this.users = users,
                error: () => {
                    this.users = [];
                }
            });
    }

    deleteUser(id: string) {
        if (!this.users) {
            return;
        }

        const user = this.users.find(x => x.id === id);
        if (!user) {
            return;
        }
        user.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe({
                next: () => this.users = this.users.filter(x => x.id !== id),
                error: () => {
                    user.isDeleting = false;
                }
            });
    }
}
