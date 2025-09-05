import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  movies: Movie[] = [];
  totalMovies: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  
  selectedGenre: string = '';
  selectedYear: number | null = null;
  selectedLanguage: string = '';
  selectedRating: number | null = null;
  selectedSort: string = 'release_year';
  selectedOrder: string = 'desc';
  
  isLoading: boolean = true;
  error: string | null = null;
  
  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Get query params
    this.route.queryParams.subscribe(params => {
      this.currentPage = params['page'] ? parseInt(params['page']) : 1;
      this.selectedGenre = params['genre'] || '';
      this.selectedYear = params['year'] ? parseInt(params['year']) : null;
      this.selectedLanguage = params['language'] || '';
      this.selectedRating = params['rating'] ? parseInt(params['rating']) : null;
      this.selectedSort = params['sort'] || 'release_year';
      this.selectedOrder = params['order'] || 'desc';
      
      this.loadMovies();
    });
  }
  
  loadMovies(): void {
    this.isLoading = true;
    
    this.movieService.getMovies(
      this.currentPage,
      this.itemsPerPage,
      this.selectedGenre,
      this.selectedYear,
      this.selectedLanguage,
      this.selectedRating,
      this.selectedSort,
      this.selectedOrder
    ).subscribe(
      response => {
        this.movies = response.data.movies;
        this.totalMovies = response.data.pagination.total;
        this.isLoading = false;
      },
      error => {
        console.error('Error loading movies:', error);
        this.error = 'Erro ao carregar filmes. Por favor, tente novamente mais tarde.';
        this.isLoading = false;
      }
    );
  }
  
  onFiltersChanged(filters: any): void {
    // Update filters
    this.selectedGenre = filters.genre;
    this.selectedYear = filters.year;
    this.selectedLanguage = filters.language;
    this.selectedRating = filters.rating;
    this.selectedSort = filters.sort;
    this.selectedOrder = filters.order;
    
    // Reset to first page
    this.currentPage = 1;
    
    // Update URL with new filters
    this.updateQueryParams();
    
    // Load movies with new filters
    this.loadMovies();
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateQueryParams();
    this.loadMovies();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  updateQueryParams(): void {
    const queryParams: any = {
      page: this.currentPage
    };
    
    if (this.selectedGenre) {
      queryParams.genre = this.selectedGenre;
    }
    
    if (this.selectedYear) {
      queryParams.year = this.selectedYear;
    }
    
    if (this.selectedLanguage) {
      queryParams.language = this.selectedLanguage;
    }
    
    if (this.selectedRating) {
      queryParams.rating = this.selectedRating;
    }
    
    if (this.selectedSort !== 'release_year') {
      queryParams.sort = this.selectedSort;
    }
    
    if (this.selectedOrder !== 'desc') {
      queryParams.order = this.selectedOrder;
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}