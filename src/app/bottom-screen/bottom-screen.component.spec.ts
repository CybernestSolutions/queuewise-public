import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomScreenComponent } from './bottom-screen.component';

describe('BottomScreenComponent', () => {
  let component: BottomScreenComponent;
  let fixture: ComponentFixture<BottomScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BottomScreenComponent]
    });
    fixture = TestBed.createComponent(BottomScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
