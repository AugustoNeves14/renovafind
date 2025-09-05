import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, MovieDetails, MoviesResponse, MovieDetailsResponse, Review } from '../models/movie.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = `${environment.apiUrl}/movies`;
  
  constructor(private http: HttpClient) { }
  
  // Get all movies with pagination and filtering
  getMovies(
    page: number = 1, 
    limit: number = 20, 
    genre?: string, 
    year?: number, 
    language?: string, 
    rating?: number, 
    sort: string = 'release_year', 
    order: string = 'desc',
    search?: string
  ): Observable<MoviesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);
    
    if (genre) params = params.set('genre', genre);
    if (year) params = params.set('year', year.toString());
    if (language) params = params.set('language', language);
    if (rating) params = params.set('rating', rating.toString());
    if (search) params = params.set('search', search);
    
    return this.http.get<MoviesResponse>(this.apiUrl, { params });
  }
  
  // Get movie by ID
  getMovie(id: number): Observable<MovieDetailsResponse> {
    return this.http.get<MovieDetailsResponse>(`${this.apiUrl}/${id}`);
  }
  
  // Get movie genres (for filters)
  getGenres(): Observable<{ error: boolean, data: { genres: string[] } }> {
    return this.http.get<{ error: boolean, data: { genres: string[] } }>(`${this.apiUrl}/filters/genres`);
  }
  
  // Get movie languages (for filters)
  getLanguages(): Observable<{ error: boolean, data: { languages: string[] } }> {
    return this.http.get<{ error: boolean, data: { languages: string[] } }>(`${this.apiUrl}/filters/languages`);
  }
  
  // Get movie years (for filters)
  getYears(): Observable<{ error: boolean, data: { years: number[] } }> {
    return this.http.get<{ error: boolean, data: { years: number[] } }>(`${this.apiUrl}/filters/years`);
  }
  
  // Add review to movie
  addReview(movieId: number, rating: number, comment?: string): Observable<{ error: boolean, message: string }> {
    return this.http.post<{ error: boolean, message: string }>(
      `${this.apiUrl}/${movieId}/reviews`, 
      { rating, comment }
    );
  }
  
  // Search movies
  searchMovies(query: string, limit: number = 10): Observable<{ error: boolean, data: { movies: Movie[] } }> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());
    
    return this.http.get<{ error: boolean, data: { movies: Movie[] } }>(
      `${this.apiUrl}/search/query`, 
      { params }
    );
  }
  
  // Extract YouTube video ID from URL
  extractYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
  
  // Get YouTube thumbnail URL
  getYoutubeThumbnail(url: string): string {
    const videoId = this.extractYoutubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  }
  
  // Format movie duration
  formatDuration(minutes: number): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
  
  // Get movie genres as array
  getGenresArray(genreString?: string): string[] {
    if (!genreString) return [];
    return genreString.split(',').map(genre => genre.trim());
  }
}