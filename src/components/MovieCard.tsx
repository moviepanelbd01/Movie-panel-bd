import React, { useState } from 'react';
import { Play, Bookmark, Check, Star, Plus, Eye } from 'lucide-react';
import { Movie } from '../types/index.ts';
import { formatViews } from '../utils/movieLogic.ts';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onSelect: (movie: Movie) => void;
  onToggleWatchLater?: (movie: Movie) => void;
  onAddToPlaylist?: (movie: Movie) => void;
  isWatchLater?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlay,
  onSelect,
  onToggleWatchLater,
  onAddToPlaylist,
  isWatchLater = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-[#13151c] rounded-xl overflow-hidden border border-white/5 hover:border-red-600/40 hover:shadow-xl hover:shadow-red-950/20 transition-all duration-300"
    >
      {/* Poster Image Container */}
      <div
        onClick={() => onSelect(movie)}
        className="relative aspect-2/3 w-full overflow-hidden bg-zinc-900 cursor-pointer"
      >
        <img
          src={movie.poster}
          alt={movie.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Fallback container if image fails to load */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs font-semibold">
            <span>{movie.title}</span>
          </div>
        )}

        {/* Quality Badge (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <span className="px-1.5 py-0.5 text-[10px] font-black tracking-wider uppercase bg-red-600 text-white rounded shadow-md">
            {movie.quality}
          </span>
        </div>

        {/* Duration (Top Right) */}
        <div className="absolute top-2 right-2 z-10">
          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-black/75 text-zinc-300 rounded backdrop-blur-xs">
            {movie.duration}
          </span>
        </div>

        {/* Hover Quick Action Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
              title="Play Now"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch</span>
            </button>

            {onToggleWatchLater && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchLater(movie);
                }}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  isWatchLater
                    ? 'bg-amber-400 text-black border-amber-400'
                    : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
                title={isWatchLater ? 'Remove from Watch Later' : 'Watch Later'}
              >
                {isWatchLater ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>
            )}

            {onAddToPlaylist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToPlaylist(movie);
                }}
                className="p-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-xs transition-colors cursor-pointer"
                title="Add to Playlist"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Movie Details Info Block */}
      <div className="p-3 flex flex-col flex-1 justify-between space-y-1.5">
        <div>
          {/* Title */}
          <h2
            onClick={() => onSelect(movie)}
            className="font-display font-bold text-sm text-white hover:text-red-500 transition-colors truncate cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h2>

          {/* Metadata row: unboxed text with subtle separators */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
            <span>{movie.releaseYear}</span>
            <span>·</span>
            <span>{movie.language}</span>
            <span>·</span>
            <span className="truncate">{movie.genre[0]}</span>
          </div>
        </div>

        {/* Rating and Views row */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </span>

          <span className="flex items-center gap-1 tabular-nums text-zinc-400">
            <Eye className="w-3 h-3 text-zinc-500" />
            <span>{formatViews(movie.views)} views</span>
          </span>
        </div>
      </div>
    </div>
  );
};
