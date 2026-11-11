import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { MiddleScreenComponent } from './middle-screen.component';

describe('MiddleScreenComponent', () => {
  let video: any;
  let sound: { setVideoElement: jasmine.Spy; setVolume: jasmine.Spy };
  let cmp: MiddleScreenComponent;
  let created: string[];
  let revoked: string[];
  const blob = (n: string) => new Blob([n], { type: 'video/mp4' });

  beforeEach(() => {
    video = {
      src: '',
      loop: false,
      load: jasmine.createSpy('load'),
      play: jasmine.createSpy('play').and.returnValue(Promise.resolve()),
      pause: jasmine.createSpy('pause'),
      removeAttribute: jasmine.createSpy('removeAttribute').and.callFake((a: string) => a === 'src' && (video.src = '')),
    };
    sound = { setVideoElement: jasmine.createSpy('set'), setVolume: jasmine.createSpy('vol') };
    cmp = new MiddleScreenComponent(sound as any);
    cmp.videoRef = { nativeElement: video } as any;
    created = [];
    revoked = [];
    let n = 0;
    spyOn(URL, 'createObjectURL').and.callFake(() => {
      const u = `blob:test/${++n}`;
      created.push(u);
      return u;
    });
    spyOn(URL, 'revokeObjectURL').and.callFake((u: string) => void revoked.push(u));
  });

  it('loops a single clip natively and never swaps the source', () => {
    cmp.videos = [{ name: 'a', blob: blob('a') }];
    cmp.play();
    expect(video.loop).toBeTrue();
    expect(video.load).toHaveBeenCalledTimes(1);
    cmp.playNextVideo(); // (ended) cannot fire with loop on; must be a no-op anyway
    expect(video.load).toHaveBeenCalledTimes(1);
    expect(created.length).toBe(1);
  });

  it('advances exactly one clip per ended and revokes the previous blob URL', () => {
    cmp.videos = ['a', 'b', 'c'].map((n) => ({ name: n, blob: blob(n) }));
    cmp.play();
    expect(video.loop).toBeFalse();
    cmp.playNextVideo();
    expect(cmp.videoIndex).toBe(1);
    cmp.playNextVideo();
    expect(cmp.videoIndex).toBe(2);
    cmp.playNextVideo();
    expect(cmp.videoIndex).toBe(0);
    expect(video.load).toHaveBeenCalledTimes(4);
    expect(created.length).toBe(4);
    expect(revoked).toEqual(created.slice(0, 3)); // only the live URL is kept
  });

  it('registers the element with the sound service and hides the overlay', () => {
    cmp.videos = [{ name: 'a', blob: blob('a') }];
    cmp.play();
    expect(sound.setVideoElement).toHaveBeenCalledWith(video);
    expect(sound.setVolume).toHaveBeenCalledWith(0.25);
    expect(cmp.showOverlay).toBeFalse();
  });

  it('playAll restarts from the first clip without reloading the page', () => {
    cmp.videos = ['a', 'b'].map((n) => ({ name: n, blob: blob(n) }));
    cmp.play();
    cmp.playNextVideo();
    expect(cmp.videoIndex).toBe(1);
    cmp.playAll();
    expect(cmp.videoIndex).toBe(0);
    expect(video.src).toBe(created[created.length - 1]);
  });

  it('with nothing imported: no default asset, empty source, import overlay stays up', () => {
    cmp.play();
    expect(video.src).toBe('');
    expect(video.removeAttribute).toHaveBeenCalledWith('src');
    expect(video.play).not.toHaveBeenCalled();
    expect(cmp.showOverlay).toBeTrue();
    expect(created.length).toBe(0);
  });

  describe('Delete All', () => {
    let clear: jasmine.Spy;
    beforeEach(() => {
      clear = jasmine.createSpy('clear').and.returnValue(Promise.resolve());
      (cmp as any).db = { videos: { clear } };
      cmp.videos = ['a', 'b'].map((n) => ({ name: n, blob: blob(n) }));
      cmp.selectedFileCount = 2;
      cmp.play();
      cmp.playNextVideo();
    });
    afterEach(() => cmp.ngOnDestroy());

    it('first tap only arms it; it disarms after 5 s without deleting', fakeAsync(() => {
      cmp.deleteAll();
      expect(cmp.deleteArmed).toBeTrue();
      tick(4999);
      expect(cmp.deleteArmed).toBeTrue();
      tick(1);
      expect(cmp.deleteArmed).toBeFalse();
      expect(clear).not.toHaveBeenCalled();
      expect(cmp.videos.length).toBe(2);
    }));

    it('a second tap within 5 s clears the table and state, revokes the blob URL, empties the element', fakeAsync(() => {
      const live = video.src;
      cmp.deleteAll();
      tick(3000);
      cmp.deleteAll();
      flushMicrotasks();
      expect(clear).toHaveBeenCalledTimes(1);
      expect([cmp.videos.length, cmp.videoIndex, cmp.selectedFileCount, cmp.deleteArmed]).toEqual([0, 0, 0, false]);
      expect(revoked).toContain(live);
      expect(video.src).toBe('');
      expect(cmp.showOverlay).toBeTrue();
      tick(5000); // the disarm timer was cancelled: nothing re-arms or throws
      expect(cmp.deleteArmed).toBeFalse();
    }));

    it('keeps the videos if the database clear fails', fakeAsync(() => {
      clear.and.returnValue(Promise.reject(new Error('quota')));
      spyOn(console, 'error');
      cmp.deleteAll();
      cmp.deleteAll();
      flushMicrotasks();
      expect(cmp.videos.length).toBe(2);
      expect(console.error).toHaveBeenCalled();
    }));
  });

  it('toggles the overlay (Escape / double-click) without touching playback', () => {
    cmp.videos = [{ name: 'a', blob: blob('a') }];
    cmp.play();
    cmp.toggleOverlay();
    expect(cmp.showOverlay).toBeTrue();
    cmp.toggleOverlay();
    expect(cmp.showOverlay).toBeFalse();
    expect(video.load).toHaveBeenCalledTimes(1);
  });
});
