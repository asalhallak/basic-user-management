import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models';

/**
 * HTTP client for authentication and user CRUD against the real API.
 * Persists the logged-in session in `localStorage` under the key `user`.
 * See docs/account-service.md and docs/front-end-auth.md.
 */
@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    /** Emits the current session whenever login, logout, or self-update changes it. */
    public user: Observable<User>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    /** Current session snapshot (or null when logged out). Used by guards and interceptors. */
    public get userValue(): User {
        return this.userSubject.value;
    }

    /** POST /api/v1/auth/login — stores `{ userName, token }` in localStorage on success. */
    login(userName: string, password: string) {
        return this.http.post<User>(`${environment.apiUrl}/api/v1/auth/login`, { userName, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
                return user;
            }));
    }

    /** Clears localStorage, emits null, and navigates to `/account/login`. */
    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    /** POST /api/v1/users — requires an existing JWT; does not change the logged-in session. */
    register(user: object) {
        return this.http.post(`${environment.apiUrl}/api/v1/users`, user);
    }

    /** GET /api/v1/users — returns all user records. */
    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/api/v1/users`);
    }

    /** GET /api/v1/users/{id} — fetches one user without changing the session. */
    getById(id: string) {
        return this.http.get<User>(`${environment.apiUrl}/api/v1/users/${id}`);
    }

    /** PUT /api/v1/users/{id} — merges into localStorage when editing the logged-in user. */
    update(id, params) {
        return this.http.put(`${environment.apiUrl}/api/v1/users/${id}`, params)
            .pipe(map(x => {
                // update stored user if the logged in user updated their own record
                if (id == this.userValue.id) {
                    // update local storage
                    const user = { ...this.userValue, ...params };
                    localStorage.setItem('user', JSON.stringify(user));

                    // publish updated user to subscribers
                    this.userSubject.next(user);
                }
                return x;
            }));
    }

    /** DELETE /api/v1/users/{id} — does not change the logged-in session. */
    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/api/v1/users/${id}`);
    }
}
