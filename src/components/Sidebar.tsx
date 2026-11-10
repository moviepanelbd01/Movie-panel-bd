import React from 'react';
import {
  Home,
  Flame,
  Film,
  Sparkles,
  Globe,
  Tv,
  Clapperboard,
  PlaySquare,
  Ghost,
  Layers,
  Radio,
  History,
  Bookmark,
  ListVideo,
  Upload,
  Shield,
  FileText,
  HelpCircle,
  X,
  Star,
} from 'lucide-react';
import { User } from '../types/index.ts';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  currentUser: User | null;
  onOpenDashboard: (tab: string) => void;
  onOpenAdmin: () => void;
  onOpenUpload: () => void;
  onOpenDMCA: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
  currentUser,
  onOpenDashboard,
  onOpenAdmin,
  onOpenUpload,
  onOpenDMCA,
}) => {
  const mainNav = [
    { label: 'Home', value: 'all', icon: Home },
    { label: 'Trending Now', value: 'trending', icon: Flame },
    { label: 'Top Rated', value: 'top-rated', icon: Star },
  ];

  const categories = [
    { label: 'Bengali Movies', value: 'Bengali', icon: Flame },
    { label: 'Hindi Movies', value: 'Hindi', icon: Sparkles },
    { label: 'English Movies', value: 'English', icon: Globe },
    { label: 'Tamil Movies', value: 'Tamil', icon: Tv },
    { label: 'Telugu Movies', value: 'Telugu', icon: Clapperboard },
    { label: 'Korean Movies', value: 'Korean', icon: PlaySquare },
    { label: 'Animated Movies', value: 'Animated', icon: Ghost },
    { label: 'Web Series', value: 'Web Series', icon: Layers },
    { label: 'TV Shows', value: 'TV Shows', icon: Radio },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-50 w-64 bg-[#0e1017] border-r border-neutral-800 overflow-y-auto transition-transform duration-200 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full space-y-6">
          {/* Main Links */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Discover
            </p>
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    onSelectCategory(item.value);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Categories */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Movie Categories
            </p>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    onSelectCategory(cat.value);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-red-600/90 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Library */}
          {currentUser && (
            <div className="space-y-1 border-t border-zinc-800/80 pt-4">
              <p className="px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                My Library
              </p>
              <button
                onClick={() => {
                  onOpenDashboard('history');
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>Watch History</span>
              </button>
              <button
                onClick={() => {
                  onOpenDashboard('watchlater');
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Watch Later</span>
              </button>
              <button
                onClick={() => {
                  onOpenDashboard('playlists');
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <ListVideo className="w-3.5 h-3.5" />
                <span>My Playlists</span>
              </button>
              <button
                onClick={() => {
                  onOpenDashboard('uploads');
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <Film className="w-3.5 h-3.5" />
                <span>My Uploaded Movies</span>
              </button>
            </div>
          )}

          {/* Admin & Copyright Controls */}
          <div className="space-y-1 border-t border-zinc-800/80 pt-4">
            <p className="px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Platform & Legal
            </p>

            {(currentUser?.role === 'admin' || currentUser?.role === 'moderator') && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-amber-400 hover:bg-amber-400/10 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenDMCA();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 transition-colors text-left"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>DMCA & Copyright</span>
            </button>
          </div>

          {/* Quick Footer inside sidebar */}
          <div className="mt-auto pt-4 border-t border-zinc-800/60 text-[11px] text-zinc-400 space-y-2">
            <p className="font-semibold text-zinc-300">MOVIE PANEL BD</p>
            <p className="text-[10px] leading-tight">
              A premier Bengali & global movie streaming platform. © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
