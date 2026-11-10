import { Movie, User, Comment, Playlist, WatchHistoryItem, WatchLaterItem, Category, WebsiteSettings, CopyrightReport, AdminActivityLog } from '../types/index.ts';

const TOKEN_KEY = 'mpbd_token';
const USER_KEY = 'mpbd_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errorMsg = `Request failed: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.error) errorMsg = errData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const data = await fetchJson<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async register(payload: { username: string; password: string; email?: string; avatar?: string; bio?: string }): Promise<{ user: User; token: string }> {
    const data = await fetchJson<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async me(): Promise<{ user: User }> {
    const data = await fetchJson<{ user: User }>('/api/auth/me');
    setStoredUser(data.user);
    return data;
  },

  logout(): void {
    setStoredToken(null);
    setStoredUser(null);
  },

  async updateProfile(payload: { email?: string; avatar?: string; bio?: string }): Promise<{ user: User }> {
    const data = await fetchJson<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setStoredUser(data.user);
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Upload files
  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson<{ url: string; filename: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Movies
  async getMovies(params: {
    category?: string;
    language?: string;
    genre?: string;
    search?: string;
    uploaderId?: string;
    includePending?: boolean;
  } = {}): Promise<{ movies: Movie[] }> {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.language) query.set('language', params.language);
    if (params.genre) query.set('genre', params.genre);
    if (params.search) query.set('search', params.search);
    if (params.uploaderId) query.set('uploaderId', params.uploaderId);
    if (params.includePending) query.set('includePending', 'true');

    return fetchJson<{ movies: Movie[] }>(`/api/movies?${query.toString()}`);
  },

  async getMovieById(id: string): Promise<{
    movie: Movie;
    userVote: 'like' | 'dislike' | null;
    isWatchLater: boolean;
    isSubscribedToUploader: boolean;
  }> {
    return fetchJson(`/api/movies/${id}`);
  },

  async createMovie(data: Partial<Movie> & { isDraft?: boolean }): Promise<{ movie: Movie }> {
    return fetchJson('/api/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMovie(id: string, data: Partial<Movie>): Promise<{ movie: Movie }> {
    return fetchJson(`/api/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMovie(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/movies/${id}`, {
      method: 'DELETE',
    });
  },

  async recordView(id: string): Promise<{ views: number }> {
    return fetchJson(`/api/movies/${id}/view`, {
      method: 'POST',
    });
  },

  async voteMovie(id: string, voteType: 'like' | 'dislike'): Promise<{
    likes: number;
    dislikes: number;
    userVote: 'like' | 'dislike' | null;
  }> {
    return fetchJson(`/api/movies/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  },

  // Comments
  async getComments(movieId: string): Promise<{ comments: Comment[] }> {
    return fetchJson(`/api/movies/${movieId}/comments`);
  },

  async postComment(movieId: string, content: string): Promise<{ comment: Comment }> {
    return fetchJson(`/api/movies/${movieId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async deleteComment(commentId: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  async likeComment(commentId: string): Promise<{ comment: Comment }> {
    return fetchJson(`/api/comments/${commentId}/like`, {
      method: 'POST',
    });
  },

  // User History & Watch Later
  async getHistory(): Promise<{ history: (WatchHistoryItem & { movie?: Movie })[] }> {
    return fetchJson('/api/user/history');
  },

  async recordHistoryProgress(movieId: string, progressSeconds: number, durationSeconds: number): Promise<{ success: boolean }> {
    return fetchJson('/api/user/history', {
      method: 'POST',
      body: JSON.stringify({ movieId, progressSeconds, durationSeconds }),
    });
  },

  async clearHistory(): Promise<{ success: boolean }> {
    return fetchJson('/api/user/history', {
      method: 'DELETE',
    });
  },

  async getWatchLater(): Promise<{ watchLater: (WatchLaterItem & { movie?: Movie })[] }> {
    return fetchJson('/api/user/watch-later');
  },

  async toggleWatchLater(movieId: string): Promise<{ isAdded: boolean }> {
    return fetchJson('/api/user/watch-later', {
      method: 'POST',
      body: JSON.stringify({ movieId }),
    });
  },

  // Playlists
  async getPlaylists(): Promise<{ playlists: Playlist[] }> {
    return fetchJson('/api/user/playlists');
  },

  async createPlaylist(title: string, description?: string, isPublic = true): Promise<{ playlist: Playlist }> {
    return fetchJson('/api/user/playlists', {
      method: 'POST',
      body: JSON.stringify({ title, description, isPublic }),
    });
  },

  async addMovieToPlaylist(playlistId: string, movieId: string): Promise<{ playlist: Playlist }> {
    return fetchJson(`/api/user/playlists/${playlistId}/movies`, {
      method: 'POST',
      body: JSON.stringify({ movieId }),
    });
  },

  async removeMovieFromPlaylist(playlistId: string, movieId: string): Promise<{ playlist: Playlist }> {
    return fetchJson(`/api/user/playlists/${playlistId}/movies/${movieId}`, {
      method: 'DELETE',
    });
  },

  async deletePlaylist(playlistId: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/user/playlists/${playlistId}`, {
      method: 'DELETE',
    });
  },

  // Creator Subscriptions
  async toggleSubscription(creatorId: string): Promise<{ isSubscribed: boolean; subscribersCount: number }> {
    return fetchJson(`/api/user/subscribe/${creatorId}`, {
      method: 'POST',
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: any[] }> {
    return fetchJson('/api/user/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/user/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  // Admin
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalMovies: number;
    totalViews: number;
    pendingApprovals: number;
    publishedMovies: number;
    pendingReports: number;
    storageUsage: string;
  }> {
    return fetchJson('/api/admin/stats');
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return fetchJson('/api/admin/users');
  },

  async updateAdminUser(id: string, updates: { role?: string; isBlocked?: boolean }): Promise<{ user: User }> {
    return fetchJson(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteAdminUser(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async updateMovieStatus(
    id: string,
    updates: { status?: 'pending' | 'approved' | 'rejected'; isPublished?: boolean; isFeatured?: boolean }
  ): Promise<{ movie: Movie }> {
    return fetchJson(`/api/admin/movies/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getCategories(): Promise<{ categories: Category[] }> {
    return fetchJson('/api/admin/categories');
  },

  async saveCategories(categories: Category[]): Promise<{ categories: Category[] }> {
    return fetchJson('/api/admin/categories', {
      method: 'PUT',
      body: JSON.stringify({ categories }),
    });
  },

  async getSettings(): Promise<{ settings: WebsiteSettings }> {
    return fetchJson('/api/settings');
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<{ settings: WebsiteSettings }> {
    return fetchJson('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async getAdminLogs(): Promise<{ logs: AdminActivityLog[] }> {
    return fetchJson('/api/admin/logs');
  },

  // Reports
  async submitReport(payload: {
    movieId: string;
    movieTitle: string;
    reporterName: string;
    reporterEmail: string;
    rightsOwner: string;
    reason: string;
    details: string;
    proofUrl?: string;
  }): Promise<{ report: CopyrightReport; message: string }> {
    return fetchJson('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAdminReports(): Promise<{ reports: CopyrightReport[] }> {
    return fetchJson('/api/admin/reports');
  },

  async updateReportStatus(id: string, status: CopyrightReport['status']): Promise<{ report: CopyrightReport }> {
    return fetchJson(`/api/admin/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Passkey verification for Admin / Moderator
  async verifyPasskey(passkey: string, panelType: 'admin' | 'moderator' = 'admin'): Promise<{
    success: boolean;
    role: 'admin' | 'moderator';
    token: string;
    user: User;
  }> {
    const res = await fetchJson<{
      success: boolean;
      role: 'admin' | 'moderator';
      token: string;
      user: User;
    }>('/api/admin/verify-passkey', {
      method: 'POST',
      body: JSON.stringify({ passkey, panelType }),
    });
    if (res.token && res.user) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async updatePasskeys(data: { adminKey?: string; moderatorKey?: string }): Promise<{
    success: boolean;
    message: string;
    adminKey: string;
    moderatorKey: string;
  }> {
    return fetchJson('/api/admin/passkeys', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
