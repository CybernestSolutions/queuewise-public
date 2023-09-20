import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityProcessingNumbersComponent } from './priority-processing-numbers.component';

describe('PriorityProcessingNumbersComponent', () => {
  let component: PriorityProcessingNumbersComponent;
  let fixture: ComponentFixture<PriorityProcessingNumbersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PriorityProcessingNumbersComponent]
    });
    fixture = TestBed.createComponent(PriorityProcessingNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
