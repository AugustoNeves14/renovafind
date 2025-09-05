import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Movie } from '../../models/movie.model';
import { Profile } from '../../models/user.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss']
})
export class WatchComponent implements OnInit, OnDestroy {
  movie: Movie | null = null;
  currentProfile: Profile | null = null;
  
  isLoading = true;
  error: string | null = null;
  
  watchTime = 0;
  isCompleted = false;
  progressUpdateInterval: Subscription | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private userService: UserService,
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) {}
  
  ngOnInit(): void {
    // Check if user is logged in and has a profile
    this.authService.currentProfile$.subscribe(profile => {
      this.currentProfile = profile;
      
      if (!profile) {
        this.router.navigate(['/profile']);
        return;
      }
      
      // Load movie
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.loadMovie(parseInt(id));
        } else {
          this.router.navigate(['/']);
        }
      });
    });
    
    // Set up progress update interval (every 30 seconds)
    this.progressUpdateInterval = interval(30000).subscribe(() => {
      this.updateWatchProgress();
    });
  }
  
  ngOnDestroy(): void {
    // Save progress when leaving the page
    this.updateWatchProgress();
    
    // Clear interval
    if (this.progressUpdateInterval) {
      this.progressUpdateInterval.unsubscribe();
    }
  }
  
  loadMovie(id: number): void {
    this.isLoading = true;
    
    this.movieService.getMovie(id).subscribe(
      response => {
        this.movie = response.data.movie;
        this.isLoading = false;
        
        // Record analytics event
        if (this.currentProfile) {
          this.analyticsService.recordMovieStart(this.currentProfile.id, this.movie.id).subscribe();
        }
      },
      error => {
        console.error('Error loading movie:', error);
        this.error = 'Erro ao carregar o filme. Por favor, tente novamente mais tarde.';
        this.isLoading = false;
      }
    );
  }
  
  onTimeUpdate(time: number): void {
    this.watchTime = Math.floor(time);
  }
  
  onVideoEnded(): void {
    this.isCompleted = true;
    this.updateWatchProgress(true);
    
    // Record analytics event
    if (this.currentProfile && this.movie) {
      this.analyticsService.recordMovieCompleted(this.currentProfile.id, this.movie.id).subscribe();
    }
  }
  
  onVideoStarted(): void {
    // Record analytics event
    if (this.currentProfile && this.movie) {
      this.analyticsService.recordMovieProgress(this.currentProfile.id, this.movie.id, this.watchTime).subscribe();
    }
  }
  
  updateWatchProgress(completed: boolean = false): void {
    if (!this.currentProfile || !this.movie || this.watchTime === 0) {
      return;
    }
    
    this.userService.updateWatchHistory(
      this.currentProfile.id,
      this.movie.id,
      this.watchTime,
      completed || this.isCompleted
    ).subscribe(
      () => {
        console.log('Watch progress updated');
      },
      error => {
        console.error('Error updating watch progress:', error);
      }
    );
  }
  
  goBack(): void {
    this.router.navigate(['/movie', this.movie?.id || '']);
  }
  
  getVideoUrl(): string {
    return this.movie?.video_url || '';
  }
  
  getPosterUrl(): string {
    return this.movie?.poster_url || '';
  }
}