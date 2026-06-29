import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';

import { AccountService } from '../../services';
import { ListComponent } from './list.component';

type UserRow = { id: string; loginName: string; displayName: string; dateOfBirth: string; isDeleting?: boolean };

describe('ListComponent', () => {
    let component: ListComponent;
    let fixture: ComponentFixture<ListComponent>;
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['getAll', 'delete']);

    const sampleUsers: UserRow[] = [
        { id: '1', loginName: 'jdoe', displayName: 'Jane Doe', dateOfBirth: '1990-05-15T00:00:00' },
        { id: '2', loginName: 'asmith', displayName: 'Alice Smith', dateOfBirth: '1985-01-01T00:00:00' }
    ];

    beforeEach(async () => {
        accountServiceSpy.getAll.calls.reset();
        accountServiceSpy.delete.calls.reset();
        spyOn(window, 'confirm').and.returnValue(true);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [ListComponent],
            providers: [
                { provide: AccountService, useValue: accountServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
    });

    it('loads users on init', () => {
        accountServiceSpy.getAll.and.returnValue(of(sampleUsers));

        fixture.detectChanges();

        expect(accountServiceSpy.getAll).toHaveBeenCalled();
        expect(component.users).toEqual(sampleUsers as typeof component.users);
    });

    it('sets users to an empty array when getAll fails', () => {
        accountServiceSpy.getAll.and.returnValue(throwError(() => new Error('Server error')));

        fixture.detectChanges();

        expect(component.users).toEqual([]);
    });

    it('shows an empty-state message when the user list is empty', () => {
        accountServiceSpy.getAll.and.returnValue(of([]));

        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('No users yet');
    });

    it('shows a loading spinner while users are loading', () => {
        const getAllSubject = new Subject<UserRow[]>();
        accountServiceSpy.getAll.and.returnValue(getAllSubject.asObservable());

        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(component.users).toBeNull();
        expect(compiled.querySelector('.spinner-border-lg')).toBeTruthy();

        getAllSubject.next(sampleUsers);
        getAllSubject.complete();
        fixture.detectChanges();

        expect(compiled.querySelector('.spinner-border-lg')).toBeFalsy();
        expect(component.users.length).toBe(2);
    });

    it('removes a user from the list when delete succeeds', () => {
        accountServiceSpy.getAll.and.returnValue(of(sampleUsers.map(user => ({ ...user }))));
        accountServiceSpy.delete.and.returnValue(of(undefined));

        fixture.detectChanges();
        component.deleteUser('1');

        expect(window.confirm).toHaveBeenCalledWith('Delete "Jane Doe"? This cannot be undone.');
        expect(accountServiceSpy.delete).toHaveBeenCalledWith('1');
        expect(component.users.length).toBe(1);
        expect(component.users[0].id).toBe('2');
    });

    it('uses loginName in the delete confirmation when displayName is missing', () => {
        const users = [{ id: '1', loginName: 'jdoe', displayName: '', dateOfBirth: '' }];
        accountServiceSpy.getAll.and.returnValue(of(users));
        accountServiceSpy.delete.and.returnValue(of(undefined));

        fixture.detectChanges();
        component.deleteUser('1');

        expect(window.confirm).toHaveBeenCalledWith('Delete "jdoe"? This cannot be undone.');
    });

    it('uses a generic label in the delete confirmation when displayName and loginName are missing', () => {
        const users = [{ id: '1', loginName: '', displayName: '', dateOfBirth: '' }];
        accountServiceSpy.getAll.and.returnValue(of(users));
        accountServiceSpy.delete.and.returnValue(of(undefined));

        fixture.detectChanges();
        component.deleteUser('1');

        expect(window.confirm).toHaveBeenCalledWith('Delete "this user"? This cannot be undone.');
    });

    it('does not delete when the user cancels the confirmation dialog', () => {
        (window.confirm as jasmine.Spy).and.returnValue(false);
        accountServiceSpy.getAll.and.returnValue(of(sampleUsers.map(user => ({ ...user }))));

        fixture.detectChanges();
        component.deleteUser('1');

        expect(window.confirm).toHaveBeenCalled();
        expect(accountServiceSpy.delete).not.toHaveBeenCalled();
        expect(component.users.length).toBe(2);
        expect(component.users[0].isDeleting).toBeUndefined();
    });

    it('sets isDeleting while delete is in flight', () => {
        const deleteSubject = new Subject<void>();
        accountServiceSpy.getAll.and.returnValue(of(sampleUsers.map(user => ({ ...user }))));
        accountServiceSpy.delete.and.returnValue(deleteSubject.asObservable());

        fixture.detectChanges();
        const user = component.users.find(x => x.id === '1');
        component.deleteUser('1');

        expect(user.isDeleting).toBe(true);

        deleteSubject.next();
        deleteSubject.complete();
    });

    it('does nothing when delete is called before users load', () => {
        accountServiceSpy.getAll.and.returnValue(of(sampleUsers));

        component.deleteUser('1');

        expect(accountServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('does nothing when delete is called for an unknown id', () => {
        accountServiceSpy.getAll.and.returnValue(of(sampleUsers.map(user => ({ ...user }))));

        fixture.detectChanges();
        component.deleteUser('missing');

        expect(accountServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('resets isDeleting when delete fails', () => {
        accountServiceSpy.getAll.and.returnValue(of(sampleUsers.map(user => ({ ...user }))));
        accountServiceSpy.delete.and.returnValue(throwError(() => new Error('Server error')));

        fixture.detectChanges();
        const user = component.users.find(x => x.id === '1');
        component.deleteUser('1');

        expect(user.isDeleting).toBe(false);
        expect(component.users.length).toBe(2);
    });
});
