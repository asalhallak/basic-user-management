import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '../../services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.form = this.formBuilder.group({
            displayName: ['', Validators.required],
            loginName: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
            country: ['', Validators.required],
            isActive: [false, Validators.required],
            salary: ['', Validators.required],
            profilePictureUrl: ['', Validators.required],
            address: this.formBuilder.group({
                city: ['', Validators.required],
                postalCode: ['', Validators.required],
                state: ['', Validators.required],
                streetNumber: ['', Validators.required],
                streetName: ['', Validators.required],
                country: ['', Validators.required]
            }),
        });

        if (!this.isAddMode) {
            this.loading = true;
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: user => {
                        this.form.patchValue({
                            ...user,
                            dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).split('T')[0] : '',
                        });
                        this.loading = false;
                    },
                    error: error => {
                        this.alertService.error(error);
                        this.router.navigate(['../'], { relativeTo: this.route });
                    }
                });
        }
    }

    // convenience getter for easy access to form fields
    get controls() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createUser();
        } else {
            this.updateUser();
        }
    }

    private createUser() {
        this.accountService.register(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('User added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateUser() {
        this.accountService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}
