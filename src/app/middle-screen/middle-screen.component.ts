import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VideoSoundService } from '../services/video-sound.service';
import Dexie from 'dexie';

// Define the Dexie database
class VideoDatabase extends Dexie {
  videos: Dexie.Table<{ id?: number; name: string; blob: Blob }, number>;

  constructor() {
    super('VideoDatabase');
    this.version(1).stores({
      videos: '++id,name,blob',
    });
    this.videos = this.table<{ id?: number; name: string; blob: Blob }, number>(
      'videos'
    );
  }
}

@Component({
  selector: 'app-middle-screen',
  templateUrl: './middle-screen.component.html',
  styleUrls: ['./middle-screen.component.scss'],
})
export class MiddleScreenComponent implements OnInit, OnDestroy {
  /** Window for the second "Delete All" tap. */
  static readonly CONFIRM_MS = 5000;

  constructor(private videoSoundService: VideoSoundService) {}

  @ViewChild('videoElement', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;

  videos: { name: string; blob: Blob }[] = [];
  videoIndex = 0;
  showOverlay = true;
  selectedFileCount = 0;
  db = new VideoDatabase();
  private currentUrl: string | null = null;
  /** First "Delete All" tap arms it (red); a second tap within CONFIRM_MS deletes. */
  deleteArmed = false;
  private disarmTimer?: ReturnType<typeof setTimeout>;

  private get video(): HTMLVideoElement {
    return this.videoRef.nativeElement;
  }

  async ngOnInit(): Promise<void> {
    // Load videos from Dexie database on initialization
    const savedVideos = await this.db.videos.toArray();
    this.videos = savedVideos.map((video) => ({
      name: video.name,
      blob: video.blob,
    }));
    this.selectedFileCount = this.videos.length;
    this.play();
  }

  ngOnDestroy(): void {
    clearTimeout(this.disarmTimer);
  }

  async handleFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = file.slice();
        await this.db.videos.add({ name: file.name, blob });
        this.videos.push({ name: file.name, blob });
      }
      this.selectedFileCount = this.videos.length;
    }
  }

  play() {
    const videoElement = this.video;
    this.videoSoundService.setVideoElement(videoElement);
    this.videoSoundService.setVolume(0.25);

    if (this.videos.length > 0) {
      this.videoIndex = Math.min(this.videoIndex, this.videos.length - 1);
      // One clip: let the element loop natively, no src swap / load() per cycle.
      videoElement.loop = this.videos.length === 1;
      this.setSource(this.videoIndex);
      this.showOverlay = false;
    } else {
      // Nothing imported. assets/videos is not shipped, so there is no default clip: empty the element
      // (the watchdog sees no source and stays idle) and keep the import overlay up.
      videoElement.loop = false;
      videoElement.pause();
      videoElement.removeAttribute('src');
      videoElement.load();
      if (this.currentUrl) URL.revokeObjectURL(this.currentUrl);
      this.currentUrl = null;
      this.showOverlay = true;
    }
  }

  // Bound once, from the template's (ended). Not reached when loop is on.
  playNextVideo() {
    if (this.videos.length > 1) {
      this.videoIndex = (this.videoIndex + 1) % this.videos.length;
      this.setSource(this.videoIndex);
    }
  }

  private setSource(index: number): void {
    const videoElement = this.video;
    const previous = this.currentUrl;
    this.currentUrl = URL.createObjectURL(this.videos[index].blob);
    videoElement.src = this.currentUrl;
    videoElement.load();
    // AbortError when a newer load() supersedes this play(); the watchdog covers real failures.
    videoElement.play().catch(() => {});
    if (previous) URL.revokeObjectURL(previous);
  }

  /** "Play All": start the imported list from the top. No page reload. */
  playAll() {
    this.videoIndex = 0;
    this.play();
  }

  /** "Delete All": two taps within CONFIRM_MS, never a blocking confirm(). */
  async deleteAll(): Promise<void> {
    if (!this.deleteArmed) {
      this.deleteArmed = true;
      this.disarmTimer = setTimeout(() => (this.deleteArmed = false), MiddleScreenComponent.CONFIRM_MS);
      return;
    }
    clearTimeout(this.disarmTimer);
    this.deleteArmed = false;
    try {
      await this.db.videos.clear();
    } catch (e) {
      console.error('[tv] delete all videos failed:', e); // nothing was cleared: keep playing what is stored
      return;
    }
    this.videos = [];
    this.videoIndex = 0;
    this.selectedFileCount = 0;
    this.play();
  }

  // The video has no controls (nothing on the TV can pause it by accident), so the
  // operator opens the import overlay with Escape or a double-click instead.
  @HostListener('document:keydown.escape')
  @HostListener('dblclick')
  toggleOverlay() {
    this.showOverlay = !this.showOverlay;
  }

  selectVideos() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
}
