import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '../../services';

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
        private accountService: AccountService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        // password not required in edit mode
        const passwordValidators = [Validators.minLength(6)];
        if (this.isAddMode) {
            passwordValidators.push(Validators.required);
        }

        this.form = this.formBuilder.group({
            displayName: ['', Validators.required],
            loginName: ['', Validators.required],
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
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    console.log(x)
                    this.form.patchValue(x);
                });
        }
    }

    // convenience getter for easy access to form fields
    get controls() { return this.form.controls; }

    onSubmit() {
        console.log(this.form.value)
        this.submitted = true;
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
        console.log(this.form.value)
        this.accountService.add(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.loading = false;
                }
            });
    }

    private updateUser() {
        this.accountService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.loading = false;
                }
            });
    }
}
