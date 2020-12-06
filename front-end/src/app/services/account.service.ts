import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private claims: any;
    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.claims = JSON.parse(localStorage.getItem('claims'));
    }

    public get Claims() {
        return this.claims;
    }

    login(username, password) {
        return this.http.post<User>(`${environment.apiUrl}/api/v1/auth/login`, { username, password })
            .pipe(map(claims => {
                localStorage.setItem('claims', JSON.stringify(claims));
                this.claims = claims;
                return claims;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('claims');
        this.claims = null;
        this.router.navigate(['/account/login']);
    }

    add(user: User) {
        return this.http.post(`${environment.apiUrl}/api/v1/users`, user);
    }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/api/v1/users`);
    }

    getById(id: string) {
        return this.http.get<User>(`${environment.apiUrl}/api/v1/users/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/api/v1/users/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/api/v1/users/${id}`);
    }
}
