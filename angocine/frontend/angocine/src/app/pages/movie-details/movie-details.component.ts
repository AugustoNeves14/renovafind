import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../services/movie.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Movie, MovieDetails, Review } from '../../models/movie.model';
import { Profile } from '../../models/user.model';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss']
})
export class MovieDetailsComponent implements OnInit {
  movie: MovieDetails | null = null;
  similarMovies: Movie[] = [];
  reviews: Review[] = [];
  
  isLoading = true;
  error: string | null = null;
  
  showTrailer = false;
  trailerUrl: SafeResourceUrl | null = null;
  
  userRating = 0;
  userReview = '';
  isSubmittingReview = false;
  reviewError: string | null = null;
  
  isLoggedIn = false;
  currentProfile: Profile | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private sanitizer: DomSanitizer
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMovie(parseInt(id));
      } else {
        this.router.navigate(['/']);
      }
    });
    
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
    
    this.authService.currentProfile$.subscribe(profile => {
      this.currentProfile = profile;
    });
  }
  
  loadMovie(id: number): void {
    this.isLoading = true;
    
    this.movieService.getMovie(id).subscribe(
      response => {
        this.movie = response.data.movie;
        this.reviews = response.data.reviews;
        this.similarMovies = response.data.similar_movies;
        
        // Prepare trailer URL if available
        if (this.movie.trailer_url) {
          this.prepareTrailerUrl(this.movie.trailer_url);
        }
        
        this.isLoading = false;
        
        // Record analytics event
        if (this.currentProfile) {
          this.analyticsService.recordEvent(
            this.currentProfile.id,
            'movie_viewed',
            this.movie.id
          ).subscribe();
        }
      },
      error => {
        console.error('Error loading movie:', error);
        this.error = 'Erro ao carregar detalhes do filme. Por favor, tente novamente mais tarde.';
        this.isLoading = false;
      }
    );
  }
  
  prepareTrailerUrl(url: string): void {
    const videoId = this.movieService.extractYoutubeId(url);
    if (videoId) {
      this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`
      );
    }
  }
  
  openTrailer(): void {
    this.showTrailer = true;
  }
  
  closeTrailer(): void {
    this.showTrailer = false;
  }
  
  watchMovie(): void {
    if (!this.movie) return;
    
    if (this.isLoggedIn && this.currentProfile) {
      this.router.navigate(['/watch', this.movie.id]);
    } else if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/watch/${this.movie.id}` } });
    }
  }
  
  submitReview(): void {
    if (!this.movie || !this.isLoggedIn || !this.currentProfile) return;
    
    if (this.userRating === 0) {
      this.reviewError = 'Por favor, selecione uma avaliação de 1 a 5 estrelas.';
      return;
    }
    
    this.isSubmittingReview = true;
    this.reviewError = null;
    
    this.movieService.addReview(this.movie.id, this.userRating, this.userReview).subscribe(
      response => {
        // Reload movie to get updated reviews
        this.loadMovie(this.movie!.id);
        
        // Reset form
        this.userRating = 0;
        this.userReview = '';
        this.isSubmittingReview = false;
        
        // Record analytics event
        if (this.currentProfile) {
          this.analyticsService.recordMovieRated(
            this.currentProfile.id,
            this.movie!.id,
            this.userRating
          ).subscribe();
        }
      },
      error => {
        console.error('Error submitting review:', error);
        this.reviewError = 'Erro ao enviar avaliação. Por favor, tente novamente.';
        this.isSubmittingReview = false;
      }
    );
  }
  
  getGenres(): string[] {
    if (!this.movie || !this.movie.genre) return [];
    return this.movieService.getGenresArray(this.movie.genre);
  }
  
  formatDuration(): string {
    if (!this.movie || !this.movie.duration) return '';
    return this.movieService.formatDuration(this.movie.duration);
  }
  
  getBackdropUrl(): string {
    if (!this.movie || !this.movie.backdrop_url) {
      return 'assets/images/backdrop-placeholder.jpg';
    }
    return this.movie.backdrop_url;
  }
  
  getPosterUrl(): string {
    if (!this.movie || !this.movie.poster_url) {
      return 'assets/images/poster-placeholder.jpg';
    }
    return this.movie.poster_url;
  }
}