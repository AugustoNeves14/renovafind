import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as Hls from 'hls.js';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @Input() videoUrl: string = '';
  @Input() autoplay: boolean = false;
  @Input() poster: string = '';
  @Input() title: string = '';
  @Input() subtitles: { src: string, label: string, srclang: string }[] = [];
  
  @Output() timeUpdate = new EventEmitter<number>();
  @Output() videoEnded = new EventEmitter<void>();
  @Output() videoStarted = new EventEmitter<void>();
  
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;
  
  isPlaying: boolean = false;
  isMuted: boolean = false;
  isFullscreen: boolean = false;
  isPipActive: boolean = false;
  showControls: boolean = true;
  controlsTimeout: any;
  volume: number = 1;
  currentTime: number = 0;
  duration: number = 0;
  buffered: number = 0;
  isLoading: boolean = true;
  showSettings: boolean = false;
  playbackRates: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
  currentPlaybackRate: number = 1;
  currentQuality: string = 'auto';
  qualities: string[] = ['auto', '1080p', '720p', '480p', '360p'];
  
  private hls: Hls | null = null;
  
  constructor() {}
  
  ngOnInit(): void {
    // Initialize player when component is ready
    setTimeout(() => {
      this.initializePlayer();
    });
  }
  
  ngOnDestroy(): void {
    this.destroyPlayer();
  }
  
  private initializePlayer(): void {
    const video = this.videoPlayerRef.nativeElement;
    
    // Check if HLS is supported
    if (Hls.isSupported() && this.isHlsStream(this.videoUrl)) {
      this.hls = new Hls();
      this.hls.loadSource(this.videoUrl);
      this.hls.attachMedia(video);
      
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (this.autoplay) {
          video.play().catch(() => {
            console.log('Autoplay prevented by browser');
          });
        }
        this.isLoading = false;
      });
      
      this.hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              this.hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              this.hls?.recoverMediaError();
              break;
            default:
              this.destroyPlayer();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has built-in HLS support
      video.src = this.videoUrl;
      video.addEventListener('loadedmetadata', () => {
        if (this.autoplay) {
          video.play().catch(() => {
            console.log('Autoplay prevented by browser');
          });
        }
        this.isLoading = false;
      });
    } else {
      // Fallback for other browsers
      video.src = this.videoUrl;
      if (this.autoplay) {
        video.play().catch(() => {
          console.log('Autoplay prevented by browser');
        });
      }
      this.isLoading = false;
    }
    
    // Add event listeners
    video.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
    video.addEventListener('durationchange', this.onDurationChange.bind(this));
    video.addEventListener('progress', this.onProgress.bind(this));
    video.addEventListener('ended', this.onEnded.bind(this));
    video.addEventListener('play', this.onPlay.bind(this));
    video.addEventListener('pause', this.onPause.bind(this));
    video.addEventListener('waiting', () => { this.isLoading = true; });
    video.addEventListener('canplay', () => { this.isLoading = false; });
    
    // Add subtitles if available
    this.addSubtitles();
  }
  
  private destroyPlayer(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    
    const video = this.videoPlayerRef?.nativeElement;
    if (video) {
      video.removeEventListener('timeupdate', this.onTimeUpdate);
      video.removeEventListener('durationchange', this.onDurationChange);
      video.removeEventListener('progress', this.onProgress);
      video.removeEventListener('ended', this.onEnded);
      video.removeEventListener('play', this.onPlay);
      video.removeEventListener('pause', this.onPause);
    }
  }
  
  private isHlsStream(url: string): boolean {
    return url.includes('.m3u8');
  }
  
  private addSubtitles(): void {
    if (!this.subtitles.length) return;
    
    const video = this.videoPlayerRef.nativeElement;
    
    // Remove existing tracks
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }
    
    // Add new tracks
    this.subtitles.forEach(subtitle => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = subtitle.label;
      track.srclang = subtitle.srclang;
      track.src = subtitle.src;
      
      video.appendChild(track);
    });
  }
  
  // Event handlers
  private onTimeUpdate(): void {
    const video = this.videoPlayerRef.nativeElement;
    this.currentTime = video.currentTime;
    this.timeUpdate.emit(this.currentTime);
  }
  
  private onDurationChange(): void {
    const video = this.videoPlayerRef.nativeElement;
    this.duration = video.duration;
  }
  
  private onProgress(): void {
    const video = this.videoPlayerRef.nativeElement;
    if (video.buffered.length > 0) {
      this.buffered = video.buffered.end(video.buffered.length - 1);
    }
  }
  
  private onEnded(): void {
    this.isPlaying = false;
    this.videoEnded.emit();
  }
  
  private onPlay(): void {
    this.isPlaying = true;
    this.videoStarted.emit();
  }
  
  private onPause(): void {
    this.isPlaying = false;
  }
  
  // Control methods
  togglePlay(): void {
    const video = this.videoPlayerRef.nativeElement;
    if (this.isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
    this.resetControlsTimeout();
  }
  
  toggleMute(): void {
    const video = this.videoPlayerRef.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
    this.resetControlsTimeout();
  }
  
  setVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    const video = this.videoPlayerRef.nativeElement;
    this.volume = parseFloat(input.value);
    video.volume = this.volume;
    video.muted = this.volume === 0;
    this.isMuted = video.muted;
    this.resetControlsTimeout();
  }
  
  seek(event: Event): void {
    const input = event.target as HTMLInputElement;
    const video = this.videoPlayerRef.nativeElement;
    const seekTime = parseFloat(input.value);
    video.currentTime = seekTime;
    this.resetControlsTimeout();
  }
  
  seekByClick(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const video = this.videoPlayerRef.nativeElement;
    video.currentTime = percent * video.duration;
    this.resetControlsTimeout();
  }
  
  toggleFullscreen(): void {
    const container = document.querySelector('.video-player-container') as HTMLElement;
    
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
      this.isFullscreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      this.isFullscreen = false;
    }
    
    this.resetControlsTimeout();
  }
  
  togglePictureInPicture(): void {
    const video = this.videoPlayerRef.nativeElement;
    
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
      this.isPipActive = false;
    } else if (document.pictureInPictureEnabled) {
      video.requestPictureInPicture();
      this.isPipActive = true;
    }
    
    this.resetControlsTimeout();
  }
  
  setPlaybackRate(rate: number): void {
    const video = this.videoPlayerRef.nativeElement;
    video.playbackRate = rate;
    this.currentPlaybackRate = rate;
    this.showSettings = false;
    this.resetControlsTimeout();
  }
  
  setQuality(quality: string): void {
    // This would be implemented with HLS.js quality switching
    // For now, just update the UI
    this.currentQuality = quality;
    this.showSettings = false;
    this.resetControlsTimeout();
  }
  
  toggleSettings(): void {
    this.showSettings = !this.showSettings;
    this.resetControlsTimeout();
  }
  
  // Helper methods
  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }
  
  onMouseMove(): void {
    this.showControls = true;
    this.resetControlsTimeout();
  }
  
  resetControlsTimeout(): void {
    clearTimeout(this.controlsTimeout);
    this.showControls = true;
    
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying && !this.showSettings) {
        this.showControls = false;
      }
    }, 3000);
  }
  
  getBufferedPercent(): number {
    return (this.buffered / this.duration) * 100 || 0;
  }
  
  getCurrentPercent(): number {
    return (this.currentTime / this.duration) * 100 || 0;
  }
  
  forward10(): void {
    const video = this.videoPlayerRef.nativeElement;
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
    this.resetControlsTimeout();
  }
  
  rewind10(): void {
    const video = this.videoPlayerRef.nativeElement;
    video.currentTime = Math.max(video.currentTime - 10, 0);
    this.resetControlsTimeout();
  }
}