import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  
  constructor(private http: HttpClient) { }
  
  // Get dashboard stats
  getDashboardStats(): Observable<{ 
    error: boolean, 
    data: { 
      stats: { 
        total_users: number, 
        total_movies: number, 
        total_profiles: number, 
        total_reviews: number, 
        total_events: number 
      }, 
      recent_users: any[], 
      top_rated_movies: any[], 
      recent_reviews: any[] 
    } 
  }> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }
  
  // Get all users (with pagination)
  getUsers(page: number = 1, limit: number = 20, search?: string): Observable<{ 
    error: boolean, 
    data: { 
      users: any[], 
      pagination: { 
        total: number, 
        page: number, 
        limit: number, 
        pages: number 
      } 
    } 
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) params = params.set('search', search);
    
    return this.http.get<any>(`${this.apiUrl}/users`, { params });
  }
  
  // Get user details
  getUserDetails(userId: number): Observable<{ 
    error: boolean, 
    data: { 
      user: any, 
      profiles: any[], 
      reviews: any[], 
      stats: { 
        profile_count: number, 
        review_count: number, 
        watchlist_count: number 
      } 
    } 
  }> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
  }
  
  // Update user role
  updateUserRole(userId: number, role: string): Observable<{ error: boolean, message: string }> {
    return this.http.put<{ error: boolean, message: string }>(`${this.apiUrl}/users/${userId}/role`, { role });
  }
  
  // Delete user
  deleteUser(userId: number): Observable<{ error: boolean, message: string }> {
    return this.http.delete<{ error: boolean, message: string }>(`${this.apiUrl}/users/${userId}`);
  }
  
  // Get all movies (with pagination)
  getMovies(page: number = 1, limit: number = 20, search?: string): Observable<{ 
    error: boolean, 
    data: { 
      movies: any[], 
      pagination: { 
        total: number, 
        page: number, 
        limit: number, 
        pages: number 
      } 
    } 
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) params = params.set('search', search);
    
    return this.http.get<any>(`${this.apiUrl}/movies`, { params });
  }
  
  // Get movie details
  getMovieDetails(movieId: number): Observable<{ 
    error: boolean, 
    data: { 
      movie: Movie, 
      stats: { 
        review_count: number, 
        watchlist_count: number, 
        history_count: number 
      } 
    } 
  }> {
    return this.http.get<any>(`${this.apiUrl}/movies/${movieId}`);
  }
  
  // Create movie
  createMovie(movieData: any): Observable<{ error: boolean, message: string, data: { movie: Movie } }> {
    return this.http.post<any>(`${this.apiUrl}/movies`, movieData);
  }
  
  // Update movie
  updateMovie(movieId: number, movieData: any): Observable<{ error: boolean, message: string, data: { movie: Movie } }> {
    return this.http.put<any>(`${this.apiUrl}/movies/${movieId}`, movieData);
  }
  
  // Delete movie
  deleteMovie(movieId: number): Observable<{ error: boolean, message: string }> {
    return this.http.delete<{ error: boolean, message: string }>(`${this.apiUrl}/movies/${movieId}`);
  }
  
  // Get all reviews (with pagination)
  getReviews(page: number = 1, limit: number = 20): Observable<{ 
    error: boolean, 
    data: { 
      reviews: any[], 
      pagination: { 
        total: number, 
        page: number, 
        limit: number, 
        pages: number 
      } 
    } 
  }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<any>(`${this.apiUrl}/reviews`, { params });
  }
  
  // Delete review
  deleteReview(reviewId: number): Observable<{ error: boolean, message: string }> {
    return this.http.delete<{ error: boolean, message: string }>(`${this.apiUrl}/reviews/${reviewId}`);
  }
  
  // Get analytics data
  getAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'week'): Observable<{ 
    error: boolean, 
    data: { 
      event_counts: any[], 
      top_movies: any[], 
      user_registrations: any[], 
      completion_rate: number 
    } 
  }> {
    const params = new HttpParams().set('period', period);
    
    return this.http.get<any>(`${this.apiUrl}/analytics`, { params });
  }
}