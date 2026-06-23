import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '../services';

/** Map ASP.NET Core error bodies (validation, conflict, plain text) to a user-facing string. */
export function extractHttpErrorMessage(err: HttpErrorResponse): string {
    const body = err.error;

    if (body == null || body === '') {
        return err.statusText || 'Unknown error';
    }

    if (typeof body === 'string') {
        return body;
    }

    if (typeof body.message === 'string' && body.message.length > 0) {
        return body.message;
    }

    if (body.errors && typeof body.errors === 'object') {
        const messages: string[] = [];
        for (const value of Object.values(body.errors)) {
            if (Array.isArray(value)) {
                for (const message of value) {
                    if (typeof message === 'string' && message.length > 0) {
                        messages.push(message);
                    }
                }
            }
        }
        if (messages.length > 0) {
            return messages.join(' ');
        }
    }

    if (typeof body.title === 'string' && body.title.length > 0) {
        return body.title;
    }

    return err.statusText || 'Unknown error';
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {
            if ([401, 403].includes(err.status) && this.accountService.userValue) {
                // auto logout if 401 or 403 response returned from api
                this.accountService.logout();
            }

            console.error(err);
            return throwError(extractHttpErrorMessage(err));
        }))
    }
}
