import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent implements OnInit {
  @Input() movie!: Movie;
  @Input() showOverlay = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  isHovered = false;
  previewTimer: any;
  isPreviewPlaying = false;
  
  constructor(
    private router: Router,
    private movieService: MovieService
  ) {}
  
  ngOnInit(): void {}
  
  getPosterUrl(): string {
    return this.movie.poster_url || 'assets/images/poster-placeholder.jpg';
  }
  
  getGenres(): string[] {
    return this.movieService.getGenresArray(this.movie.genre);
  }
  
  formatDuration(): string {
    return this.movieService.formatDuration(this.movie.duration || 0);
  }
  
  onMouseEnter(): void {
    this.isHovered = true;
    
    // Start preview timer (5-10 second preview after 1 second delay)
    if (this.movie.video_url) {
      this.previewTimer = setTimeout(() => {
        this.isPreviewPlaying = true;
      }, 1000);
    }
  }
  
  onMouseLeave(): void {
    this.isHovered = false;
    
    // Clear preview timer
    if (this.previewTimer) {
      clearTimeout(this.previewTimer);
    }
    
    this.isPreviewPlaying = false;
  }
  
  viewDetails(): void {
    this.router.navigate(['/movie', this.movie.id]);
  }
}