import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private darkModeSubject: BehaviorSubject<boolean>;
  public darkMode$: Observable<boolean>;
  
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.darkModeSubject = new BehaviorSubject<boolean>(this.getInitialDarkModeState());
    this.darkMode$ = this.darkModeSubject.asObservable();
    
    // Apply initial theme
    this.applyTheme(this.darkModeSubject.value);
    
    // Listen for system preference changes
    this.listenForSystemPreferenceChanges();
  }
  
  // Toggle dark mode
  toggleDarkMode(): void {
    const newState = !this.darkModeSubject.value;
    this.setDarkMode(newState);
  }
  
  // Set dark mode state
  setDarkMode(isDarkMode: boolean): void {
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
    this.darkModeSubject.next(isDarkMode);
    this.applyTheme(isDarkMode);
  }
  
  // Get current dark mode state
  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
  
  // Private helper methods
  private getInitialDarkModeState(): boolean {
    // Check local storage first
    const storedPreference = localStorage.getItem('darkMode');
    if (storedPreference !== null) {
      return storedPreference === 'true';
    }
    
    // Otherwise use system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  private applyTheme(isDarkMode: boolean): void {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
      this.renderer.setAttribute(document.documentElement, 'data-bs-theme', 'dark');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
      this.renderer.setAttribute(document.documentElement, 'data-bs-theme', 'light');
    }
  }
  
  private listenForSystemPreferenceChanges(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', (e) => {
          // Only update if user hasn't set a preference
          if (localStorage.getItem('darkMode') === null) {
            this.setDarkMode(e.matches);
          }
        });
      } 
      // Safari and older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener((e) => {
          // Only update if user hasn't set a preference
          if (localStorage.getItem('darkMode') === null) {
            this.setDarkMode(e.matches);
          }
        });
      }
    }
  }
}