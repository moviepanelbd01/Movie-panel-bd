export type UserRole = 'user' | 'creator' | 'moderator' | 'admin';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  createdAt: string;
  isBlocked?: boolean;
  subscribersCount: number;
  subscribedCreators: string[]; // Creator IDs
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  poster: string;
  thumbnail?: string;
  backdrop?: string;
  videoUrl: string;
  trailerUrl?: string;
  genre: string[];
  language: string; // 'Bengali' | 'Hindi' | 'English' | 'Tamil' | 'Telugu' | 'Korean' | etc.
  releaseYear: number;
  quality: '480p' | '720p' | '1080p' | '4K';
  duration: string; // e.g. "2h 15m" or "45m"
  durationSeconds?: number;
  cast: string[];
  director: string;
  tags: string[];
  views: number;
  likes: number;
  dislikes: number;
  rating: number; // 0 to 10 scale (e.g. 8.7)
  ratingCount: number;
  uploadedBy: string; // User ID
  uploaderName: string;
  uploaderAvatar?: string;
  isPublished: boolean;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
  isTrending?: boolean;
  category: string; // 'Movies' | 'Web Series' | 'TV Shows' | 'Animated'
  createdAt: string;
}

export interface Comment {
  id: string;
  movieId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[]; // user IDs
}

export interface Playlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  movieIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  movieId: string;
  progressSeconds: number;
  durationSeconds: number;
  lastWatchedAt: string;
}

export interface WatchLaterItem {
  id: string;
  userId: string;
  movieId: string;
  addedAt: string;
}

export interface UserVote {
  userId: string;
  movieId: string;
  vote: 'like' | 'dislike';
}

export interface UserRating {
  userId: string;
  movieId: string;
  rating: number; // 1-10
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export interface CopyrightReport {
  id: string;
  movieId: string;
  movieTitle: string;
  reporterName: string;
  reporterEmail: string;
  rightsOwner: string;
  reason: string;
  details: string;
  proofUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  createdAt: string;
}

export interface AdminActivityLog {
  id: string;
  adminUsername: string;
  action: string;
  target: string;
  timestamp: string;
  details?: string;
}

export interface WebsiteSettings {
  siteName: string;
  siteTagline: string;
  announcement: string;
  showAnnouncement: boolean;
  bannerAdEnabled: boolean;
  bannerAdText: string;
  bannerAdLink: string;
  featuredMovieId: string;
  allowPublicRegistration: boolean;
  requireAdminApprovalForUploads: boolean;
  adminKey?: string;
  moderatorKey?: string;
}
