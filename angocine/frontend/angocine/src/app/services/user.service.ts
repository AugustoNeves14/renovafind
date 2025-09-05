import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/user.model';
import { WatchHistoryItem, WatchlistItem } from '../models/movie.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;
  
  constructor(private http: HttpClient) { }
  
  // Get user profile
  getProfile(): Observable<{ 
    error: boolean, 
    data: { 
      user: any, 
      profiles: Profile[], 
      stats: { 
        watchlist_count: number, 
        history_count: number 
      } 
    } 
  }> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }
  
  // Update user profile
  updateProfile(data: { 
    username?: string, 
    email?: string, 
    current_password?: string, 
    new_password?: string 
  }): Observable<{ error: boolean, message: string }> {
    return this.http.put<{ error: boolean, message: string }>(`${this.apiUrl}/profile`, data);
  }
  
  // Get user profiles
  getProfiles(): Observable<{ error: boolean, data: { profiles: Profile[] } }> {
    return this.http.get<{ error: boolean, data: { profiles: Profile[] } }>(`${this.apiUrl}/profiles`);
  }
  
  // Create new profile
  createProfile(name: string, avatar?: string, is_kid?: boolean): Observable<{ 
    error: boolean, 
    message: string, 
    data: { profile: Profile } 
  }> {
    return this.http.post<any>(`${this.apiUrl}/profiles`, { name, avatar, is_kid });
  }
  
  // Update profile
  updateProfile(profileId: number, data: { 
    name?: string, 
    avatar?: string, 
    is_kid?: boolean 
  }): Observable<{ error: boolean, message: string, data: { profile: Profile } }> {
    return this.http.put<any>(`${this.apiUrl}/profiles/${profileId}`, data);
  }
  
  // Delete profile
  deleteProfile(profileId: number): Observable<{ error: boolean, message: string }> {
    return this.http.delete<{ error: boolean, message: string }>(`${this.apiUrl}/profiles/${profileId}`);
  }
  
  // Get user watchlist
  getWatchlist(page: number = 1, limit: number = 20): Observable<{ 
    error: boolean, 
    data: { 
      watchlist: WatchlistItem[], 
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
    
    return this.http.get<any>(`${this.apiUrl}/watchlist`, { params });
  }
  
  // Add movie to watchlist
  addToWatchlist(movieId: number): Observable<{ error: boolean, message: string }> {
    return this.http.post<{ error: boolean, message: string }>(`${this.apiUrl}/watchlist/${movieId}`, {});
  }
  
  // Remove movie from watchlist
  removeFromWatchlist(movieId: number): Observable<{ error: boolean, message: string }> {
    return this.http.delete<{ error: boolean, message: string }>(`${this.apiUrl}/watchlist/${movieId}`);
  }
  
  // Check if movie is in watchlist
  checkWatchlist(movieId: number): Observable<{ error: boolean, data: { in_watchlist: boolean } }> {
    return this.http.get<{ error: boolean, data: { in_watchlist: boolean } }>(`${this.apiUrl}/watchlist/check/${movieId}`);
  }
  
  // Get watch history for a profile
  getWatchHistory(profileId: number, page: number = 1, limit: number = 20): Observable<{ 
    error: boolean, 
    data: { 
      history: WatchHistoryItem[], 
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
    
    return this.http.get<any>(`${this.apiUrl}/history/${profileId}`, { params });
  }
  
  // Update watch history
  updateWatchHistory(profileId: number, movieId: number, watchTime: number, completed: boolean): Observable<{ 
    error: boolean, 
    message: string 
  }> {
    return this.http.post<{ error: boolean, message: string }>(
      `${this.apiUrl}/history/${profileId}/${movieId}`, 
      { watch_time: watchTime, completed }
    );
  }
  
  // Get recommendations for a profile
  getRecommendations(profileId: number, limit: number = 10): Observable<{ 
    error: boolean, 
    data: { 
      recommendations: any[], 
      based_on: string 
    } 
  }> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<any>(`${this.apiUrl}/recommendations/${profileId}`, { params });
  }
}