import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Upload,
  Bell,
  User as UserIcon,
  LogOut,
  Shield,
  Film,
  Menu,
  X,
  History,
  Bookmark,
  ListVideo,
  Sparkles,
} from 'lucide-react';
import { User, Movie, Notification } from '../types/index.ts';
import { api } from '../services/api.ts';

interface HeaderProps {
  currentUser: User | null;
  activeNav?: string;
  onNavigateNav: (nav: 'home' | 'movies' | 'browse' | 'premium') => void;
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onOpenUpload: () => void;
  onOpenAdmin: () => void;
  onOpenDashboard: (tab?: string) => void;
  onSelectMovie: (movie: Movie) => void;
  onToggleSidebar?: () => void;
  onSearchChange: (query: string) => void;
  allMovies: Movie[];
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeNav = 'home',
  onNavigateNav,
  onOpenAuth,
  onOpenUpload,
  onOpenAdmin,
  onOpenDashboard,
  onSelectMovie,
  onToggleSidebar,
  onSearchChange,
  allMovies,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (currentUser) {
      api.getNotifications()
        .then((res) => setNotifications(res.notifications || []))
        .catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchChange(val);
    setShowSearchDropdown(val.trim().length > 0);
  };

  const handleSelectSuggestion = (movie: Movie) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    onSelectMovie(movie);
  };

  const suggestions = searchQuery.trim()
    ? allMovies
        .filter(
          (m) =>
            m.isPublished &&
            (m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.cast.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
              m.language.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b border-neutral-800/80 ${
        isScrolled ? 'bg-[#0d0e12]/95 backdrop-blur-md shadow-xl' : 'bg-[#0d0e12]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo + Nav Links matching reference site */}
        <div className="flex items-center gap-6 shrink-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle navigation menu"
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => onNavigateNav('home')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            aria-label="Movie Panel BD Home"
          >
            <img
              src="/assets/aistudio/IMG-20261109-WA0021_df2e63fc.jpg"
              alt="Movie Panel BD"
              className="w-9 h-9 object-contain rounded-full shadow-md border border-neutral-700/60 transition-transform group-hover:scale-105"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg text-white group-hover:text-red-500 transition-colors tracking-tight">
                MoviePanel
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 rounded uppercase tracking-wider">
                BD
              </span>
            </div>
          </button>

          {/* Navigation links matching reference site: Home, Movies, Browse, Premium */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => onNavigateNav('home')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeNav === 'home'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigateNav('movies')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeNav === 'movies'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => onNavigateNav('browse')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeNav === 'browse'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => onNavigateNav('premium')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                activeNav === 'premium'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Premium</span>
            </button>
          </nav>
        </div>

        {/* Center: Search box matching reference placeholder */}
        <div ref={searchRef} className="relative flex-1 max-w-md mx-2 hidden sm:block">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              placeholder="Search movies by title…"
              aria-label="Search videos"
              className="w-full pl-10 pr-9 py-2 bg-neutral-900/90 text-xs sm:text-sm text-white placeholder-neutral-500 rounded-xl border border-neutral-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSearchChange('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3 text-neutral-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-neutral-800/60">
              {suggestions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectSuggestion(m)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-neutral-800 transition-colors text-left group cursor-pointer"
                >
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-9 h-12 object-cover rounded shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-red-500 truncate">
                      {m.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                      <span>{m.releaseYear}</span>
                      <span>·</span>
                      <span>{m.language}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-medium">★ {m.rating}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-red-400 font-semibold uppercase px-1.5 py-0.5 bg-red-950/40 border border-red-900/40 rounded">
                    {m.quality}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Log in / Sign up (or User info when authenticated) */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <>
              {/* Upload CTA */}
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors cursor-pointer"
                aria-label="Upload movie"
              >
                <Upload className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden sm:inline">Upload</span>
              </button>

              {/* Notifications */}
              <div ref={notifMenuRef} className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  aria-label="View notifications"
                  className="relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50 divide-y divide-neutral-800/60">
                    <div className="px-4 py-2 font-bold text-xs text-white uppercase tracking-wider">
                      Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-neutral-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="p-3 hover:bg-neutral-800/50 text-xs">
                          <p className="font-semibold text-white">{n.title}</p>
                          <p className="text-neutral-400 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User Avatar Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-red-500/40 transition-all cursor-pointer"
                  aria-label="User account menu"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                  />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-neutral-800">
                      <p className="text-xs font-bold text-white truncate">{currentUser.username}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{currentUser.email || `@${currentUser.username}`}</p>
                      <span className="inline-block mt-1 text-[9px] uppercase font-bold text-red-400">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1 text-xs text-neutral-300">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenDashboard('profile');
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 text-left cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenDashboard('uploads');
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 text-left cursor-pointer"
                      >
                        <Film className="w-3.5 h-3.5 text-neutral-400" />
                        <span>My Uploads</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenDashboard('history');
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 text-left cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Watch History</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenDashboard('watchlater');
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 text-left cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Watch Later</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenDashboard('playlists');
                        }}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 text-left cursor-pointer"
                      >
                        <ListVideo className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Playlists</span>
                      </button>

                      {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenAdmin();
                          }}
                          className="w-full px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 text-amber-400 text-left border-t border-neutral-800 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          <span>Admin Panel</span>
                        </button>
                      )}

                      <div className="border-t border-neutral-800 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            api.logout();
                            window.location.reload();
                          }}
                          className="w-full px-4 py-2 flex items-center gap-2 text-red-400 hover:bg-neutral-800 text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Log in / Sign up buttons strictly matching reference website */
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs sm:text-sm font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer px-2 py-1"
              >
                Log in
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md shadow-red-600/25 transition-all cursor-pointer"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
