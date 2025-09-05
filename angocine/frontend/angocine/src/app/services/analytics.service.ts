import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;
  
  constructor(private http: HttpClient) { }
  
  // Record analytics event
  recordEvent(profileId: number, eventType: string, movieId?: number, eventData?: any): Observable<{ 
    error: boolean, 
    message: string 
  }> {
    return this.http.post<{ error: boolean, message: string }>(
      `${this.apiUrl}/event`, 
      { profile_id: profileId, movie_id: movieId, event_type: eventType, event_data: eventData }
    );
  }
  
  // Get user activity for a profile
  getUserActivity(profileId: number): Observable<{ 
    error: boolean, 
    data: { 
      activity: {
        id: number,
        description: string,
        event_type: string,
        movie: {
          id: number,
          title: string,
          poster_url: string
        } | null,
        created_at: string
      }[] 
    } 
  }> {
    return this.http.get<any>(`${this.apiUrl}/activity/${profileId}`);
  }
  
  // Get watch time statistics for a profile
  getWatchTimeStats(profileId: number): Observable<{ 
    error: boolean, 
    data: { 
      total_watch_time: {
        seconds: number,
        hours: number,
        minutes: number,
        formatted: string
      },
      watch_time_by_genre: {
        genre: string,
        total_seconds: number,
        hours: number,
        percentage: number
      }[]
    } 
  }> {
    return this.http.get<any>(`${this.apiUrl}/watch-time/${profileId}`);
  }
  
  // Record movie start event
  recordMovieStart(profileId: number, movieId: number): Observable<{ error: boolean, message: string }> {
    return this.recordEvent(profileId, 'movie_started', movieId);
  }
  
  // Record movie progress event
  recordMovieProgress(profileId: number, movieId: number, watchTime: number): Observable<{ error: boolean, message: string }> {
    return this.recordEvent(profileId, 'movie_progress', movieId, { watch_time: watchTime });
  }
  
  // Record movie completed event
  recordMovieCompleted(profileId: number, movieId: number): Observable<{ error: boolean, message: string }> {
    return this.recordEvent(profileId, 'movie_completed', movieId);
  }
  
  // Record movie rated event
  recordMovieRated(profileId: number, movieId: number, rating: number): Observable<{ error: boolean, message: string }> {
    return this.recordEvent(profileId, 'movie_rated', movieId, { rating });
  }
  
  // Record search event
  recordSearch(profileId: number, query: string): Observable<{ error: boolean, message: string }> {
    return this.recordEvent(profileId, 'search', undefined, { query });
  }
  
  // Record watchlist add event
  recordWatchlistAdd(profileId: number, movieId: number): Observable<{ error: boolean, message: string }> {
    return this.recordEvent(profileId, 'movie_added_to_watchlist', movieId);
  }
  
  // Record watchlist remove event
  recordWatchlistRemove(profileId: number, movieId: number): Observable<{ error: boolean, message: string }> {
    return this.recordEvent(profileId, 'movie_removed_from_watchlist', movieId);
  }
}