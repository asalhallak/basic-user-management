import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '../../services';

/**
 * Authenticated user registration (not public sign-up). Maps legacy tutorial form fields
 * (`username`, `firstName`, `lastName`) to API `loginName` and `displayName` before
 * calling `POST /api/v1/users`. Redirects to login on init when no JWT session is present.
 * On success, shows a registration alert and navigates to `/users` so the new row appears
 * in the list without changing the active JWT session.
 *
 * @see docs/front-end-login-register.md
 */
@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        if (!this.accountService.isLoggedIn()) {
            this.router.navigate(['../login'], { relativeTo: this.route });
            return;
        }

        this.form = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        if (!this.accountService.isLoggedIn()) {
            this.router.navigate(['../login'], { relativeTo: this.route });
            return;
        }

        this.loading = true;
        const { username, firstName, lastName } = this.form.value;
        const body = {
            loginName: username,
            displayName: `${firstName} ${lastName}`.trim(),
            isActive: true,
        };
        this.accountService.register(body)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Registration successful', { keepAfterRouteChange: true });
                    this.router.navigate(['/users']);
                },
                error: () => {
                    this.loading = false;
                }
            });
    }
}
