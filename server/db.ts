import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Movie,
  Comment,
  Playlist,
  WatchHistoryItem,
  WatchLaterItem,
  Notification,
  Category,
  CopyrightReport,
  AdminActivityLog,
  WebsiteSettings,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  movies: Movie[];
  comments: Comment[];
  playlists: Playlist[];
  watchHistory: WatchHistoryItem[];
  watchLater: WatchLaterItem[];
  userVotes: { userId: string; movieId: string; vote: 'like' | 'dislike' }[];
  userRatings: { userId: string; movieId: string; rating: number }[];
  notifications: Notification[];
  categories: Category[];
  reports: CopyrightReport[];
  activityLogs: AdminActivityLog[];
  settings: WebsiteSettings;
}

// Password hashing helpers using native crypto
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verify;
}

// Initial seed categories
const initialCategories: Category[] = [
  { id: 'cat-all', name: 'All Movies', slug: 'all', icon: 'Film', enabled: true, order: 0 },
  { id: 'cat-bengali', name: 'Bengali Movies', slug: 'bengali', icon: 'Flame', enabled: true, order: 1 },
  { id: 'cat-hindi', name: 'Hindi Movies', slug: 'hindi', icon: 'Sparkles', enabled: true, order: 2 },
  { id: 'cat-english', name: 'English Movies', slug: 'english', icon: 'Globe', enabled: true, order: 3 },
  { id: 'cat-tamil', name: 'Tamil Movies', slug: 'tamil', icon: 'Tv', enabled: true, order: 4 },
  { id: 'cat-telugu', name: 'Telugu Movies', slug: 'telugu', icon: 'Clapperboard', enabled: true, order: 5 },
  { id: 'cat-korean', name: 'Korean Movies', slug: 'korean', icon: 'PlaySquare', enabled: true, order: 6 },
  { id: 'cat-animated', name: 'Animated Movies', slug: 'animated', icon: 'Ghost', enabled: true, order: 7 },
  { id: 'cat-webseries', name: 'Web Series', slug: 'webseries', icon: 'Layers', enabled: true, order: 8 },
  { id: 'cat-tvshows', name: 'TV Shows', slug: 'tvshows', icon: 'Radio', enabled: true, order: 9 },
];

// Initial default settings
const initialSettings: WebsiteSettings = {
  siteName: 'MOVIE PANEL BD',
  siteTagline: 'Premier Bengali & Global Movie Streaming Platform',
  announcement: 'Welcome to MOVIE PANEL BD! Stream in 4K UHD with theater mode and upload your authorized films.',
  showAnnouncement: true,
  bannerAdEnabled: true,
  bannerAdText: 'Special Weekend Premiere: Watch the latest Dhallywood & Tollywood releases exclusively on MOVIE PANEL BD!',
  bannerAdLink: '#',
  featuredMovieId: 'm-toofan',
  allowPublicRegistration: true,
  requireAdminApprovalForUploads: true,
  adminKey: 'Devjyoti2003',
  moderatorKey: 'Devjyoti2003',
};

// Seed users
const adminPassword = hashPassword('admin123');
const creatorPassword = hashPassword('rahim123');
const viewerPassword = hashPassword('anika123');

const initialUsers: StoredUser[] = [
  {
    id: 'u-admin',
    username: 'admin',
    email: 'admin@moviepanelbd.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Administrator of MOVIE PANEL BD. Ensuring content quality and copyright compliance.',
    createdAt: new Date('2026-01-01').toISOString(),
    subscribersCount: 24500,
    subscribedCreators: ['u-creator'],
    passwordHash: adminPassword.hash,
    salt: adminPassword.salt,
  },
  {
    id: 'u-creator',
    username: 'creator_rahim',
    email: 'rahim@bengalcinema.com',
    role: 'creator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Independent filmmaker and cinema archivist from Dhaka. Sharing the best of Bengali and South Asian cinema.',
    createdAt: new Date('2026-01-15').toISOString(),
    subscribersCount: 88200,
    subscribedCreators: ['u-admin'],
    passwordHash: creatorPassword.hash,
    salt: creatorPassword.salt,
  },
  {
    id: 'u-viewer',
    username: 'viewer_anika',
    email: 'anika@viewer.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Cinephile, Bengali literature student, and movie enthusiast.',
    createdAt: new Date('2026-02-01').toISOString(),
    subscribersCount: 140,
    subscribedCreators: ['u-creator'],
    passwordHash: viewerPassword.hash,
    salt: viewerPassword.salt,
  },
];

// Rich movie library with high-speed working video URLs (reliable open cinematic files)
const initialMovies: Movie[] = [
  {
    id: 'm-toofan',
    title: 'Toofan',
    description: 'A ruthless gangster from the 1990s rises through the Dhaka underworld, facing rivals and police alike in a high-octane battle for dominance across Bangladesh and West Bengal.',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Action', 'Crime', 'Thriller'],
    language: 'Bengali',
    releaseYear: 2024,
    quality: '4K',
    duration: '2h 25m',
    durationSeconds: 8700,
    cast: ['Shakib Khan', 'Mimi Chakraborty', 'Nabila', 'Chanchal Chowdhury'],
    director: 'Raihan Rafi',
    tags: ['toofan', 'shakib khan', 'dhallywood', 'action', 'blockbuster', 'bengali'],
    views: 3450000,
    likes: 184000,
    dislikes: 2400,
    rating: 9.1,
    ratingCount: 38200,
    uploadedBy: 'u-creator',
    uploaderName: 'creator_rahim',
    uploaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isPublished: true,
    status: 'approved',
    isFeatured: true,
    isTrending: true,
    category: 'Movies',
    createdAt: new Date('2026-02-10').toISOString(),
  },
  {
    id: 'm-hawa',
    title: 'Hawa',
    description: 'A deep-sea fishing trawler named F.B. Mayer Doa ventures into the Bay of Bengal. Tension rises among the eight fishermen when they catch a mysterious mute woman in their fishing net.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Mystery', 'Drama', 'Thriller'],
    language: 'Bengali',
    releaseYear: 2022,
    quality: '4K',
    duration: '2h 11m',
    durationSeconds: 7860,
    cast: ['Chanchal Chowdhury', 'Nazifa Tushi', 'Sariful Razz', 'Shohel Mondol'],
    director: 'Mejbaur Rahman Sumon',
    tags: ['hawa', 'chanchal chowdhury', 'sea', 'mystery', 'bengali', 'award winner'],
    views: 2890000,
    likes: 142000,
    dislikes: 1800,
    rating: 9.3,
    ratingCount: 42100,
    uploadedBy: 'u-creator',
    uploaderName: 'creator_rahim',
    uploaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isPublished: true,
    status: 'approved',
    isFeatured: true,
    isTrending: true,
    category: 'Movies',
    createdAt: new Date('2026-01-20').toISOString(),
  },
  {
    id: 'm-surongo',
    title: 'Surongo',
    description: 'An impoverished well-digger driven by love and desperation plans an audacious underground heist to rob a vault by tunneling under a bank branch in Sunamganj.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Crime', 'Thriller', 'Drama'],
    language: 'Bengali',
    releaseYear: 2023,
    quality: '1080p',
    duration: '2h 30m',
    durationSeconds: 9000,
    cast: ['Afran Nisho', 'Tama Mirza', 'Mostafa Monwar'],
    director: 'Raihan Rafi',
    tags: ['surongo', 'afran nisho', 'heist', 'bengali', 'bank'],
    views: 1950000,
    likes: 96000,
    dislikes: 1100,
    rating: 8.7,
    ratingCount: 26400,
    uploadedBy: 'u-creator',
    uploaderName: 'creator_rahim',
    uploaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isPublished: true,
    status: 'approved',
    isFeatured: false,
    isTrending: true,
    category: 'Movies',
    createdAt: new Date('2026-01-25').toISOString(),
  },
  {
    id: 'm-priyotoma',
    title: 'Priyotoma',
    description: 'A poignant and romantic tragedy tracing the devotion and sacrifice of two lovers tested across decades against turbulent societal norms.',
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Romance', 'Drama', 'Action'],
    language: 'Bengali',
    releaseYear: 2023,
    quality: '1080p',
    duration: '2h 18m',
    durationSeconds: 8280,
    cast: ['Shakib Khan', 'Idhika Paul', 'Kazi Hayat', 'Shahiduzzaman Selim'],
    director: 'Himel Ashraf',
    tags: ['priyotoma', 'shakib khan', 'love story', 'dhallywood', 'bengali'],
    views: 2650000,
    likes: 128000,
    dislikes: 1900,
    rating: 8.6,
    ratingCount: 31000,
    uploadedBy: 'u-admin',
    uploaderName: 'admin',
    isPublished: true,
    status: 'approved',
    isFeatured: false,
    isTrending: false,
    category: 'Movies',
    createdAt: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'm-jawan',
    title: 'Jawan',
    description: 'A former prison warden leads a team of women in vigilante missions to right societal wrongs, uncovering a dark web of corruption tying back to his enigmatic past.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Action', 'Thriller', 'Drama'],
    language: 'Hindi',
    releaseYear: 2023,
    quality: '4K',
    duration: '2h 49m',
    durationSeconds: 10140,
    cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone'],
    director: 'Atlee',
    tags: ['jawan', 'srk', 'bollywood', 'action', 'atlee'],
    views: 5200000,
    likes: 380000,
    dislikes: 4200,
    rating: 8.9,
    ratingCount: 78000,
    uploadedBy: 'u-admin',
    uploaderName: 'admin',
    isPublished: true,
    status: 'approved',
    isFeatured: true,
    isTrending: true,
    category: 'Movies',
    createdAt: new Date('2026-01-05').toISOString(),
  },
  {
    id: 'm-animal',
    title: 'Animal',
    description: 'A violent and psychologically complex heir to a mega conglomerate embarks on a bloody quest of vengeance to protect his estranged father.',
    poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'Hindi',
    releaseYear: 2023,
    quality: '4K',
    duration: '3h 21m',
    durationSeconds: 12060,
    cast: ['Ranbir Kapoor', 'Anil Kapoor', 'Bobby Deol', 'Rashmika Mandanna'],
    director: 'Sandeep Reddy Vanga',
    tags: ['animal', 'ranbir kapoor', 'vanga', 'action', 'hindi'],
    views: 4100000,
    likes: 270000,
    dislikes: 9500,
    rating: 8.5,
    ratingCount: 65000,
    uploadedBy: 'u-creator',
    uploaderName: 'creator_rahim',
    isPublished: true,
    status: 'approved',
    isFeatured: false,
    isTrending: true,
    category: 'Movies',
    createdAt: new Date('2026-01-12').toISOString(),
  },
  {
    id: 'm-oppenheimer',
    title: 'Oppenheimer',
    description: 'The pulse-pounding story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb, and the dramatic political fallout that followed.',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    releaseYear: 2023,
    quality: '4K',
    duration: '3h 00m',
    durationSeconds: 10800,
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    director: 'Christopher Nolan',
    tags: ['nolan', 'oppenheimer', 'oscar', 'hollywood', 'physics'],
    views: 6800000,
    likes: 495000,
    dislikes: 3100,
    rating: 9.4,
    ratingCount: 110000,
    uploadedBy: 'u-admin',
    uploaderName: 'admin',
    isPublished: true,
    status: 'approved',
    isFeatured: true,
    isTrending: true,
    category: 'Movies',
    createdAt: new Date('2026-01-08').toISOString(),
  },
  {
    id: 'm-dune2',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between love and destiny, he prevents a terrible future.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: 'English',
    releaseYear: 2024,
    quality: '4K',
    duration: '2h 46m',
    durationSeconds: 9960,
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    director: 'Denis Villeneuve',
    tags: ['dune', 'sci-fi', 'arrakis', 'hollywood', 'epic'],
    views: 5900000,
    likes: 410000,
    dislikes: 2900,
    rating: 9.2,
    ratingCount: 89000,
    uploadedBy: 'u-creator',
    uploaderName: 'creator_rahim',
    isPublished: true,
    status: 'approved',
    isFeatured: false,
    isTrending: true,
    category: 'Movies',
    createdAt: new Date('2026-02-05').toISOString(),
  },
  {
    id: 'm-rrr',
    title: 'RRR',
    description: 'A fearless revolutionary and an officer in the British force decide to join forces in 1920s India before embarking on an epic journey to free their people.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Action', 'Drama'],
    language: 'Telugu',
    releaseYear: 2022,
    quality: '4K',
    duration: '3h 07m',
    durationSeconds: 11220,
    cast: ['N. T. Rama Rao Jr.', 'Ram Charan', 'Ajay Devgn', 'Alia Bhatt'],
    director: 'S. S. Rajamouli',
    tags: ['rrr', 'rajamouli', 'telugu', 'south indian', 'naatu naatu'],
    views: 7400000,
    likes: 580000,
    dislikes: 4500,
    rating: 9.3,
    ratingCount: 132000,
    uploadedBy: 'u-admin',
    uploaderName: 'admin',
    isPublished: true,
    status: 'approved',
    isFeatured: true,
    isTrending: true,
    category: 'Movies',
    createdAt: new Date('2026-01-14').toISOString(),
  },
  {
    id: 'm-leo',
    title: 'Leo',
    description: 'Parthiban is a mild-mannered cafe owner in Kashmir who becomes a local hero after thwarting an armed gang, but gets targeted by gangsters claiming he is their long-lost enforcer Leo Das.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Action', 'Crime', 'Thriller'],
    language: 'Tamil',
    releaseYear: 2023,
    quality: '1080p',
    duration: '2h 44m',
    durationSeconds: 9840,
    cast: ['Thalapathy Vijay', 'Sanjay Dutt', 'Arjun Sarja', 'Trisha Krishnan'],
    director: 'Lokesh Kanagaraj',
    tags: ['leo', 'vijay', 'lcu', 'tamil', 'action'],
    views: 3900000,
    likes: 245000,
    dislikes: 3100,
    rating: 8.5,
    ratingCount: 52000,
    uploadedBy: 'u-creator',
    uploaderName: 'creator_rahim',
    isPublished: true,
    status: 'approved',
    isFeatured: false,
    isTrending: false,
    category: 'Movies',
    createdAt: new Date('2026-01-18').toISOString(),
  },
  {
    id: 'm-parasite',
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Drama', 'Thriller', 'Comedy'],
    language: 'Korean',
    releaseYear: 2019,
    quality: '4K',
    duration: '2h 12m',
    durationSeconds: 7920,
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    director: 'Bong Joon-ho',
    tags: ['parasite', 'korean', 'bong joon ho', 'oscar', 'k-drama'],
    views: 4700000,
    likes: 360000,
    dislikes: 2100,
    rating: 9.3,
    ratingCount: 94000,
    uploadedBy: 'u-admin',
    uploaderName: 'admin',
    isPublished: true,
    status: 'approved',
    isFeatured: false,
    isTrending: false,
    category: 'Movies',
    createdAt: new Date('2026-01-03').toISOString(),
  },
  {
    id: 'm-spiderman',
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Animation', 'Action', 'Adventure'],
    language: 'English',
    releaseYear: 2023,
    quality: '4K',
    duration: '2h 20m',
    durationSeconds: 8400,
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    director: 'Joaquim Dos Santos',
    tags: ['animation', 'spiderman', 'marvel', 'multiverse'],
    views: 5100000,
    likes: 420000,
    dislikes: 2800,
    rating: 9.2,
    ratingCount: 88000,
    uploadedBy: 'u-creator',
    uploaderName: 'creator_rahim',
    isPublished: true,
    status: 'approved',
    isFeatured: false,
    isTrending: true,
    category: 'Animated',
    createdAt: new Date('2026-01-16').toISOString(),
  },
  {
    id: 'm-karagar',
    title: 'Karagar',
    description: 'A mysterious man appears inside cell 501 of Akashnagar Central Jail—a cell that had remained locked and abandoned for 50 years. He claims he has lived for 250 years.',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Mystery', 'Thriller', 'Drama'],
    language: 'Bengali',
    releaseYear: 2022,
    quality: '1080p',
    duration: 'Season 1 · 7 Episodes',
    durationSeconds: 12600,
    cast: ['Chanchal Chowdhury', 'Intekhab Dinar', 'Tasnia Farin', 'FS Nayeem'],
    director: 'Syed Ahmed Shawki',
    tags: ['karagar', 'web series', 'chorki', 'bengali', 'chanchal chowdhury'],
    views: 3100000,
    likes: 195000,
    dislikes: 1400,
    rating: 9.4,
    ratingCount: 47000,
    uploadedBy: 'u-creator',
    uploaderName: 'creator_rahim',
    isPublished: true,
    status: 'approved',
    isFeatured: true,
    isTrending: true,
    category: 'Web Series',
    createdAt: new Date('2026-01-22').toISOString(),
  },
  {
    id: 'm-taqdeer',
    title: 'Taqdeer',
    description: 'A freezer van driver finds an unidentified corpse inside his vehicle, unraveling a deadly conspiracy that tests his morality, family, and survival instincts.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genre: ['Crime', 'Thriller', 'Suspense'],
    language: 'Bengali',
    releaseYear: 2020,
    quality: '1080p',
    duration: 'Season 1 · 8 Episodes',
    durationSeconds: 14400,
    cast: ['Chanchal Chowdhury', 'Sanjida Preeti', 'Manoj Kumar Pramanik'],
    director: 'Syed Ahmed Shawki',
    tags: ['taqdeer', 'hoichoi', 'web series', 'bengali'],
    views: 2200000,
    likes: 130000,
    dislikes: 1100,
    rating: 9.1,
    ratingCount: 34000,
    uploadedBy: 'u-admin',
    uploaderName: 'admin',
    isPublished: true,
    status: 'approved',
    isFeatured: false,
    isTrending: false,
    category: 'Web Series',
    createdAt: new Date('2026-01-09').toISOString(),
  },
  {
    id: 'm-pending-demo',
    title: 'Dhaka Under Siege (Pending Approval)',
    description: 'Independent documentary detailing the urban growth and cinematic history of Dhaka city.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    genre: ['Documentary'],
    language: 'Bengali',
    releaseYear: 2026,
    quality: '1080p',
    duration: '54m',
    durationSeconds: 3240,
    cast: ['Dhaka Cine Club'],
    director: 'Rahim Khan',
    tags: ['documentary', 'dhaka', 'history'],
    views: 12,
    likes: 2,
    dislikes: 0,
    rating: 8.0,
    ratingCount: 2,
    uploadedBy: 'u-creator',
    uploaderName: 'creator_rahim',
    isPublished: false,
    status: 'pending',
    category: 'Movies',
    createdAt: new Date('2026-02-12').toISOString(),
  },
];

// Initial comments
const initialComments: Comment[] = [
  {
    id: 'c-1',
    movieId: 'm-toofan',
    userId: 'u-viewer',
    username: 'viewer_anika',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    content: 'Shakib Khan and Chanchal Chowdhury together on screen is pure goosebumps! The BGM and cinematography are world class. Great to stream in 4K on MOVIE PANEL BD!',
    createdAt: new Date('2026-02-11T14:20:00Z').toISOString(),
    likes: 124,
    likedBy: ['u-admin', 'u-creator'],
  },
  {
    id: 'c-2',
    movieId: 'm-hawa',
    userId: 'u-admin',
    username: 'admin',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Masterpiece of Bengali folklore and tension. The sound design of the ocean waves makes you feel like you are stranded right there on the trawler.',
    createdAt: new Date('2026-01-21T18:45:00Z').toISOString(),
    likes: 89,
    likedBy: ['u-viewer'],
  },
  {
    id: 'c-3',
    movieId: 'm-oppenheimer',
    userId: 'u-creator',
    username: 'creator_rahim',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content: 'The Trinity test sequence without music is one of the most chilling moments in cinema history. Cillian Murphy gave the performance of a lifetime.',
    createdAt: new Date('2026-01-10T11:00:00Z').toISOString(),
    likes: 215,
    likedBy: ['u-viewer', 'u-admin'],
  },
];

// Initial user playlists
const initialPlaylists: Playlist[] = [
  {
    id: 'pl-bengali-hits',
    userId: 'u-creator',
    title: 'Dhallywood Blockbusters',
    description: 'The highest-grossing and critically acclaimed modern Bengali movies.',
    isPublic: true,
    movieIds: ['m-toofan', 'm-hawa', 'm-surongo', 'm-priyotoma'],
    createdAt: new Date('2026-01-25').toISOString(),
    updatedAt: new Date('2026-02-10').toISOString(),
  },
  {
    id: 'pl-top-thrillers',
    userId: 'u-viewer',
    title: 'Weekend Suspense & Mystery',
    description: 'Edge-of-the-seat thrillers and web series to binge watch.',
    isPublic: true,
    movieIds: ['m-karagar', 'm-taqdeer', 'm-hawa'],
    createdAt: new Date('2026-02-02').toISOString(),
    updatedAt: new Date('2026-02-05').toISOString(),
  },
];

// Initial watch history
const initialWatchHistory: WatchHistoryItem[] = [
  {
    id: 'wh-1',
    userId: 'u-viewer',
    movieId: 'm-toofan',
    progressSeconds: 3420,
    durationSeconds: 8700,
    lastWatchedAt: new Date('2026-02-12T08:15:00Z').toISOString(),
  },
  {
    id: 'wh-2',
    userId: 'u-viewer',
    movieId: 'm-karagar',
    progressSeconds: 1250,
    durationSeconds: 12600,
    lastWatchedAt: new Date('2026-02-11T20:30:00Z').toISOString(),
  },
];

// Initial watch later
const initialWatchLater: WatchLaterItem[] = [
  {
    id: 'wl-1',
    userId: 'u-viewer',
    movieId: 'm-surongo',
    addedAt: new Date('2026-02-10').toISOString(),
  },
  {
    id: 'wl-2',
    userId: 'u-viewer',
    movieId: 'm-oppenheimer',
    addedAt: new Date('2026-02-09').toISOString(),
  },
];

// Initial user votes
const initialUserVotes = [
  { userId: 'u-viewer', movieId: 'm-toofan', vote: 'like' as const },
  { userId: 'u-viewer', movieId: 'm-hawa', vote: 'like' as const },
  { userId: 'u-admin', movieId: 'm-toofan', vote: 'like' as const },
];

// Initial notifications
const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'u-viewer',
    title: 'New Movie Released!',
    message: 'creator_rahim published "Toofan" in 4K UHD. Start streaming now!',
    link: '/movie/m-toofan',
    read: false,
    createdAt: new Date('2026-02-10T12:00:00Z').toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'u-creator',
    title: 'Upload Approved',
    message: 'Your upload "Toofan" was reviewed and approved by the admin team.',
    link: '/movie/m-toofan',
    read: true,
    createdAt: new Date('2026-02-10T11:30:00Z').toISOString(),
  },
];

// Initial activity logs
const initialActivityLogs: AdminActivityLog[] = [
  {
    id: 'log-1',
    adminUsername: 'admin',
    action: 'Approved Movie',
    target: 'Toofan (m-toofan)',
    timestamp: new Date('2026-02-10T11:30:00Z').toISOString(),
    details: 'Verified video source and copyright ownership.',
  },
  {
    id: 'log-2',
    adminUsername: 'admin',
    action: 'Updated Settings',
    target: 'Homepage Announcement',
    timestamp: new Date('2026-02-01T09:00:00Z').toISOString(),
    details: 'Enabled weekend premiere promotional banner.',
  },
];

// Database Manager
class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.settings) {
          if (!parsed.settings.adminKey) parsed.settings.adminKey = 'Devjyoti2003';
          if (!parsed.settings.moderatorKey) parsed.settings.moderatorKey = 'Devjyoti2003';
        }
        return parsed;
      } catch (err) {
        console.error('Error reading database file, reinitializing default data:', err);
      }
    }

    const defaultData: DatabaseSchema = {
      users: initialUsers,
      movies: initialMovies,
      comments: initialComments,
      playlists: initialPlaylists,
      watchHistory: initialWatchHistory,
      watchLater: initialWatchLater,
      userVotes: initialUserVotes,
      userRatings: [],
      notifications: initialNotifications,
      categories: initialCategories,
      reports: [],
      activityLogs: initialActivityLogs,
      settings: initialSettings,
    };

    this.saveData(defaultData);
    return defaultData;
  }

  public saveData(data?: DatabaseSchema) {
    if (data) {
      this.data = data;
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // User methods
  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByUsername(username: string): StoredUser | undefined {
    return this.data.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
  }

  public findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public createUser(user: StoredUser): StoredUser {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  public updateUser(id: string, updates: Partial<StoredUser>): StoredUser | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.saveData();
      return this.data.users[idx];
    }
    return undefined;
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Movie methods
  public getMovies(): Movie[] {
    return this.data.movies;
  }

  public getMovieById(id: string): Movie | undefined {
    return this.data.movies.find((m) => m.id === id);
  }

  public createMovie(movie: Movie): Movie {
    this.data.movies.unshift(movie);
    this.saveData();
    return movie;
  }

  public updateMovie(id: string, updates: Partial<Movie>): Movie | undefined {
    const idx = this.data.movies.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.data.movies[idx] = { ...this.data.movies[idx], ...updates };
      this.saveData();
      return this.data.movies[idx];
    }
    return undefined;
  }

  public deleteMovie(id: string): boolean {
    const initialLen = this.data.movies.length;
    this.data.movies = this.data.movies.filter((m) => m.id !== id);
    if (this.data.movies.length !== initialLen) {
      // Also clean up associated comments & watch history
      this.data.comments = this.data.comments.filter((c) => c.movieId !== id);
      this.data.watchHistory = this.data.watchHistory.filter((w) => w.movieId !== id);
      this.data.watchLater = this.data.watchLater.filter((w) => w.movieId !== id);
      this.saveData();
      return true;
    }
    return false;
  }

  public incrementMovieViews(id: string): void {
    const movie = this.getMovieById(id);
    if (movie) {
      movie.views += 1;
      this.saveData();
    }
  }

  public voteMovie(userId: string, movieId: string, voteType: 'like' | 'dislike'): {
    likes: number;
    dislikes: number;
    userVote: 'like' | 'dislike' | null;
  } {
    const movie = this.getMovieById(movieId);
    if (!movie) throw new Error('Movie not found');

    const existingVoteIdx = this.data.userVotes.findIndex(
      (v) => v.userId === userId && v.movieId === movieId
    );

    let finalUserVote: 'like' | 'dislike' | null = null;

    if (existingVoteIdx !== -1) {
      const existing = this.data.userVotes[existingVoteIdx];
      if (existing.vote === voteType) {
        // Toggle off
        if (voteType === 'like') movie.likes = Math.max(0, movie.likes - 1);
        if (voteType === 'dislike') movie.dislikes = Math.max(0, movie.dislikes - 1);
        this.data.userVotes.splice(existingVoteIdx, 1);
        finalUserVote = null;
      } else {
        // Switch vote
        if (voteType === 'like') {
          movie.likes += 1;
          movie.dislikes = Math.max(0, movie.dislikes - 1);
        } else {
          movie.dislikes += 1;
          movie.likes = Math.max(0, movie.likes - 1);
        }
        existing.vote = voteType;
        finalUserVote = voteType;
      }
    } else {
      // New vote
      if (voteType === 'like') movie.likes += 1;
      if (voteType === 'dislike') movie.dislikes += 1;
      this.data.userVotes.push({ userId, movieId, vote: voteType });
      finalUserVote = voteType;
    }

    this.saveData();
    return {
      likes: movie.likes,
      dislikes: movie.dislikes,
      userVote: finalUserVote,
    };
  }

  public getUserVote(userId: string, movieId: string): 'like' | 'dislike' | null {
    const vote = this.data.userVotes.find(
      (v) => v.userId === userId && v.movieId === movieId
    );
    return vote ? vote.vote : null;
  }

  // Comments
  public getCommentsByMovie(movieId: string): Comment[] {
    return this.data.comments
      .filter((c) => c.movieId === movieId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addComment(comment: Comment): Comment {
    this.data.comments.unshift(comment);
    this.saveData();
    return comment;
  }

  public deleteComment(commentId: string, userId: string, isAdmin: boolean): boolean {
    const idx = this.data.comments.findIndex((c) => c.id === commentId);
    if (idx !== -1) {
      const comment = this.data.comments[idx];
      if (comment.userId === userId || isAdmin) {
        this.data.comments.splice(idx, 1);
        this.saveData();
        return true;
      }
    }
    return false;
  }

  public likeComment(commentId: string, userId: string): Comment | undefined {
    const comment = this.data.comments.find((c) => c.id === commentId);
    if (!comment) return undefined;

    if (!comment.likedBy) comment.likedBy = [];

    const hasLiked = comment.likedBy.includes(userId);
    if (hasLiked) {
      comment.likedBy = comment.likedBy.filter((id) => id !== userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.likedBy.push(userId);
      comment.likes += 1;
    }

    this.saveData();
    return comment;
  }

  // Playlists
  public getUserPlaylists(userId: string): Playlist[] {
    return this.data.playlists.filter((p) => p.userId === userId);
  }

  public createPlaylist(playlist: Playlist): Playlist {
    this.data.playlists.push(playlist);
    this.saveData();
    return playlist;
  }

  public updatePlaylist(
    playlistId: string,
    userId: string,
    updates: Partial<Playlist>
  ): Playlist | undefined {
    const playlist = this.data.playlists.find(
      (p) => p.id === playlistId && p.userId === userId
    );
    if (playlist) {
      Object.assign(playlist, updates, { updatedAt: new Date().toISOString() });
      this.saveData();
      return playlist;
    }
    return undefined;
  }

  public deletePlaylist(playlistId: string, userId: string): boolean {
    const initialLen = this.data.playlists.length;
    this.data.playlists = this.data.playlists.filter(
      (p) => !(p.id === playlistId && p.userId === userId)
    );
    if (this.data.playlists.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Watch History
  public getWatchHistory(userId: string): (WatchHistoryItem & { movie?: Movie })[] {
    return this.data.watchHistory
      .filter((w) => w.userId === userId)
      .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
      .map((w) => ({
        ...w,
        movie: this.getMovieById(w.movieId),
      }))
      .filter((w) => w.movie !== undefined);
  }

  public recordWatchProgress(
    userId: string,
    movieId: string,
    progressSeconds: number,
    durationSeconds: number
  ): void {
    const existing = this.data.watchHistory.find(
      (w) => w.userId === userId && w.movieId === movieId
    );
    if (existing) {
      existing.progressSeconds = progressSeconds;
      existing.durationSeconds = durationSeconds;
      existing.lastWatchedAt = new Date().toISOString();
    } else {
      this.data.watchHistory.push({
        id: 'wh-' + Date.now(),
        userId,
        movieId,
        progressSeconds,
        durationSeconds,
        lastWatchedAt: new Date().toISOString(),
      });
    }
    this.saveData();
  }

  public clearWatchHistory(userId: string): void {
    this.data.watchHistory = this.data.watchHistory.filter((w) => w.userId !== userId);
    this.saveData();
  }

  // Watch Later
  public getWatchLater(userId: string): (WatchLaterItem & { movie?: Movie })[] {
    return this.data.watchLater
      .filter((w) => w.userId === userId)
      .map((w) => ({
        ...w,
        movie: this.getMovieById(w.movieId),
      }))
      .filter((w) => w.movie !== undefined);
  }

  public toggleWatchLater(userId: string, movieId: string): boolean {
    const idx = this.data.watchLater.findIndex(
      (w) => w.userId === userId && w.movieId === movieId
    );
    let isAdded = false;
    if (idx !== -1) {
      this.data.watchLater.splice(idx, 1);
      isAdded = false;
    } else {
      this.data.watchLater.push({
        id: 'wl-' + Date.now(),
        userId,
        movieId,
        addedAt: new Date().toISOString(),
      });
      isAdded = true;
    }
    this.saveData();
    return isAdded;
  }

  // Subscriptions
  public toggleSubscription(subscriberId: string, creatorId: string): {
    isSubscribed: boolean;
    subscribersCount: number;
  } {
    const subscriber = this.findUserById(subscriberId);
    const creator = this.findUserById(creatorId);
    if (!subscriber || !creator) throw new Error('User not found');

    if (!subscriber.subscribedCreators) subscriber.subscribedCreators = [];

    const isSubscribed = subscriber.subscribedCreators.includes(creatorId);
    if (isSubscribed) {
      subscriber.subscribedCreators = subscriber.subscribedCreators.filter(
        (id) => id !== creatorId
      );
      creator.subscribersCount = Math.max(0, creator.subscribersCount - 1);
    } else {
      subscriber.subscribedCreators.push(creatorId);
      creator.subscribersCount += 1;
    }

    this.saveData();
    return {
      isSubscribed: !isSubscribed,
      subscribersCount: creator.subscribersCount,
    };
  }

  // Reports
  public addReport(report: CopyrightReport): CopyrightReport {
    this.data.reports.unshift(report);
    this.saveData();
    return report;
  }

  public getReports(): CopyrightReport[] {
    return this.data.reports;
  }

  public updateReportStatus(
    id: string,
    status: CopyrightReport['status']
  ): CopyrightReport | undefined {
    const report = this.data.reports.find((r) => r.id === id);
    if (report) {
      report.status = status;
      this.saveData();
      return report;
    }
    return undefined;
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.order - b.order);
  }

  public saveCategories(categories: Category[]): void {
    this.data.categories = categories;
    this.saveData();
  }

  // Settings
  public getSettings(): WebsiteSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  // Activity logs
  public logActivity(log: Omit<AdminActivityLog, 'id' | 'timestamp'>): void {
    this.data.activityLogs.unshift({
      id: 'log-' + Date.now(),
      ...log,
      timestamp: new Date().toISOString(),
    });
    // Keep max 100 logs
    if (this.data.activityLogs.length > 100) {
      this.data.activityLogs.pop();
    }
    this.saveData();
  }

  public getActivityLogs(): AdminActivityLog[] {
    return this.data.activityLogs;
  }

  // Notifications
  public getUserNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationAsRead(id: string, userId: string): void {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      this.saveData();
    }
  }

  public addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): void {
    this.data.notifications.unshift({
      id: 'notif-' + Date.now(),
      ...notification,
      createdAt: new Date().toISOString(),
    });
    this.saveData();
  }
}

export const db = new DatabaseManager();
