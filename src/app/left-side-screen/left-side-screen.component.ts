import { Component, OnInit, OnDestroy } from '@angular/core';
import { COUNTER } from '../utilities/const/main';
import { EmphasizedQueuesService } from '../services/emphasized-queues.service';
import { WebSocketService } from '../services/websocket.service';
import { TellerService } from '../services/teller.service';
import { ProcessingService } from '../services/processing.service';
import { TextToSpeechService } from '../services/tts.service';
import { VideoSoundService } from '../services/video-sound.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-left-side-screen',
  templateUrl: './left-side-screen.component.html',
  styleUrls: ['./left-side-screen.component.scss'],
})
export class LeftSideScreenComponent implements OnInit, OnDestroy {
  constructor(
    public emphasizedQueuesService: EmphasizedQueuesService,
    private webSocketService: WebSocketService,
    private tellerService: TellerService,
    public processingService: ProcessingService,
    private textToSpeechService: TextToSpeechService,
    private videoSoundService: VideoSoundService
  ) {}

  counter = COUNTER;
  processes: any;

  speechRate: number = 0.7;
  speakTextInProgress = false;

  // prevents repeating the same announcement forever
  private lastAnnouncementKey: string | null = null;

  private subs = new Subscription();

  isEmphasized(index: number): boolean {
    const process = this.processes?.[index];
    const emphasizedQueue = this.processingService.emphasizedQueues?.[0];
    const isOverlay = this.processingService.showEmphasisOverlay;

    return !!(
      process &&
      emphasizedQueue &&
      process.tellerNum === emphasizedQueue.tellerNum &&
      isOverlay
    );
  }

  ngOnInit(): void {
    setTimeout(() => this.greetings(), 3000);

    this.tellerService.getTellersByType('').subscribe((tellers) => {
      this.processes = tellers;
    });

    this.bindTtsLifecycleToUi();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  greetings() {
    this.textToSpeechService.speak(
      'Welcome to Business Permit Licensing Office!',
      1
    );
  }

  private bindTtsLifecycleToUi(): void {
    this.subs.add(
      this.textToSpeechService.onStart$.subscribe(() => {
        this.speakTextInProgress = true;
        this.processingService.showEmphasisOverlay = true;
        this.videoSoundService.pauseVideo();
      })
    );

    this.subs.add(
      this.textToSpeechService.onEnd$.subscribe(() => {
        this.speakTextInProgress = false;
        this.processingService.showEmphasisOverlay = false;
        this.videoSoundService.playVideo();

        // After speaking, refresh and speak next if needed
        this.refreshAndAnnounceIfNeeded();
      })
    );

    this.subs.add(
      this.textToSpeechService.onError$.subscribe(() => {
        this.speakTextInProgress = false;
        this.processingService.showEmphasisOverlay = false;
        this.videoSoundService.playVideo();
      })
    );
  }

  private setupWebSocket(): void {
    this.subs.add(
      this.webSocketService.onQueueUpdate().subscribe(() => {
        this.tellerService.getTellersByType('').subscribe((tellers) => {
          this.processes = tellers;
        });
      })
    );

    // Main trigger for TTS emphasis
    this.subs.add(
      this.webSocketService.ttsUpdate().subscribe(() => {
        this.refreshAndAnnounceIfNeeded(true);
      })
    );

    this.subs.add(
      this.webSocketService.userCapacityUpdate().subscribe(() => {
        this.tellerService.getTellersByType('').subscribe((tellers) => {
          this.processes = tellers;
        });
      })
    );
  }

  private refreshAndAnnounceIfNeeded(force: boolean = false): void {
    if (this.speakTextInProgress) return;

    this.processingService.getEmphasizedQueues().subscribe(() => {
      this.announceFirstEmphasisIfNeeded(force);
    });
  }

  private announceFirstEmphasisIfNeeded(force: boolean = false): void {
    const emphasized = this.processingService.emphasizedQueues?.[0];
    const counterNum = emphasized?.tellerNum;
    const queueNum = emphasized?.queue?.queueNum;
    const queueType = emphasized?.queue?.type;

    if (!counterNum || !queueNum) return;

    const key = `${queueType || ''}-${queueNum}-${counterNum}`;

    // Avoid endless repeat if backend doesn't change
    if (!force && this.lastAnnouncementKey === key) return;

    this.lastAnnouncementKey = key;

    const textToSpeak =
      `Attention, ${queueType} number ${queueNum}, ` +
      `Please Proceed to counter number ${counterNum}. ` +
      `Number ${queueNum}, Counter ${counterNum}.`;

    this.textToSpeechService.speak(textToSpeak, this.speechRate);
  }
}
