import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LayoutComponent } from './layout.component';

describe('Users LayoutComponent', () => {
    let fixture: ComponentFixture<LayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [LayoutComponent]
        }).compileComponents();
    });

    it('renders a router outlet for nested user routes', () => {
        fixture = TestBed.createComponent(LayoutComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
    });

    it('wraps content in a container layout', () => {
        fixture = TestBed.createComponent(LayoutComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.container')).toBeTruthy();
    });
});
