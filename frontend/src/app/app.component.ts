import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('backgroundVideo') private backgroundVideo?: ElementRef<HTMLVideoElement>;

  constructor() {}

  ngAfterViewInit(): void {
    this.playBackgroundVideo();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (!document.hidden) {
      this.playBackgroundVideo();
    }
  }

  private playBackgroundVideo(): void {
    const video = this.backgroundVideo?.nativeElement;

    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;

    const playPromise = video.play();

    if (playPromise) {
      void playPromise.catch(() => {
        setTimeout(() => {
          void video.play().catch(() => undefined);
        }, 300);
      });
    }
  }
}
