export interface Movie {
  id: number;
  title: string;
  description?: string;
  release_year?: number;
  duration?: number;
  genre?: string;
  director?: string;
  cast?: string;
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  video_url?: string;
  rating?: number;
  language?: string;
  maturity_rating?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MovieDetails extends Movie {
  reviews?: Review[];
  ratings?: {
    average: number;
    total: number;
  };
  similar_movies?: Movie[];
}

export interface MoviesResponse {
  error: boolean;
  data: {
    movies: Movie[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface MovieDetailsResponse {
  error: boolean;
  data: {
    movie: Movie;
    reviews: Review[];
    ratings: {
      average: number;
      total: number;
    };
    similar_movies: Movie[];
  };
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  username?: string;
  user_id?: number;
  movie_id?: number;
  movie_title?: string;
}

export interface WatchHistoryItem {
  id: number;
  movie_id: number;
  watch_time: number;
  completed: boolean;
  last_watched: string;
  title: string;
  poster_url: string;
  backdrop_url: string;
  duration: number;
  release_year: number;
  progress: number;
}

export interface WatchlistItem {
  id: number;
  title: string;
  poster_url: string;
  backdrop_url: string;
  release_year: number;
  rating: number;
  genre: string;
  added_at: string;
}