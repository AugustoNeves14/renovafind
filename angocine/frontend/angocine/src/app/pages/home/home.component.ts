import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredMovies: Movie[] = [];
  trendingMovies: Movie[] = [];
  actionMovies: Movie[] = [];
  dramaMovies: Movie[] = [];
  comedyMovies: Movie[] = [];
  scifiMovies: Movie[] = [];
  
  isLoading = true;
  error: string | null = null;
  
  constructor(private movieService: MovieService) {}
  
  ngOnInit(): void {
    this.loadMovies();
  }
  
  loadMovies(): void {
    // Load featured movies (highest rated)
    this.movieService.getMovies(1, 5, undefined, undefined, undefined, undefined, 'rating', 'desc')
      .subscribe(
        response => {
          this.featuredMovies = response.data.movies;
          this.isLoading = false;
        },
        error => {
          console.error('Error loading featured movies:', error);
          this.error = 'Erro ao carregar filmes em destaque.';
          this.isLoading = false;
        }
      );
    
    // Load trending movies (newest)
    this.movieService.getMovies(1, 10, undefined, undefined, undefined, undefined, 'release_year', 'desc')
      .subscribe(
        response => {
          this.trendingMovies = response.data.movies;
        },
        error => {
          console.error('Error loading trending movies:', error);
        }
      );
    
    // Load action movies
    this.movieService.getMovies(1, 10, 'Ação')
      .subscribe(
        response => {
          this.actionMovies = response.data.movies;
        },
        error => {
          console.error('Error loading action movies:', error);
        }
      );
    
    // Load drama movies
    this.movieService.getMovies(1, 10, 'Drama')
      .subscribe(
        response => {
          this.dramaMovies = response.data.movies;
        },
        error => {
          console.error('Error loading drama movies:', error);
        }
      );
    
    // Load comedy movies
    this.movieService.getMovies(1, 10, 'Comédia')
      .subscribe(
        response => {
          this.comedyMovies = response.data.movies;
        },
        error => {
          console.error('Error loading comedy movies:', error);
        }
      );
    
    // Load sci-fi movies
    this.movieService.getMovies(1, 10, 'Ficção Científica')
      .subscribe(
        response => {
          this.scifiMovies = response.data.movies;
        },
        error => {
          console.error('Error loading sci-fi movies:', error);
        }
      );
  }
}