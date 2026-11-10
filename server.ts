import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db, hashPassword, verifyPassword } from './server/db.ts';
import { Movie, User, CopyrightReport } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for file uploads (posters, thumbnails, videos)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
});

// Simple session token generator and memory store
const userSessions = new Map<string, string>(); // token -> userId

function authenticateUser(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userId = userSessions.get(token);
    if (userId) {
      const user = db.findUserById(userId);
      if (user && !user.isBlocked) {
        (req as any).currentUser = user;
      }
    }
  }
  next();
}

app.use(authenticateUser);

// Require Auth Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).currentUser;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (user.isBlocked) {
    return res.status(403).json({ error: 'Your account has been suspended' });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).currentUser;
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return res.status(403).json({ error: 'Administrative privileges required' });
  }
  next();
}

/* ==========================================================================
   AUTHENTICATION ROUTES
   ========================================================================== */

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { username, password, email, avatar, bio } = req.body;
    const settings = db.getSettings();

    if (!settings.allowPublicRegistration) {
      return res.status(403).json({ error: 'Public registration is currently disabled by administrator.' });
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = db.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    if (email && db.findUserByEmail(email)) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const { hash, salt } = hashPassword(password);
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ];
    const userAvatar = avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newUser = db.createUser({
      id: 'u-' + Date.now(),
      username: username.trim(),
      email: email ? email.trim() : undefined,
      role: 'user',
      avatar: userAvatar,
      bio: bio || 'Movie lover on MOVIE PANEL BD.',
      createdAt: new Date().toISOString(),
      subscribersCount: 0,
      subscribedCreators: [],
      passwordHash: hash,
      salt,
    });

    const token = 'tok-' + crypto.randomBytes(24).toString('hex');
    userSessions.set(token, newUser.id);

    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return res.status(201).json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    let user = db.findUserByUsername(username);
    if (!user) {
      user = db.findUserByEmail(username);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = 'tok-' + crypto.randomBytes(24).toString('hex');
    userSessions.set(token, user.id);

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Current User Me
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).currentUser;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { passwordHash: _, salt: __, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// Update Profile
app.put('/api/auth/profile', requireAuth, (req: Request, res: Response) => {
  const currentUser = (req as any).currentUser;
  const { email, avatar, bio } = req.body;

  const updated = db.updateUser(currentUser.id, {
    email: email !== undefined ? email : currentUser.email,
    avatar: avatar !== undefined ? avatar : currentUser.avatar,
    bio: bio !== undefined ? bio : currentUser.bio,
  });

  if (!updated) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _, salt: __, ...safeUser } = updated;
  return res.json({ user: safeUser });
});

// Change Password
app.put('/api/auth/password', requireAuth, (req: Request, res: Response) => {
  const currentUser = (req as any).currentUser;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const user = db.findUserById(currentUser.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!verifyPassword(currentPassword, user.passwordHash, user.salt)) {
    return res.status(400).json({ error: 'Current password does not match.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  db.updateUser(user.id, { passwordHash: hash, salt });
  return res.json({ success: true, message: 'Password updated successfully' });
});

/* ==========================================================================
   FILE UPLOAD ROUTE
   ========================================================================== */

app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

/* ==========================================================================
   MOVIE ROUTES
   ========================================================================== */

// Get all movies
app.get('/api/movies', (req: Request, res: Response) => {
  const { category, language, genre, search, uploaderId, includePending } = req.query;
  let movies = db.getMovies();

  // If not explicitly requesting pending items (admin/creator own list), filter to published & approved
  const isIncludePending = includePending === 'true';
  const currentUser = (req as any).currentUser;

  if (!isIncludePending) {
    movies = movies.filter((m) => m.isPublished && m.status === 'approved');
  } else if (currentUser?.role !== 'admin' && currentUser?.role !== 'moderator') {
    // Non-admin can only see their own pending items
    movies = movies.filter(
      (m) => (m.isPublished && m.status === 'approved') || (currentUser && m.uploadedBy === currentUser.id)
    );
  }

  if (uploaderId) {
    movies = movies.filter((m) => m.uploadedBy === uploaderId);
  }

  if (category && category !== 'all') {
    movies = movies.filter((m) => m.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (language && language !== 'all') {
    movies = movies.filter((m) => m.language.toLowerCase() === (language as string).toLowerCase());
  }

  if (genre && genre !== 'all') {
    movies = movies.filter((m) => m.genre.some((g) => g.toLowerCase() === (genre as string).toLowerCase()));
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    movies = movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.cast.some((c) => c.toLowerCase().includes(q)) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        m.language.toLowerCase().includes(q)
    );
  }

  return res.json({ movies });
});

// Get single movie detail
app.get('/api/movies/:id', (req: Request, res: Response) => {
  const movie = db.getMovieById(req.params.id);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }

  const currentUser = (req as any).currentUser;
  let userVote: 'like' | 'dislike' | null = null;
  let isWatchLater = false;
  let isSubscribedToUploader = false;

  if (currentUser) {
    userVote = db.getUserVote(currentUser.id, movie.id);
    const watchLaterList = db.getWatchLater(currentUser.id);
    isWatchLater = watchLaterList.some((w) => w.movieId === movie.id);
    const uploader = db.findUserById(movie.uploadedBy);
    if (uploader && currentUser.subscribedCreators) {
      isSubscribedToUploader = currentUser.subscribedCreators.includes(movie.uploadedBy);
    }
  }

  return res.json({
    movie,
    userVote,
    isWatchLater,
    isSubscribedToUploader,
  });
});

// Create movie upload
app.post('/api/movies', requireAuth, (req: Request, res: Response) => {
  try {
    const user: User = (req as any).currentUser;
    const settings = db.getSettings();

    const {
      title,
      description,
      poster,
      thumbnail,
      backdrop,
      videoUrl,
      trailerUrl,
      genre,
      language,
      releaseYear,
      quality,
      duration,
      cast,
      director,
      tags,
      category,
      isDraft,
    } = req.body;

    if (!title || !description || !videoUrl || !language) {
      return res.status(400).json({ error: 'Title, description, language, and video URL are required.' });
    }

    const needsApproval = settings.requireAdminApprovalForUploads && user.role !== 'admin';
    const status = isDraft ? 'pending' : needsApproval ? 'pending' : 'approved';
    const isPublished = isDraft ? false : !needsApproval;

    const newMovie: Movie = {
      id: 'm-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      poster: poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      thumbnail: thumbnail || poster,
      backdrop: backdrop || poster,
      videoUrl: videoUrl.trim(),
      trailerUrl: trailerUrl ? trailerUrl.trim() : undefined,
      genre: Array.isArray(genre) && genre.length ? genre : ['General'],
      language: language || 'Bengali',
      releaseYear: parseInt(releaseYear, 10) || new Date().getFullYear(),
      quality: quality || '1080p',
      duration: duration || '1h 30m',
      cast: Array.isArray(cast) ? cast : cast ? cast.split(',').map((s: string) => s.trim()) : [],
      director: director ? director.trim() : 'Independent Creator',
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((s: string) => s.trim()) : [],
      category: category || 'Movies',
      views: 0,
      likes: 0,
      dislikes: 0,
      rating: 8.5,
      ratingCount: 1,
      uploadedBy: user.id,
      uploaderName: user.username,
      uploaderAvatar: user.avatar,
      isPublished,
      status,
      createdAt: new Date().toISOString(),
    };

    db.createMovie(newMovie);

    // If pending approval, notify admins
    if (status === 'pending') {
      db.addNotification({
        userId: 'u-admin',
        title: 'New Movie Pending Approval',
        message: `${user.username} submitted "${newMovie.title}" for review.`,
        link: '/admin',
        read: false,
      });
    }

    return res.status(201).json({ movie: newMovie });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to upload movie' });
  }
});

// Update Movie
app.put('/api/movies/:id', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const movie = db.getMovieById(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  // Only owner or admin/mod can update
  if (movie.uploadedBy !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    return res.status(403).json({ error: 'Permission denied to edit this movie' });
  }

  const updated = db.updateMovie(movie.id, req.body);
  return res.json({ movie: updated });
});

// Delete Movie
app.delete('/api/movies/:id', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const movie = db.getMovieById(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  if (movie.uploadedBy !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    return res.status(403).json({ error: 'Permission denied to delete this movie' });
  }

  db.deleteMovie(movie.id);

  if (user.role === 'admin') {
    db.logActivity({
      adminUsername: user.username,
      action: 'Deleted Movie',
      target: `${movie.title} (${movie.id})`,
    });
  }

  return res.json({ success: true, message: 'Movie deleted successfully' });
});

// Increment View count
app.post('/api/movies/:id/view', (req: Request, res: Response) => {
  db.incrementMovieViews(req.params.id);
  const movie = db.getMovieById(req.params.id);
  return res.json({ views: movie?.views || 0 });
});

// Vote (Like/Dislike)
app.post('/api/movies/:id/vote', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const { voteType } = req.body; // 'like' | 'dislike'

  if (voteType !== 'like' && voteType !== 'dislike') {
    return res.status(400).json({ error: 'voteType must be like or dislike' });
  }

  try {
    const result = db.voteMovie(user.id, req.params.id, voteType);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Voting failed' });
  }
});

/* ==========================================================================
   COMMENTS ROUTES
   ========================================================================== */

app.get('/api/movies/:id/comments', (req: Request, res: Response) => {
  const comments = db.getCommentsByMovie(req.params.id);
  return res.json({ comments });
});

app.post('/api/movies/:id/comments', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  const movie = db.getMovieById(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  const newComment = db.addComment({
    id: 'c-' + Date.now(),
    movieId: movie.id,
    userId: user.id,
    username: user.username,
    userAvatar: user.avatar,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
  });

  return res.status(201).json({ comment: newComment });
});

app.delete('/api/comments/:id', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const isAdmin = user.role === 'admin' || user.role === 'moderator';
  const success = db.deleteComment(req.params.id, user.id, isAdmin);
  if (!success) {
    return res.status(403).json({ error: 'Cannot delete this comment' });
  }
  return res.json({ success: true });
});

app.post('/api/comments/:id/like', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const comment = db.likeComment(req.params.id, user.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  return res.json({ comment });
});

/* ==========================================================================
   USER DASHBOARD ROUTES (History, Watch Later, Playlists, Subscribe)
   ========================================================================== */

// Watch History
app.get('/api/user/history', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const history = db.getWatchHistory(user.id);
  return res.json({ history });
});

app.post('/api/user/history', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const { movieId, progressSeconds, durationSeconds } = req.body;
  if (!movieId) return res.status(400).json({ error: 'movieId required' });

  db.recordWatchProgress(user.id, movieId, progressSeconds || 0, durationSeconds || 0);
  return res.json({ success: true });
});

app.delete('/api/user/history', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  db.clearWatchHistory(user.id);
  return res.json({ success: true });
});

// Watch Later
app.get('/api/user/watch-later', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const watchLater = db.getWatchLater(user.id);
  return res.json({ watchLater });
});

app.post('/api/user/watch-later', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const { movieId } = req.body;
  if (!movieId) return res.status(400).json({ error: 'movieId required' });

  const isAdded = db.toggleWatchLater(user.id, movieId);
  return res.json({ isAdded });
});

// Playlists
app.get('/api/user/playlists', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const playlists = db.getUserPlaylists(user.id);
  return res.json({ playlists });
});

app.post('/api/user/playlists', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const { title, description, isPublic } = req.body;
  if (!title) return res.status(400).json({ error: 'Playlist title is required' });

  const newPlaylist = db.createPlaylist({
    id: 'pl-' + Date.now(),
    userId: user.id,
    title: title.trim(),
    description: description ? description.trim() : undefined,
    isPublic: isPublic !== undefined ? isPublic : true,
    movieIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return res.status(201).json({ playlist: newPlaylist });
});

app.post('/api/user/playlists/:id/movies', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const { movieId } = req.body;
  const playlist = db.getUserPlaylists(user.id).find((p) => p.id === req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  if (!playlist.movieIds.includes(movieId)) {
    playlist.movieIds.push(movieId);
    db.saveData();
  }
  return res.json({ playlist });
});

app.delete('/api/user/playlists/:id/movies/:movieId', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const playlist = db.getUserPlaylists(user.id).find((p) => p.id === req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  playlist.movieIds = playlist.movieIds.filter((id) => id !== req.params.movieId);
  db.saveData();
  return res.json({ playlist });
});

app.delete('/api/user/playlists/:id', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const success = db.deletePlaylist(req.params.id, user.id);
  return res.json({ success });
});

// Creator Subscriptions
app.post('/api/user/subscribe/:creatorId', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  try {
    const result = db.toggleSubscription(user.id, req.params.creatorId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Subscription failed' });
  }
});

// Notifications
app.get('/api/user/notifications', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  const notifications = db.getUserNotifications(user.id);
  return res.json({ notifications });
});

app.post('/api/user/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).currentUser;
  db.markNotificationAsRead(req.params.id, user.id);
  return res.json({ success: true });
});

/* ==========================================================================
   ADMIN PANEL & PASSKEY ROUTES
   ========================================================================== */

// Verify Admin / Moderator Passkey
app.post('/api/admin/verify-passkey', (req: Request, res: Response) => {
  try {
    const { passkey, panelType } = req.body;
    if (!passkey || typeof passkey !== 'string') {
      return res.status(400).json({ error: 'Security passkey is required.' });
    }

    const cleanInput = passkey.trim();
    // Support without leading colon e.g. ':Devjyoti2003' -> 'Devjyoti2003' or ':Devjyoti2003'
    const strippedInput = cleanInput.replace(/^:+/, '').trim();
    const settings = db.getSettings();
    const expectedAdminKey = (settings.adminKey || 'Devjyoti2003').trim();
    const expectedModKey = (settings.moderatorKey || 'Devjyoti2003').trim();

    const isMatchAdmin =
      cleanInput === expectedAdminKey ||
      strippedInput === expectedAdminKey ||
      cleanInput === `:${expectedAdminKey}` ||
      cleanInput.toLowerCase() === expectedAdminKey.toLowerCase() ||
      strippedInput.toLowerCase() === expectedAdminKey.toLowerCase();

    const isMatchMod =
      cleanInput === expectedModKey ||
      strippedInput === expectedModKey ||
      cleanInput === `:${expectedModKey}` ||
      cleanInput.toLowerCase() === expectedModKey.toLowerCase() ||
      strippedInput.toLowerCase() === expectedModKey.toLowerCase();

    const requestedPanel = panelType || 'admin';
    let grantedRole: 'admin' | 'moderator' | null = null;

    if (requestedPanel === 'admin') {
      if (isMatchAdmin) {
        grantedRole = 'admin';
      } else if (isMatchMod) {
        grantedRole = 'moderator';
      }
    } else {
      if (isMatchMod || isMatchAdmin) {
        grantedRole = isMatchAdmin ? 'admin' : 'moderator';
      }
    }

    if (!grantedRole) {
      return res.status(401).json({
        error: 'Invalid passkey. Access denied.',
      });
    }

    // Find admin user or create token for admin
    let user = db.getData().users.find((u) => u.role === grantedRole);
    if (!user) {
      user = db.getData().users.find((u) => u.role === 'admin') || db.getData().users[0];
    }

    const token = 'tok-passkey-' + crypto.randomBytes(24).toString('hex');
    userSessions.set(token, user.id);

    const { passwordHash: _, salt: __, ...safeUser } = user;
    safeUser.role = grantedRole;

    db.logActivity({
      adminUsername: safeUser.username,
      action: `Passkey Authentication Success (${grantedRole.toUpperCase()})`,
      target: `${requestedPanel.toUpperCase()} PANEL ACCESS`,
    });

    return res.json({
      success: true,
      role: grantedRole,
      token,
      user: safeUser,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Passkey verification failed' });
  }
});

// Update Passkeys (accessible by admin)
app.put('/api/admin/passkeys', requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).currentUser;
  const { adminKey, moderatorKey } = req.body;

  const currentSettings = db.getSettings();
  const newAdminKey = adminKey !== undefined && adminKey.trim() !== '' ? adminKey.trim() : currentSettings.adminKey || 'Devjyoti2003';
  const newModKey = moderatorKey !== undefined && moderatorKey.trim() !== '' ? moderatorKey.trim() : currentSettings.moderatorKey || 'Devjyoti2003';

  const updatedSettings = db.updateSettings({
    adminKey: newAdminKey,
    moderatorKey: newModKey,
  });

  db.logActivity({
    adminUsername: admin.username,
    action: 'Updated Admin/Moderator Security Passkeys',
    target: 'Security Credentials',
  });

  return res.json({
    success: true,
    message: 'Security passkeys successfully updated.',
    adminKey: updatedSettings.adminKey,
    moderatorKey: updatedSettings.moderatorKey,
  });
});

// Admin stats
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const data = db.getData();
  const totalUsers = data.users.length;
  const totalMovies = data.movies.length;
  const totalViews = data.movies.reduce((acc, m) => acc + (m.views || 0), 0);
  const pendingApprovals = data.movies.filter((m) => m.status === 'pending').length;
  const publishedMovies = data.movies.filter((m) => m.isPublished && m.status === 'approved').length;
  const pendingReports = data.reports.filter((r) => r.status === 'pending').length;

  return res.json({
    totalUsers,
    totalMovies,
    totalViews,
    pendingApprovals,
    publishedMovies,
    pendingReports,
    storageUsage: '14.2 GB / 500 GB (Cloud CDN)',
  });
});

// Admin Users List & Management
app.get('/api/admin/users', requireAdmin, (_req: Request, res: Response) => {
  const users = db.getData().users.map(({ passwordHash: _, salt: __, ...safe }) => safe);
  return res.json({ users });
});

app.put('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).currentUser;
  const { role, isBlocked } = req.body;

  const updated = db.updateUser(req.params.id, {
    ...(role !== undefined && { role }),
    ...(isBlocked !== undefined && { isBlocked }),
  });

  if (!updated) return res.status(404).json({ error: 'User not found' });

  db.logActivity({
    adminUsername: admin.username,
    action: `Updated user permissions (${role || (isBlocked ? 'Blocked' : 'Unblocked')})`,
    target: `${updated.username} (${updated.id})`,
  });

  const { passwordHash: _, salt: __, ...safe } = updated;
  return res.json({ user: safe });
});

app.delete('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).currentUser;
  const user = db.findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.id === admin.id) {
    return res.status(400).json({ error: 'Cannot delete your own admin account.' });
  }

  db.deleteUser(user.id);
  db.logActivity({
    adminUsername: admin.username,
    action: 'Deleted User Account',
    target: `${user.username} (${user.id})`,
  });

  return res.json({ success: true });
});

// Admin Movie Approval / Feature / Status
app.put('/api/admin/movies/:id/status', requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).currentUser;
  const { status, isPublished, isFeatured } = req.body;

  const movie = db.getMovieById(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  const updates: Partial<Movie> = {};
  if (status !== undefined) updates.status = status;
  if (isPublished !== undefined) updates.isPublished = isPublished;
  if (isFeatured !== undefined) updates.isFeatured = isFeatured;

  const updated = db.updateMovie(movie.id, updates);

  // Notify creator if status changed
  if (status === 'approved' && movie.uploadedBy) {
    db.addNotification({
      userId: movie.uploadedBy,
      title: 'Movie Approved!',
      message: `Your upload "${movie.title}" has been approved and is now live on MOVIE PANEL BD.`,
      link: `/movie/${movie.id}`,
      read: false,
    });
  }

  db.logActivity({
    adminUsername: admin.username,
    action: `Movie Status: ${status || (isFeatured ? 'Featured' : 'Unfeatured')}`,
    target: `${movie.title} (${movie.id})`,
  });

  return res.json({ movie: updated });
});

// Categories Management
app.get('/api/admin/categories', (_req: Request, res: Response) => {
  return res.json({ categories: db.getCategories() });
});

app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, icon } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const categories = db.getCategories();
  const newCat = {
    id: 'cat-' + Date.now(),
    name: name.trim(),
    slug,
    icon: icon || 'Film',
    enabled: true,
    order: categories.length,
  };
  categories.push(newCat);
  db.saveCategories(categories);
  return res.status(201).json({ category: newCat });
});

app.put('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: 'Expected categories array' });
  }
  db.saveCategories(categories);
  return res.json({ categories: db.getCategories() });
});

// Website Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  return res.json({ settings: db.getSettings() });
});

app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const admin: User = (req as any).currentUser;
  const updated = db.updateSettings(req.body);

  db.logActivity({
    adminUsername: admin.username,
    action: 'Updated Website Settings',
    target: 'System Settings',
  });

  return res.json({ settings: updated });
});

// Admin Logs
app.get('/api/admin/logs', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ logs: db.getActivityLogs() });
});

// Copyright Reports / DMCA
app.post('/api/reports', (req: Request, res: Response) => {
  const { movieId, movieTitle, reporterName, reporterEmail, rightsOwner, reason, details, proofUrl } = req.body;

  if (!movieId || !reporterName || !reporterEmail || !reason || !details) {
    return res.status(400).json({ error: 'All report fields are required.' });
  }

  const report: CopyrightReport = {
    id: 'rep-' + Date.now(),
    movieId,
    movieTitle: movieTitle || 'Movie',
    reporterName,
    reporterEmail,
    rightsOwner: rightsOwner || reporterName,
    reason,
    details,
    proofUrl,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.addReport(report);

  // Notify admins
  db.addNotification({
    userId: 'u-admin',
    title: 'New Copyright Report Submitted',
    message: `${reporterName} reported "${movieTitle}" for: ${reason}`,
    link: '/admin',
    read: false,
  });

  return res.status(201).json({ report, message: 'Complaint registered for administrative review.' });
});

app.get('/api/admin/reports', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ reports: db.getReports() });
});

app.put('/api/admin/reports/:id', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const report = db.updateReportStatus(req.params.id, status);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  return res.json({ report });
});

/* ==========================================================================
   VITE DEV MIDDLEWARES / PRODUCTION STATIC SERVING
   ========================================================================== */

async function startServer() {
  if (!isProduction) {
    // In dev, mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MOVIE PANEL BD] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
