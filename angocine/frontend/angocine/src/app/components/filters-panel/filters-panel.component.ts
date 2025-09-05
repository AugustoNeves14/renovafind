import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-filters-panel',
  templateUrl: './filters-panel.component.html',
  styleUrls: ['./filters-panel.component.scss']
})
export class FiltersPanelComponent implements OnInit {
  @Input() selectedGenre: string = '';
  @Input() selectedYear: number | null = null;
  @Input() selectedLanguage: string = '';
  @Input() selectedRating: number | null = null;
  @Input() selectedSort: string = 'release_year';
  @Input() selectedOrder: string = 'desc';
  
  @Output() filtersChanged = new EventEmitter<any>();
  
  genres: string[] = [];
  years: number[] = [];
  languages: string[] = [];
  ratings: number[] = [5, 6, 7, 8, 9];
  sortOptions = [
    { value: 'release_year', label: 'Ano de Lançamento' },
    { value: 'title', label: 'Título' },
    { value: 'rating', label: 'Avaliação' },
    { value: 'duration', label: 'Duração' }
  ];
  orderOptions = [
    { value: 'desc', label: 'Decrescente' },
    { value: 'asc', label: 'Crescente' }
  ];
  
  isLoading = true;
  isExpanded = false;
  
  constructor(private movieService: MovieService) {}
  
  ngOnInit(): void {
    this.loadFilters();
  }
  
  loadFilters(): void {
    // Load genres
    this.movieService.getGenres().subscribe(
      response => {
        this.genres = response.data.genres;
        this.isLoading = false;
      },
      error => {
        console.error('Error loading genres:', error);
        this.isLoading = false;
      }
    );
    
    // Load years
    this.movieService.getYears().subscribe(
      response => {
        this.years = response.data.years;
      },
      error => {
        console.error('Error loading years:', error);
      }
    );
    
    // Load languages
    this.movieService.getLanguages().subscribe(
      response => {
        this.languages = response.data.languages;
      },
      error => {
        console.error('Error loading languages:', error);
      }
    );
  }
  
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  selectGenre(genre: string): void {
    if (this.selectedGenre === genre) {
      this.selectedGenre = '';
    } else {
      this.selectedGenre = genre;
    }
    this.emitFilters();
  }
  
  selectYear(year: number): void {
    if (this.selectedYear === year) {
      this.selectedYear = null;
    } else {
      this.selectedYear = year;
    }
    this.emitFilters();
  }
  
  selectLanguage(language: string): void {
    if (this.selectedLanguage === language) {
      this.selectedLanguage = '';
    } else {
      this.selectedLanguage = language;
    }
    this.emitFilters();
  }
  
  selectRating(rating: number): void {
    if (this.selectedRating === rating) {
      this.selectedRating = null;
    } else {
      this.selectedRating = rating;
    }
    this.emitFilters();
  }
  
  selectSort(sort: string): void {
    this.selectedSort = sort;
    this.emitFilters();
  }
  
  selectOrder(order: string): void {
    this.selectedOrder = order;
    this.emitFilters();
  }
  
  clearFilters(): void {
    this.selectedGenre = '';
    this.selectedYear = null;
    this.selectedLanguage = '';
    this.selectedRating = null;
    this.selectedSort = 'release_year';
    this.selectedOrder = 'desc';
    this.emitFilters();
  }
  
  emitFilters(): void {
    this.filtersChanged.emit({
      genre: this.selectedGenre,
      year: this.selectedYear,
      language: this.selectedLanguage,
      rating: this.selectedRating,
      sort: this.selectedSort,
      order: this.selectedOrder
    });
  }
  
  hasActiveFilters(): boolean {
    return !!(this.selectedGenre || this.selectedYear || this.selectedLanguage || this.selectedRating);
  }
}