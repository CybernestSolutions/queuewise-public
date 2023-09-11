import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingNumbersComponent } from './processing-numbers.component';

describe('ProcessingNumbersComponent', () => {
  let component: ProcessingNumbersComponent;
  let fixture: ComponentFixture<ProcessingNumbersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessingNumbersComponent]
    });
    fixture = TestBed.createComponent(ProcessingNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
