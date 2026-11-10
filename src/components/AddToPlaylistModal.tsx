import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ListVideo } from 'lucide-react';
import { Movie, Playlist, User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  movie,
  currentUser,
  onOpenAuth,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      api.getPlaylists()
        .then((res) => setPlaylists(res.playlists))
        .catch(() => {});
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !movie) return null;

  if (!currentUser) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#12141c] border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center space-y-4"
        >
          <ListVideo className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="font-display font-bold text-base text-white">
            Sign In to Save Playlists
          </h3>
          <p className="text-xs text-zinc-400">
            Sign in to create custom movie collections and watch lists.
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const handleToggleMovieInPlaylist = async (playlist: Playlist) => {
    const hasMovie = playlist.movieIds.includes(movie.id);
    try {
      if (hasMovie) {
        const res = await api.removeMovieFromPlaylist(playlist.id, movie.id);
        setPlaylists((prev) => prev.map((p) => (p.id === playlist.id ? res.playlist : p)));
      } else {
        const res = await api.addMovieToPlaylist(playlist.id, movie.id);
        setPlaylists((prev) => prev.map((p) => (p.id === playlist.id ? res.playlist : p)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      const res = await api.createPlaylist(newTitle.trim());
      // Immediately add this movie to the newly created playlist
      const updated = await api.addMovieToPlaylist(res.playlist.id, movie.id);
      setPlaylists((prev) => [...prev, updated.playlist]);
      setNewTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#12141c] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-xs"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="font-display font-bold text-sm text-white">
            Save to Playlist
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Playlists list with checkboxes */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {playlists.length === 0 ? (
            <p className="text-zinc-500 py-4 text-center">No playlists created yet.</p>
          ) : (
            playlists.map((pl) => {
              const checked = pl.movieIds.includes(movie.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => handleToggleMovieInPlaylist(pl)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer text-left"
                >
                  <span className="font-semibold text-white truncate pr-2">
                    {pl.title}
                  </span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      checked
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'border-zinc-700 bg-zinc-800'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Create new playlist input */}
        <form onSubmit={handleCreateNew} className="pt-2 border-t border-zinc-800 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New playlist name..."
            className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || loading}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
};
