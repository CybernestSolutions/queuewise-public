import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftSideScreenComponent } from './left-side-screen.component';

describe('LeftSideScreenComponent', () => {
  let component: LeftSideScreenComponent;
  let fixture: ComponentFixture<LeftSideScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeftSideScreenComponent]
    });
    fixture = TestBed.createComponent(LeftSideScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
