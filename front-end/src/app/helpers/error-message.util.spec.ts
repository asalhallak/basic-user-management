import { HttpErrorResponse } from '@angular/common/http';

import { extractHttpErrorMessage } from './error-message.util';

describe('extractHttpErrorMessage', () => {
    it('returns statusText when the error body is empty', () => {
        const err = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
        expect(extractHttpErrorMessage(err)).toBe('Unauthorized');
    });

    it('returns a plain-text body when the API responds with a string', () => {
        const err = new HttpErrorResponse({ error: 'Invalid credentials', status: 401 });
        expect(extractHttpErrorMessage(err)).toBe('Invalid credentials');
    });

    it('returns message from a conflict-style JSON body', () => {
        const err = new HttpErrorResponse({
            error: { message: 'A user with this loginName already exists.' },
            status: 409,
            statusText: 'Conflict'
        });
        expect(extractHttpErrorMessage(err)).toBe('A user with this loginName already exists.');
    });

    it('joins ASP.NET Core validation errors into one string', () => {
        const err = new HttpErrorResponse({
            error: {
                errors: {
                    loginName: ['The LoginName field is required.'],
                    displayName: ['The DisplayName field is required.']
                }
            },
            status: 400,
            statusText: 'Bad Request'
        });
        expect(extractHttpErrorMessage(err)).toBe(
            'The LoginName field is required. The DisplayName field is required.'
        );
    });

    it('falls back to title when message and errors are absent', () => {
        const err = new HttpErrorResponse({
            error: { title: 'One or more validation errors occurred.' },
            status: 400,
            statusText: 'Bad Request'
        });
        expect(extractHttpErrorMessage(err)).toBe('One or more validation errors occurred.');
    });
});
