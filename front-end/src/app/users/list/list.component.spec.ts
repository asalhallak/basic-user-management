import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';

import { AccountService } from '../../services';
import { ListComponent } from './list.component';

describe('ListComponent', () => {
    let component: ListComponent;
    let fixture: ComponentFixture<ListComponent>;
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['getAll', 'delete']);

    const sampleUsers = [
        { id: '1', loginName: 'jdoe', displayName: 'Jane Doe', dateOfBirth: '1990-05-15T00:00:00' },
        { id: '2', loginName: 'asmith', displayName: 'Alice Smith', dateOfBirth: '1985-01-01T00:00:00' }
    ];

    beforeEach(async () => {
        accountServiceSpy.getAll.calls.reset();
        accountServiceSpy.delete.calls.reset();

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
        expect(component.users).toEqual(sampleUsers);
    });

    it('sets users to an empty array when getAll fails', () => {
        accountServiceSpy.getAll.and.returnValue(throwError(() => new Error('Server error')));

        fixture.detectChanges();

        expect(component.users).toEqual([]);
    });

    it('removes a user from the list when delete succeeds', () => {
        accountServiceSpy.getAll.and.returnValue(of(sampleUsers.map(user => ({ ...user }))));
        accountServiceSpy.delete.and.returnValue(of(undefined));

        fixture.detectChanges();
        component.deleteUser('1');

        expect(accountServiceSpy.delete).toHaveBeenCalledWith('1');
        expect(component.users.length).toBe(1);
        expect(component.users[0].id).toBe('2');
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
