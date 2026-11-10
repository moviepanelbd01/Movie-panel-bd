import React, { useState } from 'react';
import { Search, Compass, Upload, Sparkles, Film, Eye, Layers } from 'lucide-react';

interface HeroBannerProps {
  totalMovies: number;
  totalViews: number;
  categoriesCount: number;
  onSearch: (query: string) => void;
  onBrowse: () => void;
  onStartUpload: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalMovies,
  totalViews,
  categoriesCount,
  onSearch,
  onBrowse,
  onStartUpload,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const formattedViews = totalViews >= 1000000
    ? `${(totalViews / 1000000).toFixed(1)}M`
    : totalViews >= 1000
    ? `${(totalViews / 1000).toFixed(1)}K`
    : totalViews.toString();

  return (
    <div className="relative w-full rounded-3xl bg-[#121316] border border-neutral-800/80 p-6 sm:p-10 lg:p-14 overflow-hidden mb-10 shadow-2xl">
      {/* Subtle radial ambient red gradient glow matching reference */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-red-700/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading, Subtitle, Search, Actions, Stats */}
        <div className="lg:col-span-7 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MOVIE PANEL BD</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Unlimited movies, <br />
            <span className="text-red-500">upload & watch.</span>
          </h1>

          {/* Bengali Subtitle matching reference */}
          <p className="text-base sm:text-lg text-neutral-300 font-medium leading-relaxed">
            বাংলাদেশের ভিডিও শেয়ারিং প্যানেল — মুভি, ক্লিপ আর শো আপলোড করুন আর দেখুন।
          </p>

          {/* Hero In-Banner Search */}
          <form onSubmit={handleSubmit} className="relative max-w-xl">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-neutral-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by movie title…"
                aria-label="Search by movie title"
                className="w-full pl-11 pr-28 py-3.5 bg-neutral-900/90 text-sm text-white placeholder-neutral-500 rounded-2xl border border-neutral-700/80 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              onClick={onBrowse}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Browse catalogue</span>
            </button>

            <button
              onClick={onStartUpload}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white font-semibold text-sm rounded-xl border border-neutral-700/80 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Start uploading</span>
            </button>
          </div>

          {/* Dynamic Counters Row */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80 max-w-md">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                Videos
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {totalMovies > 0 ? totalMovies : 60}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                Total views
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {totalViews > 0 ? formattedViews : '388'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                Categories
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {categoriesCount > 0 ? categoriesCount : 12}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: White Card with Official Logo Asset */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xs flex flex-col items-center text-center shadow-xl">
            {/* White rounded card holding the official logo graphic */}
            <div className="w-full aspect-square bg-white rounded-2xl p-4 flex items-center justify-center shadow-2xl overflow-hidden group">
              <img
                src="/assets/aistudio/IMG-20261109-WA0021_df2e63fc.jpg"
                alt="MOVIE PANEL BD Logo"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Caption matching reference site */}
            <p className="text-xs sm:text-sm text-neutral-400 mt-5 leading-relaxed font-medium">
              Sign in to watch and upload — no copyright restrictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
