import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { Movie } from '../../models/movie.model';
import { Profile } from '../../models/user.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  movies: Movie[] = [];
  totalMovies: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  
  isLoading: boolean = false;
  error: string | null = null;
  
  currentProfile: Profile | null = null;
  
  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Get current profile
    this.authService.currentProfile$.subscribe(profile => {
      this.currentProfile = profile;
    });
    
    // Get query params
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.currentPage = params['page'] ? parseInt(params['page']) : 1;
      
      if (this.searchQuery) {
        this.searchMovies();
      }
    });
  }
  
  searchMovies(): void {
    if (!this.searchQuery.trim()) {
      this.movies = [];
      this.totalMovies = 0;
      return;
    }
    
    this.isLoading = true;
    
    this.movieService.getMovies(
      this.currentPage,
      this.itemsPerPage,
      undefined,
      undefined,
      undefined,
      undefined,
      'release_year',
      'desc',
      this.searchQuery
    ).subscribe(
      response => {
        this.movies = response.data.movies;
        this.totalMovies = response.data.pagination.total;
        this.isLoading = false;
        
        // Record search analytics
        if (this.currentProfile) {
          this.analyticsService.recordSearch(
            this.currentProfile.id,
            this.searchQuery
          ).subscribe();
        }
      },
      error => {
        console.error('Error searching movies:', error);
        this.error = 'Erro ao buscar filmes. Por favor, tente novamente mais tarde.';
        this.isLoading = false;
      }
    );
  }
  
  onSearch(): void {
    if (!this.searchQuery.trim()) {
      return;
    }
    
    this.currentPage = 1;
    this.updateQueryParams();
    this.searchMovies();
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateQueryParams();
    this.searchMovies();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery,
        page: this.currentPage
      },
      queryParamsHandling: 'merge'
    });
  }
}