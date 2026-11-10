import React from 'react';
import { Shield, Lock, Send, Sparkles, Film, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateMovies: () => void;
  onNavigateBrowse: () => void;
  onNavigatePremium: () => void;
  onOpenUpload: () => void;
  onOpenDashboard: () => void;
  onOpenDmca: () => void;
  onOpenPasskeyModal: (panelType: 'admin' | 'moderator') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateMovies,
  onNavigateBrowse,
  onNavigatePremium,
  onOpenUpload,
  onOpenDashboard,
  onOpenDmca,
  onOpenPasskeyModal,
}) => {
  return (
    <footer className="w-full bg-[#0d0e12] border-t border-neutral-800/80 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <img
                src="/assets/aistudio/IMG-20261109-WA0021_df2e63fc.jpg"
                alt="Movie Panel BD"
                className="w-10 h-10 object-contain rounded-full shadow-md border border-neutral-700/60 transition-transform group-hover:scale-105"
              />
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg text-white group-hover:text-red-500 transition-colors">
                  MoviePanel
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 rounded uppercase tracking-wider">
                  BD
                </span>
              </div>
            </button>

            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
              বাংলাদেশের ভিডিও শেয়ারিং প্যানেল। মুভি, ক্লিপ আর শো আপলোড করুন আর দেখুন — কোনও কপিরাইট রেস্ট্রিকশন ছাড়াই।
            </p>
            <p className="text-xs text-neutral-500 max-w-md">
              A high-performance cinematic streaming platform for Dhallywood, Tollywood, Bollywood, and international cinema enthusiasts.
            </p>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={onNavigateHome}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateMovies}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Movies
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateBrowse}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Browse all
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenUpload}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Upload a video
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDashboard}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  My videos
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigatePremium}
                  className="text-amber-400/90 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Premium (ad-free)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDmca}
                  className="hover:text-white transition-colors cursor-pointer text-xs text-neutral-500"
                >
                  DMCA & Takedown Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Support Column with Discreet Admin & Moderator Access */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://t.me/danials638"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-red-400 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Admin support</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500" />
                </a>
              </li>

              {/* Password protected bottom entries */}
              <li className="pt-2 border-t border-neutral-800/80">
                <button
                  onClick={() => onOpenPasskeyModal('admin')}
                  className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer text-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Admin panel</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPasskeyModal('moderator')}
                  className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer text-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Moderator panel</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} Movie Panel BD. Uploads are community-contributed — no copyright filtering is applied.
          </p>
          <p className="flex items-center gap-1 text-[11px] text-neutral-500">
            <span>Powered by</span>
            <span className="text-neutral-300 font-medium">MOVIE PANEL BD Cloud</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
