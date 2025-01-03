import { Component, OnInit } from '@angular/core';
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
export class MiddleScreenComponent implements OnInit {
  constructor(private videoSoundService: VideoSoundService) {}

  videos: { name: string; blob: Blob }[] = [];
  videoIndex = 0;
  showOverlay = true;
  selectedFileCount = 0;
  db = new VideoDatabase();

  async ngOnInit(): Promise<void> {
    // Load videos from Dexie database on initialization
    const savedVideos = await this.db.videos.toArray();
    this.videos = savedVideos.map((video) => ({
      name: video.name,
      blob: video.blob,
    }));
    this.play();
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
    const videoElement = document.getElementById('video') as HTMLVideoElement;
    this.videoSoundService.setVideoElement(videoElement);
    this.videoSoundService.setVolume(0.25);

    if (this.videos.length > 0) {
      const videoBlob = this.videos[this.videoIndex].blob;
      const videoPath = URL.createObjectURL(videoBlob);
      videoElement.src = videoPath;
      videoElement.load();
      videoElement.play();
      this.showOverlay = false;

      videoElement.onended = () => {
        this.playNextVideo();
      };
    } else {
      // If no videos are selected, play a default video
      const defaultVideoPath = 'assets/videos/1.mp4'; // Change to your default video path
      videoElement.src = defaultVideoPath;
      videoElement.load();
      videoElement.play();
      videoElement.loop = true; // Loop the default video
      this.showOverlay = false;
    }
  }

  playNextVideo() {
    const videoElement = document.getElementById('video') as HTMLVideoElement;

    if (this.videos.length > 0) {
      this.videoIndex = (this.videoIndex + 1) % this.videos.length;
      const videoBlob = this.videos[this.videoIndex].blob;
      const videoPath = URL.createObjectURL(videoBlob);
      videoElement.src = videoPath;
      videoElement.load();
      videoElement.play();
    }
  }

    PlayAndreloadScreen() {
    this.play()
    window.location.reload();
  }

  onPlay() {
    this.showOverlay = false;
  }

  onPause() {
    this.showOverlay = true;
  }

  selectVideos() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
}
