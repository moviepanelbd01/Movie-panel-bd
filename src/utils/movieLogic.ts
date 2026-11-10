import { Movie, User, Playlist } from '../types/index.ts';

/**
 * Pure helper logic for search, ranking, filtering, and authorization
 */

export interface FilterOptions {
  category?: string;
  genre?: string;
  language?: string;
  sortBy?: 'latest' | 'popular' | 'rating' | 'trending' | 'views';
  quality?: string;
}

export function searchMovies(
  movies: Movie[],
  query: string = '',
  filters: FilterOptions = {}
): Movie[] {
  const cleanQuery = query.trim().toLowerCase();

  return movies.filter((movie) => {
    // Basic status filter: only approved and published movies unless explicitly checked
    if (!movie.isPublished || movie.status !== 'approved') {
      return false;
    }

    // Text search query matching title, director, cast, tags, genre
    if (cleanQuery) {
      const matchTitle = movie.title.toLowerCase().includes(cleanQuery);
      const matchDirector = movie.director.toLowerCase().includes(cleanQuery);
      const matchCast = movie.cast.some((c) => c.toLowerCase().includes(cleanQuery));
      const matchTags = movie.tags.some((t) => t.toLowerCase().includes(cleanQuery));
      const matchGenre = movie.genre.some((g) => g.toLowerCase().includes(cleanQuery));
      const matchLanguage = movie.language.toLowerCase().includes(cleanQuery);

      if (!matchTitle && !matchDirector && !matchCast && !matchTags && !matchGenre && !matchLanguage) {
        return false;
      }
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      const catLower = filters.category.toLowerCase();
      if (catLower === 'movies' && movie.category !== 'Movies') return false;
      if (catLower === 'web series' && movie.category !== 'Web Series') return false;
      if (catLower === 'tv shows' && movie.category !== 'TV Shows') return false;
      if (catLower === 'animated' && movie.category !== 'Animated') return false;
    }

    // Language filter
    if (filters.language && filters.language !== 'all') {
      if (movie.language.toLowerCase() !== filters.language.toLowerCase()) {
        return false;
      }
    }

    // Genre filter
    if (filters.genre && filters.genre !== 'all') {
      const hasGenre = movie.genre.some(
        (g) => g.toLowerCase() === filters.genre!.toLowerCase()
      );
      if (!hasGenre) return false;
    }

    // Quality filter
    if (filters.quality && filters.quality !== 'all') {
      if (movie.quality.toLowerCase() !== filters.quality.toLowerCase()) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'latest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'views':
      case 'popular':
        return b.views - a.views;
      case 'trending':
      default:
        return calculateTrendingScore(b) - calculateTrendingScore(a);
    }
  });
}

/**
 * YouTube-style trending score weighting recency, views, and positive likes
 */
export function calculateTrendingScore(movie: Movie): number {
  const viewsWeight = movie.views * 1.0;
  const likesWeight = (movie.likes - movie.dislikes * 0.5) * 5.0;
  const ratingBonus = (movie.rating / 10) * 1000;
  const daysOld = Math.max(
    0.1,
    (Date.now() - new Date(movie.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  // Time-decay factor
  return (viewsWeight + likesWeight + ratingBonus) / Math.pow(daysOld + 1, 1.2);
}

/**
 * Content recommendation algorithm based on shared genre, language, or director
 */
export function getRecommendedMovies(
  allMovies: Movie[],
  currentMovie: Movie,
  limit: number = 8
): Movie[] {
  return allMovies
    .filter(
      (m) =>
        m.id !== currentMovie.id &&
        m.isPublished &&
        m.status === 'approved'
    )
    .map((candidate) => {
      let score = 0;
      // Match language (high weight for regional cinema)
      if (candidate.language === currentMovie.language) score += 30;
      // Match category (Web series vs Movie)
      if (candidate.category === currentMovie.category) score += 20;
      // Match genres
      const commonGenres = candidate.genre.filter((g) =>
        currentMovie.genre.includes(g)
      );
      score += commonGenres.length * 15;
      // Match director
      if (
        candidate.director &&
        candidate.director.toLowerCase() === currentMovie.director.toLowerCase()
      ) {
        score += 25;
      }
      return { movie: candidate, score };
    })
    .sort((a, b) => b.score - a.score || b.movie.views - a.movie.views)
    .slice(0, limit)
    .map((item) => item.movie);
}

/**
 * Format view count (e.g. 1.2M, 450K, 850)
 */
export function formatViews(views: number): string {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return views.toString();
}

/**
 * Format duration seconds into "HH:MM:SS" or "MM:SS"
 */
export function formatSecondsToTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Upload validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMovieUpload(data: {
  title?: string;
  description?: string;
  poster?: string;
  videoUrl?: string;
  genre?: string[];
  language?: string;
  releaseYear?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters.';
  }
  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  }
  if (!data.videoUrl || data.videoUrl.trim().length === 0) {
    errors.videoUrl = 'Video file or streaming URL is required.';
  }
  if (!data.language || data.language.trim().length === 0) {
    errors.language = 'Please select a language.';
  }
  if (!data.genre || data.genre.length === 0) {
    errors.genre = 'Select at least one genre.';
  }
  if (
    !data.releaseYear ||
    data.releaseYear < 1900 ||
    data.releaseYear > new Date().getFullYear() + 2
  ) {
    errors.releaseYear = 'Enter a valid release year.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Authorization checks
 */
export function canUserUpload(user: User | null): boolean {
  if (!user || user.isBlocked) return false;
  return user.role === 'admin' || user.role === 'creator' || user.role === 'moderator';
}

export function canUserManageMovie(user: User | null, movie: Movie): boolean {
  if (!user || user.isBlocked) return false;
  if (user.role === 'admin' || user.role === 'moderator') return true;
  return movie.uploadedBy === user.id;
}

/**
 * Playlist management
 */
export function addMovieToPlaylist(playlist: Playlist, movieId: string): Playlist {
  if (playlist.movieIds.includes(movieId)) {
    return playlist;
  }
  return {
    ...playlist,
    movieIds: [...playlist.movieIds, movieId],
    updatedAt: new Date().toISOString(),
  };
}

export function removeMovieFromPlaylist(playlist: Playlist, movieId: string): Playlist {
  return {
    ...playlist,
    movieIds: playlist.movieIds.filter((id) => id !== movieId),
    updatedAt: new Date().toISOString(),
  };
}
