import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hero-carousel',
  templateUrl: './hero-carousel.component.html',
  styleUrls: ['./hero-carousel.component.scss']
})
export class HeroCarouselComponent implements OnInit {
  @Input() movies: Movie[] = [];
  @Input() autoplay = true;
  @Input() interval = 5000;
  
  isLoggedIn = false;
  hasProfile = false;
  
  constructor(
    private router: Router,
    private movieService: MovieService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
    
    this.authService.currentProfile$.subscribe(profile => {
      this.hasProfile = !!profile;
    });
  }
  
  getBackdropUrl(movie: Movie): string {
    return movie.backdrop_url || 'assets/images/backdrop-placeholder.jpg';
  }
  
  getTrailerThumbnail(movie: Movie): string {
    if (movie.trailer_url) {
      return this.movieService.getYoutubeThumbnail(movie.trailer_url);
    }
    return '';
  }
  
  formatDuration(minutes?: number): string {
    return this.movieService.formatDuration(minutes || 0);
  }
  
  getGenres(movie: Movie): string[] {
    return this.movieService.getGenresArray(movie.genre);
  }
  
  watchMovie(movie: Movie): void {
    if (this.isLoggedIn && this.hasProfile) {
      this.router.navigate(['/watch', movie.id]);
    } else if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/watch/${movie.id}` } });
    }
  }
  
  viewDetails(movie: Movie): void {
    this.router.navigate(['/movie', movie.id]);
  }
}