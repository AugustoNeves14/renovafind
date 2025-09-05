import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { User, Profile } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMenuCollapsed = true;
  searchControl = new FormControl('');
  searchResults: Movie[] = [];
  isSearching = false;
  showSearchResults = false;
  currentUser: User | null = null;
  currentProfile: Profile | null = null;
  isDarkMode = false;
  
  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSearchResults = false;
    }
  }
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private movieService: MovieService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to auth service to get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Subscribe to auth service to get current profile
    this.authService.currentProfile$.subscribe(profile => {
      this.currentProfile = profile;
    });
    
    // Subscribe to theme service to get dark mode state
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    
    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(value => !!value && value.length >= 2),
      tap(() => {
        this.isSearching = true;
        this.showSearchResults = true;
      }),
      switchMap(value => {
        if (value && value.length >= 2) {
          return this.movieService.searchMovies(value);
        }
        return of({ error: false, data: { movies: [] } });
      })
    ).subscribe(response => {
      this.searchResults = response.data.movies;
      this.isSearching = false;
    });
  }
  
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  
  onSearch(event: Event): void {
    event.preventDefault();
    const searchTerm = this.searchControl.value;
    if (searchTerm && searchTerm.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: searchTerm } });
      this.searchControl.setValue('');
      this.showSearchResults = false;
    }
  }
  
  selectSearchResult(movie: Movie): void {
    this.router.navigate(['/movie', movie.id]);
    this.searchControl.setValue('');
    this.showSearchResults = false;
  }
  
  switchProfile(profile: Profile): void {
    this.authService.setCurrentProfile(profile);
  }
}