import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextNumbersComponent } from './next-numbers.component';

describe('NextNumbersComponent', () => {
  let component: NextNumbersComponent;
  let fixture: ComponentFixture<NextNumbersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NextNumbersComponent]
    });
    fixture = TestBed.createComponent(NextNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
