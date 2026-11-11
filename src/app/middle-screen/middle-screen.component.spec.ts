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

  it('falls back to the default asset with loop when nothing is imported', () => {
    cmp.play();
    expect(video.src).toContain('assets/videos/1.mp4');
    expect(video.loop).toBeTrue();
    expect(created.length).toBe(0);
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
