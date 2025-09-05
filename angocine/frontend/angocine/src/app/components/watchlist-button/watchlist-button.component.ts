import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist-button',
  templateUrl: './watchlist-button.component.html',
  styleUrls: ['./watchlist-button.component.scss']
})
export class WatchlistButtonComponent implements OnInit {
  @Input() movieId!: number;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showText: boolean = true;
  @Input() variant: 'primary' | 'outline' | 'icon' = 'primary';
  
  @Output() added = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();
  
  isInWatchlist = false;
  isLoading = false;
  isLoggedIn = false;
  hasProfile = false;
  
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.checkWatchlistStatus();
    });
    
    this.authService.currentProfile$.subscribe(profile => {
      this.hasProfile = !!profile;
      this.checkWatchlistStatus();
    });
  }
  
  checkWatchlistStatus(): void {
    if (!this.isLoggedIn || !this.hasProfile || !this.movieId) {
      return;
    }
    
    this.isLoading = true;
    
    this.userService.checkWatchlist(this.movieId).subscribe(
      response => {
        this.isInWatchlist = response.data.in_watchlist;
        this.isLoading = false;
      },
      error => {
        console.error('Error checking watchlist status:', error);
        this.isLoading = false;
      }
    );
  }
  
  toggleWatchlist(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/movie/${this.movieId}` } });
      return;
    }
    
    if (!this.hasProfile) {
      this.router.navigate(['/profile']);
      return;
    }
    
    this.isLoading = true;
    
    if (this.isInWatchlist) {
      this.removeFromWatchlist();
    } else {
      this.addToWatchlist();
    }
  }
  
  addToWatchlist(): void {
    this.userService.addToWatchlist(this.movieId).subscribe(
      response => {
        this.isInWatchlist = true;
        this.isLoading = false;
        this.added.emit();
        
        // Record analytics event
        const currentProfile = this.authService.currentProfileValue;
        if (currentProfile) {
          this.analyticsService.recordWatchlistAdd(currentProfile.id, this.movieId).subscribe();
        }
      },
      error => {
        console.error('Error adding to watchlist:', error);
        this.isLoading = false;
      }
    );
  }
  
  removeFromWatchlist(): void {
    this.userService.removeFromWatchlist(this.movieId).subscribe(
      response => {
        this.isInWatchlist = false;
        this.isLoading = false;
        this.removed.emit();
        
        // Record analytics event
        const currentProfile = this.authService.currentProfileValue;
        if (currentProfile) {
          this.analyticsService.recordWatchlistRemove(currentProfile.id, this.movieId).subscribe();
        }
      },
      error => {
        console.error('Error removing from watchlist:', error);
        this.isLoading = false;
      }
    );
  }
  
  getButtonClasses(): string {
    let classes = 'watchlist-button';
    
    // Size
    classes += ` size-${this.size}`;
    
    // Variant
    classes += ` variant-${this.variant}`;
    
    // State
    if (this.isInWatchlist) {
      classes += ' active';
    }
    
    return classes;
  }
}