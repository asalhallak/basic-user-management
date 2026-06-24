import { HttpErrorResponse } from '@angular/common/http';

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
