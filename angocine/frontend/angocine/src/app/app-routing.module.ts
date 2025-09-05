import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { MovieDetailsComponent } from './pages/movie-details/movie-details.component';
import { WatchComponent } from './pages/watch/watch.component';
import { SearchComponent } from './pages/search/search.component';
import { ProfileComponent } from './pages/profile/profile.component';

// Auth Pages
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';

// Admin Pages
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { AdminUsersComponent } from './pages/admin/users/users.component';
import { AdminMoviesComponent } from './pages/admin/movies/movies.component';
import { AdminReviewsComponent } from './pages/admin/reviews/reviews.component';
import { AdminAnalyticsComponent } from './pages/admin/analytics/analytics.component';

const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'browse', component: BrowseComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: 'search', component: SearchComponent },
  
  // Auth routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  
  // Protected routes
  { 
    path: 'watch/:id', 
    component: WatchComponent, 
    canActivate: [AuthGuard],
    data: { requiresProfile: true }
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard]
  },
  
  // Admin routes
  { 
    path: 'admin', 
    canActivate: [AuthGuard],
    data: { requiresAdmin: true },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'movies', component: AdminMoviesComponent },
      { path: 'reviews', component: AdminReviewsComponent },
      { path: 'analytics', component: AdminAnalyticsComponent }
    ]
  },
  
  // Fallback route
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }