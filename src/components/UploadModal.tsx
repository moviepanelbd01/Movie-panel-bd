import React, { useState } from 'react';
import {
  X,
  Upload,
  Film,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  FileVideo,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Movie, User } from '../types/index.ts';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUploadSuccess: (movie: Movie) => void;
  onOpenAuth: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUploadSuccess,
  onOpenAuth,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState<string[]>(['Action', 'Thriller']);
  const [language, setLanguage] = useState('Bengali');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [quality, setQuality] = useState<'480p' | '720p' | '1080p' | '4K'>('1080p');
  const [duration, setDuration] = useState('2h 10m');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [tags, setTags] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [category, setCategory] = useState('Movies');
  const [posterUrl, setPosterUrl] = useState('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
  const [copyrightAuthorized, setCopyrightAuthorized] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
          <Film className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="font-display font-bold text-lg text-white">
            Sign In Required
          </h3>
          <p className="text-xs text-zinc-400">
            Please sign in to upload your authorized movie content and manage video streams on MOVIE PANEL BD.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Sign In Now
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const res = await api.uploadFile(file);
      if (type === 'poster') {
        setPosterUrl(res.url);
      } else {
        setVideoUrl(res.url);
      }
    } catch (err: any) {
      setError(`File upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setError(null);
    if (!title.trim()) {
      setError('Movie title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!videoUrl.trim()) {
      setError('Video file or stream URL is required.');
      return;
    }
    if (!copyrightAuthorized) {
      setError('You must certify that you own or are legally authorized to distribute this content.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    // Realistic upload progress simulation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 20;
      });
    }, 300);

    try {
      const res = await api.createMovie({
        title,
        description,
        poster: posterUrl,
        thumbnail: posterUrl,
        backdrop: posterUrl,
        videoUrl,
        trailerUrl,
        genre,
        language,
        releaseYear,
        quality,
        duration,
        director,
        cast: cast ? cast.split(',').map((s) => s.trim()) : [],
        tags: tags ? tags.split(',').map((s) => s.trim()) : [],
        category,
        isDraft,
      });

      setUploadProgress(100);
      clearInterval(interval);

      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(res.movie);
        onClose();
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      setError(err.message || 'Upload failed. Please try again.');
    }
  };

  const genreOptions = [
    'Action',
    'Drama',
    'Thriller',
    'Crime',
    'Mystery',
    'Romance',
    'Comedy',
    'Sci-Fi',
    'Horror',
    'Adventure',
    'Animation',
    'Documentary',
  ];

  const sampleDemoStreams = [
    { name: '4K Tears of Steel (Sci-Fi / Action)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { name: '4K Sintel (Fantasy / Drama)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    { name: '1080p Big Buck Bunny (Animated)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { name: '1080p Elephants Dream (Sci-Fi)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#12141c] border border-white/10 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-500 rounded-xl border border-red-600/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Upload Authorized Movie
              </h2>
              <p className="text-xs text-zinc-400">
                Publish high definition movies & series to MOVIE PANEL BD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Form */}
        <div className="space-y-4 text-xs">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1">
                Movie Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Priyotoma 2 or Cyber Dhaka"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              >
                <option value="Movies">Movies</option>
                <option value="Web Series">Web Series</option>
                <option value="TV Shows">TV Shows</option>
                <option value="Animated">Animated</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Description & Synopsis *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a compelling overview of the storyline, theme, and cinematic highlights..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 leading-relaxed"
            />
          </div>

          {/* Language, Quality, Year, Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              >
                <option value="Bengali">Bengali</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Korean">Korean</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              >
                <option value="4K">4K Ultra HD</option>
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Release Year
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2h 15m"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Director & Cast */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Director
              </label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="e.g. Raihan Rafi, Amitabh Reza"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Cast (Comma separated)
              </label>
              <input
                type="text"
                value={cast}
                onChange={(e) => setCast(e.target.value)}
                placeholder="e.g. Shakib Khan, Chanchal Chowdhury"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Genres selection */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">
              Select Genres
            </label>
            <div className="flex flex-wrap gap-1.5">
              {genreOptions.map((g) => {
                const isSelected = genre.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setGenre(genre.filter((item) => item !== g));
                      } else {
                        setGenre([...genre, g]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Stream Source */}
          <div className="space-y-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
            <label className="block text-zinc-300 font-semibold">
              Video File / Stream Source *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Direct MP4 video URL or CDN stream..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs font-mono"
              />

              {/* Or Pick high-speed sample open movie stream */}
              <div className="pt-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">
                  Or pick a certified high-speed open cinema stream:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {sampleDemoStreams.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => setVideoUrl(sample.url)}
                      className={`px-2.5 py-1.5 rounded text-left truncate border transition-colors ${
                        videoUrl === sample.url
                          ? 'border-red-600 bg-red-950/40 text-red-400 font-medium'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Or Upload file from computer */}
              <div className="pt-1 flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer transition-colors">
                  <FileVideo className="w-3.5 h-3.5" />
                  <span>Upload Local Video File</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Poster & Thumbnail image */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-zinc-300 font-semibold">
                Poster Image URL / Upload
              </label>
              <input
                type="text"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs"
              />
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer transition-colors mt-1">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Poster File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'poster')}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex justify-center">
              <img
                src={posterUrl}
                alt="Preview"
                className="w-20 h-28 object-cover rounded-lg border border-zinc-700 shadow"
              />
            </div>
          </div>

          {/* Copyright certification */}
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="copyrightCheck"
              checked={copyrightAuthorized}
              onChange={(e) => setCopyrightAuthorized(e.target.checked)}
              className="mt-0.5 accent-red-600 rounded cursor-pointer"
            />
            <label htmlFor="copyrightCheck" className="text-[11px] text-zinc-300 leading-normal cursor-pointer">
              <span className="font-bold text-white">Content Rights Certification: </span>
              I certify that I am the author, distributor, or legal copyright holder authorized to publish and stream this video content on MOVIE PANEL BD in accordance with DMCA and local intellectual property laws.
            </label>
          </div>

          {/* Upload Progress Bar if active */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Processing & Publishing Video...</span>
                <span className="font-mono text-red-500 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isUploading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isUploading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{currentUser?.role === 'admin' ? 'Publish Immediately' : 'Submit for Review'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
