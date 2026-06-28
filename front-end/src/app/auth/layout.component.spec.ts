import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LayoutComponent } from './layout.component';

describe('Auth LayoutComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [LayoutComponent]
        }).compileComponents();
    });

    it('creates without redirecting', () => {
        expect(() => TestBed.createComponent(LayoutComponent)).not.toThrow();
    });
});
