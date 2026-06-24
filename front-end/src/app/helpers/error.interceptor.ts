import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService, AlertService } from '../services';
import { extractHttpErrorMessage } from './error-message.util';

export { extractHttpErrorMessage } from './error-message.util';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {
            const message = extractHttpErrorMessage(err);

            if ([401, 403].includes(err.status) && this.accountService.userValue) {
                this.accountService.logout();
                this.alertService.error('Your session has expired. Please log in again.');
            } else {
                this.alertService.error(message);
            }

            console.error(err);
            return throwError(message);
        }))
    }
}
