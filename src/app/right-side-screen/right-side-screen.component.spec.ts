import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightSideScreenComponent } from './right-side-screen.component';

describe('RightSideScreenComponent', () => {
  let component: RightSideScreenComponent;
  let fixture: ComponentFixture<RightSideScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RightSideScreenComponent]
    });
    fixture = TestBed.createComponent(RightSideScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
