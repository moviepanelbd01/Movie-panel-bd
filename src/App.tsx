import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { CategoryPills } from './components/CategoryPills.tsx';
import { MovieCard } from './components/MovieCard.tsx';
import { MovieCarousel } from './components/MovieCarousel.tsx';
import { MovieDetailsView } from './components/MovieDetailsView.tsx';
import { UserDashboardView } from './components/UserDashboardView.tsx';
import { AdminPanelView } from './components/AdminPanelView.tsx';
import { GoPremiumSection } from './components/GoPremiumSection.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PasskeyModal } from './components/PasskeyModal.tsx';
import { UploadModal } from './components/UploadModal.tsx';
import { AddToPlaylistModal } from './components/AddToPlaylistModal.tsx';
import { DMCAComplaintModal } from './components/DMCAComplaintModal.tsx';
import { AdBanner } from './components/AdBanner.tsx';
import { Movie, User, WebsiteSettings, Category } from './types/index.ts';
import { api, getStoredToken, getStoredUser } from './services/api.ts';
import { searchMovies } from './utils/movieLogic.ts';
import { Film } from 'lucide-react';

export default function App() {
  // Global state
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [movies, setMovies] = useState<Movie[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [watchLaterIds, setWatchLaterIds] = useState<string[]>([]);

  // Navigation & View State
  const [currentView, setCurrentView] = useState<'home' | 'movie' | 'dashboard' | 'admin'>('home');
  const [activeNav, setActiveNav] = useState<'home' | 'movies' | 'browse' | 'premium'>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dashboardTab, setDashboardTab] = useState<string>('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [playlistTargetMovie, setPlaylistTargetMovie] = useState<Movie | null>(null);
  const [dmcaTargetMovie, setDmcaTargetMovie] = useState<Movie | null>(null);
  const [isDmcaOpen, setIsDmcaOpen] = useState(false);

  // Discreet Passkey Security Modal
  const [isPasskeyOpen, setIsPasskeyOpen] = useState(false);
  const [passkeyPanelType, setPasskeyPanelType] = useState<'admin' | 'moderator'>('admin');

  // Load initial movies, settings, and categories
  const loadData = async () => {
    try {
      const [moviesRes, settingsRes, catRes] = await Promise.all([
        api.getMovies(),
        api.getSettings(),
        api.getCategories(),
      ]);
      setMovies(moviesRes.movies);
      setSettings(settingsRes.settings);
      setCategories(catRes.categories);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Verify current user session if token exists
    if (getStoredToken()) {
      api.me()
        .then((res) => setCurrentUser(res.user))
        .catch(() => {
          api.logout();
          setCurrentUser(null);
        });

      // Load user watch later list
      api.getWatchLater()
        .then((res) => setWatchLaterIds(res.watchLater.map((w) => w.movieId)))
        .catch(() => {});
    }

    // Check URL parameters for direct movie link (e.g. ?movie=m-toofan)
    const params = new URLSearchParams(window.location.search);
    const movieParam = params.get('movie');
    if (movieParam) {
      api.getMovieById(movieParam)
        .then((res) => {
          setSelectedMovie(res.movie);
          setCurrentView('movie');
        })
        .catch(() => {});
    }
  }, []);

  // Total views aggregator
  const totalViews = useMemo(() => {
    return movies.reduce((sum, m) => sum + (m.views || 0), 0);
  }, [movies]);

  // Filtered movies according to search and active category
  const filteredCatalog = useMemo(() => {
    let result = movies;

    if (searchQuery.trim()) {
      return searchMovies(result, searchQuery);
    }

    if (activeCategory === 'trending') {
      return [...result].sort((a, b) => b.views - a.views);
    }

    if (activeCategory === 'top-rated') {
      return [...result].sort((a, b) => b.rating - a.rating);
    }

    if (activeCategory !== 'all') {
      const lower = activeCategory.toLowerCase();
      return result.filter((m) => {
        const matchGenre = m.genre?.some((g) => g.toLowerCase().includes(lower));
        const matchLanguage = m.language?.toLowerCase().includes(lower);
        const matchCategory = m.category?.toLowerCase().includes(lower);
        const matchTitle = m.title?.toLowerCase().includes(lower);
        return matchGenre || matchLanguage || matchCategory || matchTitle;
      });
    }

    return result;
  }, [movies, activeCategory, searchQuery]);

  // Curated section slices for Netflix/YouTube homepage experience
  const trendingMovies = useMemo(
    () => [...movies].sort((a, b) => b.views - a.views).slice(0, 8),
    [movies]
  );
  const popularMovies = useMemo(
    () => [...movies].sort((a, b) => b.likes - a.likes).slice(0, 8),
    [movies]
  );
  const bengaliMovies = useMemo(() => movies.filter((m) => m.language === 'Bengali'), [movies]);
  const hindiMovies = useMemo(() => movies.filter((m) => m.language === 'Hindi'), [movies]);
  const englishMovies = useMemo(() => movies.filter((m) => m.language === 'English'), [movies]);
  const southIndianMovies = useMemo(
    () => movies.filter((m) => m.language === 'Tamil' || m.language === 'Telugu'),
    [movies]
  );
  const webSeries = useMemo(() => movies.filter((m) => m.category === 'Web Series'), [movies]);

  // Watch Later Handler
  const handleToggleWatchLater = async (movie: Movie) => {
    if (!currentUser) {
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await api.toggleWatchLater(movie.id);
      if (res.isAdded) {
        setWatchLaterIds((prev) => [...prev, movie.id]);
      } else {
        setWatchLaterIds((prev) => prev.filter((id) => id !== movie.id));
      }
    } catch (err) {
      console.error('Failed to update watch later:', err);
    }
  };

  // Movie click handlers
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentView('movie');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentView('movie');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Header Navigation Dispatcher
  const handleNavigateNav = (nav: 'home' | 'movies' | 'browse' | 'premium') => {
    setActiveNav(nav);
    if (nav === 'home') {
      setCurrentView('home');
      setActiveCategory('all');
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (nav === 'movies') {
      setCurrentView('home');
      setActiveCategory('all');
      setSearchQuery('');
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } else if (nav === 'browse') {
      setCurrentView('home');
      setActiveCategory('all');
      setSearchQuery('');
      window.scrollTo({ top: 450, behavior: 'smooth' });
    } else if (nav === 'premium') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('premium-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Open Passkey Modal
  const handleOpenPasskeyModal = (panelType: 'admin' | 'moderator') => {
    setPasskeyPanelType(panelType);
    setIsPasskeyOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Announcement Bar if configured in Admin settings */}
      {settings?.showAnnouncement && settings?.announcement && (
        <div className="bg-gradient-to-r from-red-900/60 via-red-800/40 to-red-900/60 border-b border-red-700/30 px-4 py-2 text-center text-xs text-red-200">
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Header
        currentUser={currentUser}
        activeNav={activeNav}
        onNavigateNav={handleNavigateNav}
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab || 'login');
          setIsAuthOpen(true);
        }}
        onOpenUpload={() => {
          if (!currentUser) {
            setAuthInitialTab('login');
            setIsAuthOpen(true);
          } else {
            setIsUploadOpen(true);
          }
        }}
        onOpenAdmin={() => setCurrentView('admin')}
        onOpenDashboard={(tab) => {
          setDashboardTab(tab || 'profile');
          setCurrentView('dashboard');
        }}
        onSelectMovie={handleSelectMovie}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearchChange={(q) => setSearchQuery(q)}
        allMovies={movies}
      />

      {/* Mobile Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
          setCurrentView('home');
        }}
        currentUser={currentUser}
        onOpenDashboard={(tab) => {
          setDashboardTab(tab);
          setCurrentView('dashboard');
        }}
        onOpenAdmin={() => setCurrentView('admin')}
        onOpenUpload={() => {
          if (!currentUser) setIsAuthOpen(true);
          else setIsUploadOpen(true);
        }}
        onOpenDMCA={() => setIsDmcaOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: MOVIE DETAILS & PLAYER */}
        {currentView === 'movie' && selectedMovie && (
          <MovieDetailsView
            movie={selectedMovie}
            allMovies={movies}
            currentUser={currentUser}
            onBack={() => setCurrentView('home')}
            onSelectMovie={handleSelectMovie}
            onOpenAuth={() => {
              setAuthInitialTab('login');
              setIsAuthOpen(true);
            }}
            onOpenDMCA={(movie: Movie) => {
              setDmcaTargetMovie(movie);
              setIsDmcaOpen(true);
            }}
            onOpenPlaylistModal={(movie: Movie) => setPlaylistTargetMovie(movie)}
          />
        )}

        {/* VIEW 2: USER DASHBOARD */}
        {currentView === 'dashboard' && currentUser && (
          <UserDashboardView
            currentUser={currentUser}
            initialTab={dashboardTab}
            onSelectMovie={handleSelectMovie}
            onUpdateUser={(updatedUser: User) => setCurrentUser(updatedUser)}
            onClose={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 3: ADMIN & MODERATOR PANEL */}
        {currentView === 'admin' && (
          <AdminPanelView
            currentUser={currentUser || {
              id: 'u-admin',
              username: 'admin',
              role: 'admin',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              bio: 'System Administrator',
              createdAt: new Date().toISOString(),
              subscribersCount: 24500,
              subscribedCreators: [],
            }}
            onClose={() => setCurrentView('home')}
            onRefreshMovies={loadData}
          />
        )}

        {/* VIEW 4: HOMEPAGE (Reference Site Layout) */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Optional Ad Banner if enabled in admin settings */}
            {settings?.bannerAdEnabled && settings?.bannerAdText && (
              <AdBanner settings={settings} />
            )}

            {/* Reference-Matched Hero Banner */}
            {!searchQuery && activeCategory === 'all' && (
              <HeroBanner
                totalMovies={movies.length}
                totalViews={totalViews}
                categoriesCount={categories.length || 12}
                onSearch={(q) => setSearchQuery(q)}
                onBrowse={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                  window.scrollTo({ top: 450, behavior: 'smooth' });
                }}
                onStartUpload={() => {
                  if (!currentUser) {
                    setAuthInitialTab('register');
                    setIsAuthOpen(true);
                  } else {
                    setIsUploadOpen(true);
                  }
                }}
              />
            )}

            {/* Reference-Matched Horizontal Browse by category pills */}
            <CategoryPills
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setSearchQuery('');
              }}
              movies={movies}
              onSeeAll={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
            />

            {/* When searching or filtering by a specific category, show a clean responsive grid */}
            {(searchQuery.trim().length > 0 || activeCategory !== 'all') ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-white">
                    {searchQuery
                      ? `Search Results for "${searchQuery}" (${filteredCatalog.length})`
                      : `${activeCategory.toUpperCase()} Collection (${filteredCatalog.length})`}
                  </h2>
                </div>

                {filteredCatalog.length === 0 ? (
                  <div className="py-20 text-center space-y-3 bg-[#121316] rounded-2xl border border-neutral-800 p-8">
                    <Film className="w-12 h-12 mx-auto text-neutral-600" />
                    <p className="font-display font-bold text-base text-white">
                      No movies found matching your query
                    </p>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      Try searching for different keywords, actors like Shakib Khan or Chanchal Chowdhury, or browse another category.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
                      }}
                      className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Clear Search & Browse All
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredCatalog.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onPlay={handlePlayMovie}
                        onSelect={handleSelectMovie}
                        onToggleWatchLater={handleToggleWatchLater}
                        onAddToPlaylist={(m) => setPlaylistTargetMovie(m)}
                        isWatchLater={watchLaterIds.includes(movie.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Curated Movie Sections */
              <div className="space-y-6">
                {/* 1. Trending Now Section */}
                <MovieCarousel
                  title="Trending"
                  subtitle="What people are watching this week"
                  badgeText="Trending"
                  movies={trendingMovies}
                  onPlay={handlePlayMovie}
                  onSelect={handleSelectMovie}
                  onToggleWatchLater={handleToggleWatchLater}
                  onAddToPlaylist={(m) => setPlaylistTargetMovie(m)}
                  watchLaterIds={watchLaterIds}
                />

                {/* 2. Popular Titles */}
                <MovieCarousel
                  title="Popular"
                  subtitle="The most popular titles right now"
                  badgeText="Popular"
                  movies={popularMovies}
                  onPlay={handlePlayMovie}
                  onSelect={handleSelectMovie}
                  onToggleWatchLater={handleToggleWatchLater}
                  onAddToPlaylist={(m) => setPlaylistTargetMovie(m)}
                  watchLaterIds={watchLaterIds}
                />

                {/* 3. Bengali Movies (Dhallywood & Tollywood) */}
                <MovieCarousel
                  title="Bangla Cinema Spotlight"
                  subtitle="Dhallywood & Tollywood hits"
                  badgeText="Bangla"
                  movies={bengaliMovies}
                  onPlay={handlePlayMovie}
                  onSelect={handleSelectMovie}
                  onToggleWatchLater={handleToggleWatchLater}
                  onAddToPlaylist={(m) => setPlaylistTargetMovie(m)}
                  watchLaterIds={watchLaterIds}
                />

                {/* 4. Hindi / Bollywood Cinema */}
                <MovieCarousel
                  title="Bollywood & Hindi Hits"
                  subtitle="Action, romance & drama"
                  movies={hindiMovies}
                  onPlay={handlePlayMovie}
                  onSelect={handleSelectMovie}
                  onToggleWatchLater={handleToggleWatchLater}
                  onAddToPlaylist={(m) => setPlaylistTargetMovie(m)}
                  watchLaterIds={watchLaterIds}
                />

                {/* 5. Hollywood / English Cinema */}
                <MovieCarousel
                  title="Hollywood Blockbusters"
                  subtitle="Oscar winners & international cinema"
                  movies={englishMovies}
                  onPlay={handlePlayMovie}
                  onSelect={handleSelectMovie}
                  onToggleWatchLater={handleToggleWatchLater}
                  onAddToPlaylist={(m) => setPlaylistTargetMovie(m)}
                  watchLaterIds={watchLaterIds}
                />

                {/* 6. South Indian Cinema */}
                <MovieCarousel
                  title="South Indian Hits"
                  subtitle="Tamil & Telugu spectacles"
                  movies={southIndianMovies}
                  onPlay={handlePlayMovie}
                  onSelect={handleSelectMovie}
                  onToggleWatchLater={handleToggleWatchLater}
                  onAddToPlaylist={(m) => setPlaylistTargetMovie(m)}
                  watchLaterIds={watchLaterIds}
                />

                {/* 7. Web Series & Shows */}
                <MovieCarousel
                  title="Web Series & Shows"
                  subtitle="Binge-worthy episodic entertainment"
                  movies={webSeries}
                  onPlay={handlePlayMovie}
                  onSelect={handleSelectMovie}
                  onToggleWatchLater={handleToggleWatchLater}
                  onAddToPlaylist={(m) => setPlaylistTargetMovie(m)}
                  watchLaterIds={watchLaterIds}
                />

                {/* Reference-Matched "Do not want to see ads? Go Premium." section */}
                <GoPremiumSection />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          loadData();
        }}
      />

      {/* Discreet Security Passkey Modal for Admin & Moderator access */}
      <PasskeyModal
        isOpen={isPasskeyOpen}
        onClose={() => setIsPasskeyOpen(false)}
        panelType={passkeyPanelType}
        onSuccess={(adminUser) => {
          setCurrentUser(adminUser);
          setCurrentView('admin');
        }}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        onUploadSuccess={(newMovie) => {
          loadData();
          if (newMovie.isPublished) {
            handleSelectMovie(newMovie);
          } else {
            setCurrentView('dashboard');
            setDashboardTab('uploads');
          }
        }}
        onOpenAuth={() => {
          setAuthInitialTab('login');
          setIsAuthOpen(true);
        }}
      />

      <AddToPlaylistModal
        isOpen={playlistTargetMovie !== null}
        onClose={() => setPlaylistTargetMovie(null)}
        movie={playlistTargetMovie}
        currentUser={currentUser}
        onOpenAuth={() => {
          setPlaylistTargetMovie(null);
          setAuthInitialTab('login');
          setIsAuthOpen(true);
        }}
      />

      <DMCAComplaintModal
        isOpen={isDmcaOpen}
        onClose={() => setIsDmcaOpen(false)}
        targetMovie={dmcaTargetMovie}
      />

      {/* Reference-Matched Footer with Discreet Bottom Admin & Moderator Passkey Access */}
      <Footer
        onNavigateHome={() => handleNavigateNav('home')}
        onNavigateMovies={() => handleNavigateNav('movies')}
        onNavigateBrowse={() => handleNavigateNav('browse')}
        onNavigatePremium={() => handleNavigateNav('premium')}
        onOpenUpload={() => {
          if (!currentUser) {
            setAuthInitialTab('login');
            setIsAuthOpen(true);
          } else {
            setIsUploadOpen(true);
          }
        }}
        onOpenDashboard={() => {
          if (!currentUser) {
            setAuthInitialTab('login');
            setIsAuthOpen(true);
          } else {
            setCurrentView('dashboard');
            setDashboardTab('uploads');
          }
        }}
        onOpenDmca={() => {
          setDmcaTargetMovie(null);
          setIsDmcaOpen(true);
        }}
        onOpenPasskeyModal={handleOpenPasskeyModal}
      />
    </div>
  );
}
