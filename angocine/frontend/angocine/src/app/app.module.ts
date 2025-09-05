import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Bootstrap Modules
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { RatingModule } from 'ngx-bootstrap/rating';

// Components
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroCarouselComponent } from './components/hero-carousel/hero-carousel.component';
import { MovieCardComponent } from './components/movie-card/movie-card.component';
import { CategoryStripComponent } from './components/category-strip/category-strip.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { FiltersPanelComponent } from './components/filters-panel/filters-panel.component';
import { ModalComponent } from './components/modal/modal.component';
import { ProfileSwitcherComponent } from './components/profile-switcher/profile-switcher.component';
import { WatchlistButtonComponent } from './components/watchlist-button/watchlist-button.component';
import { RatingStarsComponent } from './components/rating-stars/rating-stars.component';
import { AdminTableComponent } from './components/admin-table/admin-table.component';

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

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HeroCarouselComponent,
    MovieCardComponent,
    CategoryStripComponent,
    VideoPlayerComponent,
    FiltersPanelComponent,
    ModalComponent,
    ProfileSwitcherComponent,
    WatchlistButtonComponent,
    RatingStarsComponent,
    AdminTableComponent,
    HomeComponent,
    BrowseComponent,
    MovieDetailsComponent,
    WatchComponent,
    SearchComponent,
    ProfileComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminMoviesComponent,
    AdminReviewsComponent,
    AdminAnalyticsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    RatingModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }