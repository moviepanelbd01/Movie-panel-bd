import React from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import { WebsiteSettings } from '../types/index.ts';

interface AdBannerProps {
  settings?: WebsiteSettings | null;
}

export const AdBanner: React.FC<AdBannerProps> = ({ settings }) => {
  if (!settings || !settings.bannerAdEnabled) return null;

  return (
    <div className="w-full mb-8 rounded-xl overflow-hidden bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-900 border border-red-900/30 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="p-2 bg-red-600/20 text-red-500 rounded-lg shrink-0 border border-red-600/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 block mb-0.5">
            Sponsored Premiere · MOVIE PANEL BD
          </span>
          <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
            {settings.bannerAdText || 'Special Weekend Premiere: Stream the highest-grossing Bengali blockbusters in 4K UHD!'}
          </p>
        </div>
      </div>

      <a
        href={settings.bannerAdLink || '#'}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1.5 shadow-md"
      >
        <span>Explore Collection</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
