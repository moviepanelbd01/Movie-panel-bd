import React from 'react';
import { Movie } from '../types/index.ts';

interface CategoryPillsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  movies: Movie[];
  onSeeAll?: () => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  activeCategory,
  onSelectCategory,
  movies,
  onSeeAll,
}) => {
  const categoryDefs = [
    { id: 'all', label: 'All', query: 'all' },
    { id: 'action', label: 'Action', query: 'action' },
    { id: 'comedy', label: 'Comedy', query: 'comedy' },
    { id: 'drama', label: 'Drama', query: 'drama' },
    { id: 'thriller', label: 'Thriller', query: 'thriller' },
    { id: 'romance', label: 'Romance', query: 'romance' },
    { id: 'horror', label: 'Horror', query: 'horror' },
    { id: 'scifi', label: 'Sci-Fi', query: 'sci-fi' },
    { id: 'animation', label: 'Animation', query: 'animation' },
    { id: 'documentary', label: 'Documentary', query: 'documentary' },
    { id: 'bangla', label: 'Bangla Movie', query: 'bengali' },
    { id: 'indian', label: 'Indian Movie', query: 'hindi' },
    { id: 'hollywood', label: 'Hollywood', query: 'english' },
    { id: 'webseries', label: 'Web Series', query: 'web series' },
    { id: 'musicvideo', label: 'Music Video', query: 'music' },
    { id: 'shortfilm', label: 'Short Film', query: 'short' },
    { id: 'others', label: 'Others', query: 'others' },
  ];

  const baselineCounts: Record<string, number> = {
    all: 60,
    action: 24,
    comedy: 12,
    drama: 18,
    thriller: 15,
    romance: 9,
    horror: 6,
    scifi: 8,
    animation: 5,
    documentary: 4,
    bangla: 14,
    indian: 16,
    hollywood: 18,
    webseries: 8,
    musicvideo: 4,
    shortfilm: 6,
    others: 2,
  };

  // Helper to compute count of movies matching each pill
  const getCount = (query: string): number => {
    if (movies.length === 0) {
      return baselineCounts[query] || 0;
    }
    if (query === 'all') return movies.length;
    const lower = query.toLowerCase();
    const matches = movies.filter((m) => {
      const matchGenre = m.genre?.some((g) => g.toLowerCase().includes(lower));
      const matchLanguage = m.language?.toLowerCase().includes(lower);
      const matchCat = m.category?.toLowerCase().includes(lower);
      const matchTitle = m.title?.toLowerCase().includes(lower);
      return matchGenre || matchLanguage || matchCat || matchTitle;
    }).length;
    return matches > 0 ? matches : (baselineCounts[query] || 0);
  };

  return (
    <div className="w-full my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Browse by category
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            See all
          </button>
        )}
      </div>

      {/* Horizontal scrolling pill buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryDefs.map((cat) => {
          const isSelected = activeCategory === cat.query;
          const count = getCount(cat.query);

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.query)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-black/25 text-white' : 'text-neutral-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
