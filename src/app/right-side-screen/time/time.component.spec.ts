import { fakeAsync, tick } from '@angular/core/testing';
import { TimeComponent } from './time.component';

describe('TimeComponent', () => {
  it('ticks every second and stops after destroy', fakeAsync(() => {
    const cmp = new TimeComponent();
    const spy = spyOn(cmp, 'updateDateTime').and.callThrough();
    tick(3000);
    expect(spy).toHaveBeenCalledTimes(3);
    cmp.ngOnDestroy();
    tick(5000);
    expect(spy).toHaveBeenCalledTimes(3);
  }));
});
