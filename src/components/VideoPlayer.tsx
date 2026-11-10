import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Settings,
  Subtitles,
  PictureInPicture,
  Maximize2,
  SkipForward,
  Keyboard,
  Check,
} from 'lucide-react';
import { Movie } from '../types/index.ts';
import { formatSecondsToTime } from '../utils/movieLogic.ts';
import { api } from '../services/api.ts';

interface VideoPlayerProps {
  movie: Movie;
  onNext?: () => void;
  isTheaterMode: boolean;
  onToggleTheaterMode: () => void;
  initialTime?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movie,
  onNext,
  isTheaterMode,
  onToggleTheaterMode,
  initialTime = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('Off');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
      }
    }, 3500);
  };

  // Record view on initial mount
  useEffect(() => {
    api.recordView(movie.id).catch(() => {});
  }, [movie.id]);

  // Set initial resume time if available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialTime > 0 && initialTime < video.duration - 5) {
        video.currentTime = initialTime;
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [initialTime, movie.id]);

  // Save resume progress to server every 5 seconds
  useEffect(() => {
    if (!isPlaying || currentTime <= 0 || duration <= 0) return;

    const interval = setInterval(() => {
      api.recordHistoryProgress(movie.id, Math.floor(currentTime), Math.floor(duration)).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, movie.id]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported or failed:', err);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in comments or inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          onToggleTheaterMode();
          break;
        case 'm':
          e.preventDefault();
          setIsMuted((prev) => {
            video.muted = !prev;
            return !prev;
          });
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.min(1, prev + 0.1);
            video.volume = next;
            return next;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.max(0, prev - 0.1);
            video.volume = next;
            return next;
          });
          break;
        case '?':
          setShowShortcutsModal((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, onToggleTheaterMode]);

  // Video Time & Buffer Update
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    if (video.buffered.length > 0) {
      setBufferedEnd(video.buffered.end(video.buffered.length - 1));
    }
  };

  // Seek bar scrub
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || duration <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const handleSeekHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      className={`relative bg-black rounded-2xl overflow-hidden select-none group/player transition-all duration-300 shadow-2xl ${
        isTheaterMode ? 'w-full h-[680px]' : 'w-full aspect-16/9 max-h-[640px]'
      }`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={movie.videoUrl}
        poster={movie.backdrop || movie.poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (onNext) onNext();
        }}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Subtitles Overlay Simulation if enabled */}
      {selectedSubtitle !== 'Off' && isPlaying && (
        <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none px-6 z-20">
          <span className="inline-block bg-black/80 text-yellow-300 px-3 py-1 rounded text-sm md:text-base font-semibold tracking-wide shadow-md">
            {selectedSubtitle === 'English'
              ? `[Dialogue in ${movie.language}]: ${movie.title} - Playing in ${selectedQuality}`
              : selectedSubtitle === 'Bengali'
              ? `[সংলাপ - ${movie.language}]: ${movie.title} চলছে ${selectedQuality} কোয়ালিটিতে`
              : `[संवाद - ${movie.language}]: ${movie.title} ${selectedQuality} में प्रसारित`}
          </span>
        </div>
      )}

      {/* Big Play/Pause Center Indicator */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer z-20"
          aria-label="Play Video"
        >
          <Play className="w-10 h-10 fill-white translate-x-0.5" />
        </button>
      )}

      {/* Top Overlay: Title & Shortcuts Help */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-base md:text-lg drop-shadow">
            {movie.title}
          </span>
          <span className="text-xs text-red-500 font-black uppercase px-2 py-0.5 bg-red-950/60 border border-red-900/60 rounded">
            {selectedQuality}
          </span>
        </div>

        <button
          onClick={() => setShowShortcutsModal(true)}
          className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber / Seek Bar with buffered and hover preview */}
        <div
          onClick={handleSeek}
          onMouseMove={handleSeekHover}
          onMouseLeave={() => setHoverTime(null)}
          className="relative w-full h-1.5 hover:h-3 bg-white/20 rounded-full cursor-pointer transition-all mb-3 group/seek"
        >
          {/* Buffered Bar */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full pointer-events-none"
            style={{ width: `${duration > 0 ? (bufferedEnd / duration) * 100 : 0}%` }}
          />

          {/* Progress Bar */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-red-600 rounded-full pointer-events-none"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />

          {/* Scrubber thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-red-600 rounded-full shadow-md scale-0 group-hover/seek:scale-100 transition-transform pointer-events-none"
            style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 7px)` }}
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-mono rounded shadow pointer-events-none border border-zinc-700"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatSecondsToTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Lower Row Controls */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Next Video */}
            {onNext && (
              <button
                onClick={onNext}
                className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
                title="Next Movie"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Seek -10s / +10s */}
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
              title="Rewind 10s (J)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime += 10;
              }}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
              title="Forward 10s (L)"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (!video) return;
                  video.muted = !isMuted;
                  setIsMuted(!isMuted);
                }}
                className="p-1 text-zinc-300 hover:text-white cursor-pointer"
                aria-label="Mute / Unmute"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-500" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  setIsMuted(val === 0);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    videoRef.current.muted = val === 0;
                  }
                }}
                className="w-14 sm:w-20 accent-red-600 h-1 bg-white/20 rounded cursor-pointer"
                aria-label="Volume slider"
              />
            </div>

            {/* Time Stamp */}
            <div className="font-mono text-xs text-zinc-400 ml-1">
              <span className="text-white">{formatSecondsToTime(currentTime)}</span> /{' '}
              <span>{formatSecondsToTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 relative">
            {/* Subtitles Button */}
            <div className="relative">
              <button
                onClick={() => {
                  const nextSub = selectedSubtitle === 'Off' ? 'English' : selectedSubtitle === 'English' ? 'Bengali' : selectedSubtitle === 'Bengali' ? 'Hindi' : 'Off';
                  setSelectedSubtitle(nextSub);
                }}
                className={`p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedSubtitle !== 'Off' ? 'text-amber-400 font-bold' : 'text-zinc-400'
                }`}
                title={`Subtitles: ${selectedSubtitle}`}
              >
                <Subtitles className="w-4 h-4" />
                <span className="text-[10px] hidden md:inline">{selectedSubtitle}</span>
              </button>
            </div>

            {/* Settings Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                title="Settings (Speed, Quality)"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings Dropdown */}
              {showSettingsMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  {/* Quality Selector */}
                  <div className="p-2 border-b border-zinc-800">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5">
                      Quality Resolution
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {['4K', '1080p', '720p', '480p'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setSelectedQuality(q);
                            setShowSettingsMenu(false);
                          }}
                          className={`px-2 py-1 rounded text-left flex items-center justify-between transition-colors ${
                            selectedQuality === q
                              ? 'bg-red-600 text-white font-bold'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          <span>{q}</span>
                          {selectedQuality === q && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speed Selector */}
                  <div className="p-2">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5">
                      Playback Speed
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleSpeedChange(s);
                            setShowSettingsMenu(false);
                          }}
                          className={`px-1.5 py-1 rounded text-center transition-colors ${
                            playbackSpeed === s
                              ? 'bg-red-600 text-white font-bold'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
              title="Picture in Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Theater Mode Toggle */}
            <button
              onClick={onToggleTheaterMode}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer hidden md:block ${
                isTheaterMode ? 'text-red-500' : 'text-zinc-400 hover:text-white'
              }`}
              title="Theater Mode (T)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          onClick={() => setShowShortcutsModal(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-display font-bold text-sm text-white">
                Player Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-zinc-300">
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span>Play / Pause</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">Space or K</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span>Toggle Fullscreen</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">F</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span>Theater Mode</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">T</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span>Mute / Unmute</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">M</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span>Seek ±10 Seconds</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">← / → or J / L</kbd>
              </div>
              <div className="flex justify-between py-1">
                <span>Volume Up / Down</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono">↑ / ↓</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
