import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types/index.ts';
import { MovieCard } from './MovieCard.tsx';

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onSelect: (movie: Movie) => void;
  onToggleWatchLater?: (movie: Movie) => void;
  onAddToPlaylist?: (movie: Movie) => void;
  watchLaterIds?: string[];
  badgeText?: string;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  subtitle,
  movies,
  onPlay,
  onSelect,
  onToggleWatchLater,
  onAddToPlaylist,
  watchLaterIds = [],
  badgeText,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="relative mb-8 group/carousel">
      {/* Header */}
      <div className="flex items-end justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-lg md:text-xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {badgeText && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded">
              {badgeText}
            </span>
          )}
          {subtitle && (
            <span className="hidden sm:inline text-xs text-zinc-400">
              · {subtitle}
            </span>
          )}
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="w-44 sm:w-52 md:w-56 shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <MovieCard
              movie={movie}
              onPlay={onPlay}
              onSelect={onSelect}
              onToggleWatchLater={onToggleWatchLater}
              onAddToPlaylist={onAddToPlaylist}
              isWatchLater={watchLaterIds.includes(movie.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
