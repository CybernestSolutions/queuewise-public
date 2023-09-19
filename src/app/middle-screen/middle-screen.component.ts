import { Component } from '@angular/core';

@Component({
  selector: 'app-middle-screen',
  templateUrl: './middle-screen.component.html',
  styleUrls: ['./middle-screen.component.scss'],
})
export class MiddleScreenComponent {
  videos: File[] = [];
  videoIndex = 0;
  showOverlay = true;
  selectedFileCount = 0;

  handleFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (files) {
      this.selectedFileCount = files.length;
      for (let i = 0; i < files.length; i++) {
        this.videos.push(files[i]);
      }
    }
  }

  play() {
    const videoElement = document.getElementById('video') as HTMLVideoElement;

    if (this.videos.length > 0) {
      const videoPath = URL.createObjectURL(this.videos[this.videoIndex]);
      videoElement.src = videoPath;
      videoElement.load();
      videoElement.play();
      this.showOverlay = false;
    }
  }

  playNextVideo() {
    const videoElement = document.getElementById('video') as HTMLVideoElement;

    if (this.videos.length > 0) {
      this.videoIndex = (this.videoIndex + 1) % this.videos.length;
      const videoPath = URL.createObjectURL(this.videos[this.videoIndex]);
      videoElement.src = videoPath;
      videoElement.load();
      videoElement.play();
    }
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
