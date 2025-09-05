import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, Profile, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  private currentProfileSubject: BehaviorSubject<Profile | null>;
  private profilesSubject: BehaviorSubject<Profile[]>;
  
  public currentUser$: Observable<User | null>;
  public currentProfile$: Observable<Profile | null>;
  public profiles$: Observable<Profile[]>;
  
  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentProfileSubject = new BehaviorSubject<Profile | null>(this.getProfileFromStorage());
    this.profilesSubject = new BehaviorSubject<Profile[]>(this.getProfilesFromStorage() || []);
    
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.currentProfile$ = this.currentProfileSubject.asObservable();
    this.profiles$ = this.profilesSubject.asObservable();
  }
  
  // Get current user value
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  // Get current profile value
  public get currentProfileValue(): Profile | null {
    return this.currentProfileSubject.value;
  }
  
  // Get profiles value
  public get profilesValue(): Profile[] {
    return this.profilesSubject.value;
  }
  
  // Register new user
  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password })
      .pipe(
        tap(response => {
          if (!response.error && response.data) {
            this.setAuthData(response.data);
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  // Login user
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (!response.error && response.data) {
            this.setAuthData(response.data);
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  // Refresh token
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          if (!response.error && response.data) {
            localStorage.setItem('token', response.data.token);
          }
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }
  
  // Forgot password
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }
  
  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentProfile');
    localStorage.removeItem('profiles');
    this.currentUserSubject.next(null);
    this.currentProfileSubject.next(null);
    this.profilesSubject.next([]);
  }
  
  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserValue && !!localStorage.getItem('token');
  }
  
  // Check if user is admin
  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }
  
  // Set current profile
  setCurrentProfile(profile: Profile): void {
    localStorage.setItem('currentProfile', JSON.stringify(profile));
    this.currentProfileSubject.next(profile);
  }
  
  // Update profiles list
  updateProfiles(profiles: Profile[]): void {
    localStorage.setItem('profiles', JSON.stringify(profiles));
    this.profilesSubject.next(profiles);
    
    // If no current profile is set, set the first one
    if (!this.currentProfileValue && profiles.length > 0) {
      this.setCurrentProfile(profiles[0]);
    }
  }
  
  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  // Private helper methods
  private setAuthData(data: any): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    this.currentUserSubject.next(data.user);
    
    if (data.user.profiles && data.user.profiles.length > 0) {
      localStorage.setItem('profiles', JSON.stringify(data.user.profiles));
      this.profilesSubject.next(data.user.profiles);
      
      // Set first profile as current if none is set
      if (!this.currentProfileValue) {
        this.setCurrentProfile(data.user.profiles[0]);
      }
    }
  }
  
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
  
  private getProfileFromStorage(): Profile | null {
    const profileJson = localStorage.getItem('currentProfile');
    return profileJson ? JSON.parse(profileJson) : null;
  }
  
  private getProfilesFromStorage(): Profile[] | null {
    const profilesJson = localStorage.getItem('profiles');
    return profilesJson ? JSON.parse(profilesJson) : null;
  }
}