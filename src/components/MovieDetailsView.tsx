import React, { useState, useEffect } from 'react';
import {
  Play,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Check,
  Share2,
  Plus,
  Star,
  Eye,
  Calendar,
  Clock,
  Globe,
  Film,
  Send,
  Trash2,
  Heart,
  ShieldAlert,
  ArrowLeft,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Movie, User, Comment } from '../types/index.ts';
import { VideoPlayer } from './VideoPlayer.tsx';
import { MovieCard } from './MovieCard.tsx';
import { formatViews, getRecommendedMovies } from '../utils/movieLogic.ts';
import { api } from '../services/api.ts';

interface MovieDetailsViewProps {
  movie: Movie;
  allMovies: Movie[];
  currentUser: User | null;
  onBack: () => void;
  onSelectMovie: (movie: Movie) => void;
  onOpenAuth: () => void;
  onOpenPlaylistModal: (movie: Movie) => void;
  onOpenDMCA: (movie: Movie) => void;
}

export const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({
  movie: initialMovie,
  allMovies,
  currentUser,
  onBack,
  onSelectMovie,
  onOpenAuth,
  onOpenPlaylistModal,
  onOpenDMCA,
}) => {
  const [movie, setMovie] = useState<Movie>(initialMovie);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  // Sync state on movie change
  useEffect(() => {
    setMovie(initialMovie);
    setIsPlaying(false);

    // Fetch movie details and comments from API
    api.getMovieById(initialMovie.id)
      .then((res) => {
        setMovie(res.movie);
        setUserVote(res.userVote);
        setIsWatchLater(res.isWatchLater);
        setIsSubscribed(res.isSubscribedToUploader);
      })
      .catch(() => {});

    api.getComments(initialMovie.id)
      .then((res) => setComments(res.comments))
      .catch(() => {});
  }, [initialMovie.id]);

  // Handle Like / Dislike
  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const res = await api.voteMovie(movie.id, voteType);
      setMovie((prev) => ({
        ...prev,
        likes: res.likes,
        dislikes: res.dislikes,
      }));
      setUserVote(res.userVote);
    } catch (err: any) {
      console.error('Vote failed:', err);
    }
  };

  // Handle Watch Later
  const handleToggleWatchLater = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const res = await api.toggleWatchLater(movie.id);
      setIsWatchLater(res.isAdded);
    } catch (err) {
      console.error('Toggle watch later failed:', err);
    }
  };

  // Handle Creator Subscribe
  const handleToggleSubscribe = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const res = await api.toggleSubscription(movie.uploadedBy);
      setIsSubscribed(res.isSubscribed);
      setSubscribersCount(res.subscribersCount);
    } catch (err) {
      console.error('Subscribe failed:', err);
    }
  };

  // Handle Post Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      const res = await api.postComment(movie.id, newCommentText.trim());
      setComments((prev) => [res.comment, ...prev]);
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  // Handle Like Comment
  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const res = await api.likeComment(commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? res.comment : c))
      );
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Delete comment failed:', err);
    }
  };

  // Copy share URL
  const handleCopyLink = () => {
    const url = window.location.origin + `?movie=${movie.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Recommendations
  const relatedMovies = getRecommendedMovies(allMovies, movie, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-16">
      {/* Navigation Breadcrumb / Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to browse</span>
      </button>

      {/* Main Video Surface & Player */}
      <div className="mb-6">
        {isPlaying ? (
          <VideoPlayer
            movie={movie}
            isTheaterMode={isTheaterMode}
            onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
          />
        ) : (
          <div className="relative w-full aspect-16/9 max-h-[580px] rounded-2xl overflow-hidden bg-zinc-950 group/backdrop shadow-2xl">
            <img
              src={movie.backdrop || movie.poster}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80 group-hover/backdrop:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-20 h-20 md:w-24 md:h-24 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer"
                aria-label="Play Movie"
              >
                <Play className="w-10 h-10 md:w-12 md:h-12 fill-white translate-x-1" />
              </button>
              <div>
                <h1 className="font-display text-2xl md:text-4xl font-black text-white">
                  {movie.title}
                </h1>
                <p className="text-xs md:text-sm text-zinc-300 mt-1 font-medium">
                  Click to stream full movie in {movie.quality} UHD
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Main Details + Sidebar Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Info, Creator, Actions, Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Info Block */}
          <div className="space-y-3 pb-5 border-b border-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                  {movie.title}
                </h1>
                {/* Metadata row: unboxed clean text with separators */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                  <span className="text-red-500 font-bold uppercase">{movie.quality}</span>
                  <span>·</span>
                  <span>{movie.releaseYear}</span>
                  <span>·</span>
                  <span>{movie.duration}</span>
                  <span>·</span>
                  <span>{movie.language}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {movie.rating.toFixed(1)} ({movie.ratingCount.toLocaleString()} votes)
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">{formatViews(movie.views)} views</span>
                </div>
              </div>

              {/* Action Buttons: Like, Dislike, Watchlist, Playlist, Share */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Like / Dislike cluster */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleVote('like')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      userVote === 'like'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{movie.likes}</span>
                  </button>
                  <div className="w-px h-4 bg-zinc-800" />
                  <button
                    onClick={() => handleVote('dislike')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      userVote === 'dislike'
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{movie.dislikes}</span>
                  </button>
                </div>

                {/* Watch Later */}
                <button
                  onClick={handleToggleWatchLater}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    isWatchLater
                      ? 'bg-amber-400/20 border-amber-400/40 text-amber-400'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                  }`}
                >
                  {isWatchLater ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isWatchLater ? 'Saved' : 'Watch Later'}</span>
                </button>

                {/* Add to Playlist */}
                <button
                  onClick={() => onOpenPlaylistModal(movie)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Playlist</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs transition-colors cursor-pointer"
                  title="Share Movie"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Creator Attribution & Subscribe Strip */}
          <div className="flex items-center justify-between p-4 bg-[#12141c] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <img
                src={movie.uploaderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={movie.uploaderName}
                className="w-11 h-11 rounded-full object-cover border border-red-600/30"
              />
              <div>
                <p className="font-display font-bold text-sm text-white">
                  {movie.uploaderName}
                </p>
                <p className="text-xs text-zinc-400">
                  Creator & Film Distributor · {subscribersCount > 0 ? subscribersCount.toLocaleString() : '88.2K'} subscribers
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleSubscribe}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSubscribed
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Synopsis & Cast & Crew */}
          <div className="space-y-4 p-5 bg-[#12141c] rounded-xl border border-white/5">
            <div>
              <h3 className="font-display font-bold text-sm text-white mb-1.5">
                Overview & Storyline
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                {movie.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-800/80 text-xs">
              <div>
                <span className="text-zinc-500 font-semibold block mb-0.5">Director</span>
                <span className="text-white font-medium">{movie.director}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block mb-0.5">Genres</span>
                <span className="text-zinc-300 font-medium">{movie.genre.join(', ')}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-zinc-500 font-semibold block mb-0.5">Starring Cast</span>
                <span className="text-zinc-300 font-medium">{movie.cast.join(' · ')}</span>
              </div>
              {movie.tags && movie.tags.length > 0 && (
                <div className="md:col-span-2">
                  <span className="text-zinc-500 font-semibold block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Copyright disclaimer & report button */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-400">
              <span>Authorized Content on MOVIE PANEL BD</span>
              <button
                onClick={() => onOpenDMCA(movie)}
                className="flex items-center gap-1 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Submit Copyright Complaint</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 p-5 bg-[#12141c] rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">
                Discussion & Comments ({comments.length})
              </h3>
            </div>

            {/* Post comment input */}
            <form onSubmit={handlePostComment} className="flex gap-3">
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={
                    currentUser
                      ? 'Add a public comment or review...'
                      : 'Sign in to join the conversation...'
                  }
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Post</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-3 divide-y divide-zinc-800/40">
              {comments.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">
                  No comments yet. Be the first to share your review!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="pt-3 flex gap-3 text-xs">
                    <img
                      src={comment.userAvatar}
                      alt={comment.username}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          @{comment.username}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-xs leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                            currentUser && comment.likedBy?.includes(currentUser.id)
                              ? 'text-red-500 font-bold'
                              : ''
                          }`}
                        >
                          <Heart className="w-3 h-3" />
                          <span>{comment.likes || 0}</span>
                        </button>
                        {(currentUser?.id === comment.userId ||
                          currentUser?.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Related & Recommended Movies */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-base text-white">
            Recommended For You
          </h3>
          <div className="space-y-3">
            {relatedMovies.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectMovie(rel)}
                className="flex gap-3 p-2 bg-[#12141c] hover:bg-[#1a1c26] rounded-xl border border-white/5 hover:border-red-600/30 transition-all cursor-pointer group"
              >
                <img
                  src={rel.poster}
                  alt={rel.title}
                  className="w-20 h-28 object-cover rounded-lg shrink-0"
                />
                <div className="flex flex-col justify-between py-1 min-w-0">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white group-hover:text-red-500 transition-colors truncate">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {rel.releaseYear} · {rel.language}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {rel.genre.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-amber-400 font-semibold">★ {rel.rating}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400">{formatViews(rel.views)} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-display font-bold text-sm text-white">
                Share "{movie.title}"
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-zinc-300">
              Copy link to stream this film directly on MOVIE PANEL BD:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.origin + `?movie=${movie.id}`}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
