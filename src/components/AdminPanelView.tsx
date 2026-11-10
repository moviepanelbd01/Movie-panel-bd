import React, { useState, useEffect } from 'react';
import {
  Users,
  Film,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Trash2,
  Settings,
  AlertTriangle,
  FileText,
  Star,
  Search,
  Check,
  X,
  Layers,
  Activity,
  HardDrive,
  Globe,
  Radio,
  KeyRound,
  Lock,
  EyeOff,
} from 'lucide-react';
import { User, Movie, CopyrightReport, AdminActivityLog, WebsiteSettings, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { formatViews } from '../utils/movieLogic.ts';

interface AdminPanelViewProps {
  currentUser: User;
  onClose: () => void;
  onRefreshMovies: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  onClose,
  onRefreshMovies,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'movies' | 'users' | 'categories' | 'settings' | 'reports' | 'logs'>('overview');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMovies: 0,
    totalViews: 0,
    pendingApprovals: 0,
    publishedMovies: 0,
    pendingReports: 0,
    storageUsage: '14.2 GB / 500 GB',
  });

  // Data lists
  const [movies, setMovies] = useState<Movie[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<CopyrightReport[]>([]);
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [adminKey, setAdminKey] = useState('Devjyoti2003');
  const [moderatorKey, setModeratorKey] = useState('Devjyoti2003');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showModPass, setShowModPass] = useState(false);
  const [passkeyUpdating, setPasskeyUpdating] = useState(false);

  // Search & Filter state
  const [movieFilter, setMovieFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [userSearch, setUserSearch] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      const statsRes = await api.getAdminStats();
      setStats(statsRes);

      const moviesRes = await api.getMovies({ includePending: true });
      setMovies(moviesRes.movies);

      const usersRes = await api.getAdminUsers();
      setUsers(usersRes.users);

      const reportsRes = await api.getAdminReports();
      setReports(reportsRes.reports);

      const logsRes = await api.getAdminLogs();
      setLogs(logsRes.logs);

      const catRes = await api.getCategories();
      setCategories(catRes.categories);

      const setRes = await api.getSettings();
      setSettings(setRes.settings);
      if (setRes.settings.adminKey) setAdminKey(setRes.settings.adminKey);
      if (setRes.settings.moderatorKey) setModeratorKey(setRes.settings.moderatorKey);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdatePasskeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim() || !moderatorKey.trim()) {
      showNotification('Passkeys cannot be empty.');
      return;
    }
    setPasskeyUpdating(true);
    try {
      await api.updatePasskeys({ adminKey: adminKey.trim(), moderatorKey: moderatorKey.trim() });
      showNotification('Security passkeys updated! New logins will require updated passkeys.');
      loadAdminData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update passkeys');
    } finally {
      setPasskeyUpdating(false);
    }
  };

  // Movie Actions: Approve / Reject / Toggle Feature / Delete
  const handleApproveMovie = async (movieId: string) => {
    try {
      await api.updateMovieStatus(movieId, { status: 'approved', isPublished: true });
      showNotification('Movie approved and published live!');
      loadAdminData();
      onRefreshMovies();
    } catch (err: any) {
      showNotification('Failed to approve movie: ' + err.message);
    }
  };

  const handleRejectMovie = async (movieId: string) => {
    try {
      await api.updateMovieStatus(movieId, { status: 'rejected', isPublished: false });
      showNotification('Movie rejected.');
      loadAdminData();
      onRefreshMovies();
    } catch (err: any) {
      showNotification('Failed to reject movie');
    }
  };

  const handleToggleFeature = async (movie: Movie) => {
    try {
      await api.updateMovieStatus(movie.id, { isFeatured: !movie.isFeatured });
      showNotification(`Movie ${!movie.isFeatured ? 'featured' : 'unfeatured'} on homepage.`);
      loadAdminData();
      onRefreshMovies();
    } catch (err: any) {
      showNotification('Failed to update featured state');
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to permanently delete this movie?')) return;
    try {
      await api.deleteMovie(movieId);
      showNotification('Movie permanently deleted.');
      loadAdminData();
      onRefreshMovies();
    } catch (err: any) {
      showNotification('Failed to delete movie');
    }
  };

  // User Actions: Change Role / Block / Unblock / Delete
  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await api.updateAdminUser(userId, { role });
      showNotification(`User role updated to ${role}`);
      loadAdminData();
    } catch (err: any) {
      showNotification('Failed to update role');
    }
  };

  const handleToggleBlock = async (user: User) => {
    try {
      await api.updateAdminUser(user.id, { isBlocked: !user.isBlocked });
      showNotification(`User account ${!user.isBlocked ? 'suspended' : 'unblocked'}`);
      loadAdminData();
    } catch (err: any) {
      showNotification('Failed to update block state');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user account?')) return;
    try {
      await api.deleteAdminUser(userId);
      showNotification('User deleted.');
      loadAdminData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete user');
    }
  };

  // Reports Actions
  const handleResolveReport = async (reportId: string) => {
    try {
      await api.updateReportStatus(reportId, 'resolved');
      showNotification('Complaint marked as resolved.');
      loadAdminData();
    } catch (err) {
      showNotification('Failed to resolve report');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      showNotification('Website settings saved successfully!');
    } catch (err: any) {
      showNotification('Failed to save settings');
    }
  };

  // Filtered movies
  const filteredMovies = movies.filter((m) => {
    if (movieFilter === 'all') return true;
    return m.status === movieFilter;
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.username.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-red-950/40 via-[#13151c] to-[#13151c] rounded-2xl border border-red-900/30 mb-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 text-red-500 rounded-xl border border-red-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-white">
              MOVIE PANEL BD · Admin Control Center
            </h1>
            <p className="text-xs text-zinc-400">
              Manage movies, approve creator uploads, audit user permissions, and enforce copyright compliance
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          Exit Admin
        </button>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="mb-6 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl shadow-lg flex items-center justify-between">
          <span>{notificationMsg}</span>
          <button onClick={() => setNotificationMsg(null)}>✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-zinc-800 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: Activity },
          { id: 'movies', label: `Movie Approvals (${stats.pendingApprovals})`, icon: Film },
          { id: 'users', label: `User Management (${stats.totalUsers})`, icon: Users },
          { id: 'reports', label: `DMCA Reports (${stats.pendingReports})`, icon: AlertTriangle },
          { id: 'settings', label: 'Website Settings', icon: Settings },
          { id: 'logs', label: 'Audit Activity Logs', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-[#13151c] rounded-2xl border border-white/5 space-y-1">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                Total Users
              </span>
              <p className="font-display font-black text-2xl text-white">
                {stats.totalUsers.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-400 font-medium">Active database users</span>
            </div>

            <div className="p-5 bg-[#13151c] rounded-2xl border border-white/5 space-y-1">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                Total Movies
              </span>
              <p className="font-display font-black text-2xl text-white">
                {stats.totalMovies.toLocaleString()}
              </p>
              <span className="text-[11px] text-zinc-400">
                {stats.publishedMovies} published online
              </span>
            </div>

            <div className="p-5 bg-[#13151c] rounded-2xl border border-white/5 space-y-1">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                Pending Approvals
              </span>
              <p className="font-display font-black text-2xl text-amber-400">
                {stats.pendingApprovals}
              </p>
              <span className="text-[11px] text-amber-500 font-medium">Awaiting moderation</span>
            </div>

            <div className="p-5 bg-[#13151c] rounded-2xl border border-white/5 space-y-1">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                Total Views
              </span>
              <p className="font-display font-black text-2xl text-red-500">
                {formatViews(stats.totalViews)}
              </p>
              <span className="text-[11px] text-zinc-400">Across all catalog streams</span>
            </div>
          </div>

          {/* Quick Pending Approvals Review Strip */}
          {stats.pendingApprovals > 0 && (
            <div className="p-6 bg-amber-950/20 border border-amber-900/40 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Pending Creator Uploads Requiring Approval</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('movies');
                    setMovieFilter('pending');
                  }}
                  className="text-xs text-amber-400 hover:underline"
                >
                  View All ({stats.pendingApprovals})
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {movies
                  .filter((m) => m.status === 'pending')
                  .slice(0, 2)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-12 h-16 object-cover rounded shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{m.title}</p>
                          <p className="text-[11px] text-zinc-400">
                            Uploaded by {m.uploaderName} · {m.language}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveMovie(m.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectMovie(m.id)}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Storage & Cloud Specs */}
          <div className="p-6 bg-[#13151c] rounded-2xl border border-white/5 space-y-3 text-xs">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-red-500" />
              <span>Cloud Storage & Infrastructure Status</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-zinc-300">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[11px] block">Storage Allocation</span>
                <span className="font-mono text-white font-bold">{stats.storageUsage}</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[11px] block">Database Engine</span>
                <span className="text-white font-bold">Persistent JSON Store (Atomicity & Seeded)</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[11px] block">Video CDN Streaming</span>
                <span className="text-white font-bold">Enabled (Adaptive HLS / HTML5)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIES MANAGEMENT */}
      {activeTab === 'movies' && (
        <div className="space-y-4">
          {/* Sub-filter tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2 text-xs">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setMovieFilter(status)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    movieFilter === status
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {status.toUpperCase()} ({movies.filter((m) => status === 'all' || m.status === status).length})
                </button>
              ))}
            </div>
          </div>

          {/* Movies List Table */}
          <div className="bg-[#13151c] rounded-2xl border border-white/5 overflow-hidden">
            <div className="divide-y divide-zinc-800/60">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-14 h-20 object-cover rounded-lg shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-sm text-white truncate">
                          {movie.title}
                        </h4>
                        {movie.isFeatured && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {movie.releaseYear} · {movie.language} · {movie.quality} · {movie.category}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Uploader: <span className="text-zinc-300">@{movie.uploaderName}</span> · {formatViews(movie.views)} views
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {movie.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApproveMovie(movie.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectMovie(movie.id)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          movie.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {movie.status}
                      </span>
                    )}

                    <button
                      onClick={() => handleToggleFeature(movie)}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer text-xs ${
                        movie.isFeatured
                          ? 'bg-amber-400/20 text-amber-400 border-amber-400/50'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                      title={movie.isFeatured ? 'Unfeature from Homepage' : 'Feature on Homepage'}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="p-2 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Search Input */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg text-xs placeholder-zinc-500 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* User Cards / List */}
          <div className="bg-[#13151c] rounded-2xl border border-white/5 overflow-hidden">
            <div className="divide-y divide-zinc-800/60">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{u.username}</span>
                        {u.isBlocked && (
                          <span className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 rounded text-[10px] font-bold">
                            BLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 mt-0.5 truncate">{u.email || 'No email'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role Dropdown */}
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
                    >
                      <option value="user">User</option>
                      <option value="creator">Creator</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* Block / Unblock Button */}
                    <button
                      onClick={() => handleToggleBlock(u)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        u.isBlocked
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>

                    {/* Delete account */}
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DMCA / COPYRIGHT REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              Copyright Takedown Complaints & DMCA Requests
            </h2>
            <p className="text-xs text-zinc-400">
              Review and act upon complaints filed by content owners or distributors
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 bg-[#13151c] rounded-2xl border border-white/5">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
              <p>No active copyright reports. All content is clean.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 bg-[#13151c] rounded-2xl border border-white/5 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">
                        Reported Movie: {rep.movieTitle}
                      </span>
                      <p className="text-zinc-400 mt-0.5">
                        Filed by: {rep.reporterName} ({rep.reporterEmail}) · Rights Owner: {rep.rightsOwner}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        rep.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-900 rounded-xl text-zinc-300 space-y-1">
                    <p className="font-semibold text-red-400">Reason: {rep.reason}</p>
                    <p className="leading-relaxed">{rep.details}</p>
                    {rep.proofUrl && (
                      <a
                        href={rep.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline block pt-1"
                      >
                        Attached Proof Document
                      </a>
                    )}
                  </div>

                  {rep.status !== 'resolved' && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleDeleteMovie(rep.movieId)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Take Down Movie
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg cursor-pointer"
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: WEBSITE SETTINGS */}
      {activeTab === 'settings' && settings && (
        <div className="space-y-6 max-w-xl text-xs">
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Website & Branding Settings
              </h2>
              <p className="text-zinc-400">
                Customize website name, banner advertisements, announcements, and upload rules
              </p>
            </div>

            <div className="space-y-4 p-6 bg-[#13151c] rounded-2xl border border-white/5">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Website Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Announcement Message
              </label>
              <input
                type="text"
                value={settings.announcement}
                onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showAnnouncement"
                checked={settings.showAnnouncement}
                onChange={(e) => setSettings({ ...settings, showAnnouncement: e.target.checked })}
                className="accent-red-600 rounded cursor-pointer"
              />
              <label htmlFor="showAnnouncement" className="text-zinc-300 font-semibold cursor-pointer">
                Display Announcement Banner on Homepage
              </label>
            </div>

            <div className="border-t border-zinc-800 pt-3 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bannerAdEnabled"
                  checked={settings.bannerAdEnabled}
                  onChange={(e) => setSettings({ ...settings, bannerAdEnabled: e.target.checked })}
                  className="accent-red-600 rounded cursor-pointer"
                />
                <label htmlFor="bannerAdEnabled" className="text-zinc-300 font-semibold cursor-pointer">
                  Enable Promotional Banner / Ad Sponsorship
                </label>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Promotional Banner Text
                </label>
                <input
                  type="text"
                  value={settings.bannerAdText}
                  onChange={(e) => setSettings({ ...settings, bannerAdText: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={settings.requireAdminApprovalForUploads}
                  onChange={(e) => setSettings({ ...settings, requireAdminApprovalForUploads: e.target.checked })}
                  className="accent-red-600 rounded cursor-pointer"
                />
                <label htmlFor="requireApproval" className="text-zinc-300 font-semibold cursor-pointer">
                  Require Admin Review & Approval for New Movie Uploads
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Save Website Settings
            </button>
          </div>
        </form>

          {/* Security Passkeys Configuration */}
          <div className="space-y-4 p-6 bg-[#13151c] rounded-2xl border border-red-500/20 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white">
                  Security Passkeys Management
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Manage the discreet access passwords for Admin Panel and Moderator Panel
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Admin Panel Passkey (Default: Devjyoti2003)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{showAdminPass ? adminKey : '••••••••'}</span>
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter Admin passkey"
                    className="w-full px-3 py-2 pr-10 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Moderator Panel Passkey (Default: Devjyoti2003)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{showModPass ? moderatorKey : '••••••••'}</span>
                </label>
                <div className="relative">
                  <input
                    type={showModPass ? 'text' : 'password'}
                    value={moderatorKey}
                    onChange={(e) => setModeratorKey(e.target.value)}
                    placeholder="Enter Moderator passkey"
                    className="w-full px-3 py-2 pr-10 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModPass(!showModPass)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                  >
                    {showModPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleUpdatePasskeys}
                  disabled={passkeyUpdating}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-bold rounded-lg border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{passkeyUpdating ? 'Updating Passkeys...' : 'Save Security Passkeys'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              Administrator Activity Audit Trail
            </h2>
            <p className="text-xs text-zinc-400">
              Immutable log of approvals, deletions, and policy changes
            </p>
          </div>

          <div className="bg-[#13151c] rounded-2xl border border-white/5 overflow-hidden">
            <div className="divide-y divide-zinc-800/60 text-xs">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-white">{log.action}: </span>
                    <span className="text-zinc-300">{log.target}</span>
                    {log.details && (
                      <p className="text-[11px] text-zinc-400 mt-0.5">{log.details}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-zinc-500 block">
                      By @{log.adminUsername}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
