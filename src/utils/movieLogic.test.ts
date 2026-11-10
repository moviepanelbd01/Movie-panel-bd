import test from 'node:test';
import assert from 'node:assert/strict';
import {
  searchMovies,
  calculateTrendingScore,
  getRecommendedMovies,
  formatViews,
  formatSecondsToTime,
  validateMovieUpload,
  canUserUpload,
  canUserManageMovie,
  addMovieToPlaylist,
  removeMovieFromPlaylist,
} from './movieLogic.ts';
import { Movie, User, Playlist } from '../types/index.ts';

const mockMovies: Movie[] = [
  {
    id: 'm1',
    title: 'Hawa',
    description: 'A mystery drama thriller on a fishing trawler in the Bay of Bengal.',
    poster: '/posters/hawa.jpg',
    videoUrl: 'https://example.com/hawa.mp4',
    genre: ['Mystery', 'Drama', 'Thriller'],
    language: 'Bengali',
    releaseYear: 2022,
    quality: '4K',
    duration: '2h 11m',
    cast: ['Chanchal Chowdhury', 'Nazifa Tushi'],
    director: 'Mejbaur Rahman Sumon',
    tags: ['sea', 'trawler', 'fish', 'bengali'],
    views: 1200000,
    likes: 45000,
    dislikes: 1200,
    rating: 8.8,
    ratingCount: 15400,
    uploadedBy: 'u1',
    uploaderName: 'Bengal Cinema Hub',
    isPublished: true,
    status: 'approved',
    category: 'Movies',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm2',
    title: 'Toofan',
    description: 'High octane action blockbuster starring Shakib Khan.',
    poster: '/posters/toofan.jpg',
    videoUrl: 'https://example.com/toofan.mp4',
    genre: ['Action', 'Thriller'],
    language: 'Bengali',
    releaseYear: 2024,
    quality: '4K',
    duration: '2h 25m',
    cast: ['Shakib Khan', 'Mimi Chakraborty', 'Chanchal Chowdhury'],
    director: 'Raihan Rafi',
    tags: ['action', 'gangster', 'dhallywood'],
    views: 2400000,
    likes: 98000,
    dislikes: 2100,
    rating: 8.9,
    ratingCount: 22000,
    uploadedBy: 'u2',
    uploaderName: 'Chorki Media',
    isPublished: true,
    status: 'approved',
    category: 'Movies',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm3',
    title: 'Oppenheimer',
    description: 'The story of J. Robert Oppenheimer and the Manhattan Project.',
    poster: '/posters/oppenheimer.jpg',
    videoUrl: 'https://example.com/oppenheimer.mp4',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    releaseYear: 2023,
    quality: '4K',
    duration: '3h 00m',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.'],
    director: 'Christopher Nolan',
    tags: ['atomic', 'physics', 'history'],
    views: 4500000,
    likes: 310000,
    dislikes: 3000,
    rating: 9.1,
    ratingCount: 54000,
    uploadedBy: 'u3',
    uploaderName: 'Universal Cine',
    isPublished: true,
    status: 'approved',
    category: 'Movies',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm4',
    title: 'Unpublished Draft Movie',
    description: 'Draft not yet approved',
    poster: '',
    videoUrl: '',
    genre: ['Action'],
    language: 'English',
    releaseYear: 2024,
    quality: '1080p',
    duration: '1h 30m',
    cast: [],
    director: 'Unknown',
    tags: [],
    views: 0,
    likes: 0,
    dislikes: 0,
    rating: 0,
    ratingCount: 0,
    uploadedBy: 'u1',
    uploaderName: 'Creator',
    isPublished: false,
    status: 'pending',
    category: 'Movies',
    createdAt: new Date().toISOString(),
  },
];

test('searchMovies filters by text across title, cast, and tags', () => {
  const resultShakib = searchMovies(mockMovies, 'Shakib');
  assert.equal(resultShakib.length, 1);
  assert.equal(resultShakib[0].title, 'Toofan');

  const resultChanchal = searchMovies(mockMovies, 'Chanchal');
  assert.equal(resultChanchal.length, 2);

  const resultNolan = searchMovies(mockMovies, 'Nolan');
  assert.equal(resultNolan.length, 1);
  assert.equal(resultNolan[0].title, 'Oppenheimer');
});

test('searchMovies excludes unpublished and pending movies', () => {
  const all = searchMovies(mockMovies, '');
  assert.equal(all.length, 3);
  assert.equal(all.some((m) => m.id === 'm4'), false);
});

test('searchMovies filters by language and category correctly', () => {
  const bengaliMovies = searchMovies(mockMovies, '', { language: 'Bengali' });
  assert.equal(bengaliMovies.length, 2);

  const englishMovies = searchMovies(mockMovies, '', { language: 'English' });
  assert.equal(englishMovies.length, 1);
  assert.equal(englishMovies[0].title, 'Oppenheimer');
});

test('calculateTrendingScore scores recent popular movies higher', () => {
  const scoreToofan = calculateTrendingScore(mockMovies[1]); // 1 day old, 2.4M views
  const scoreHawa = calculateTrendingScore(mockMovies[0]); // 5 days old, 1.2M views
  assert.ok(scoreToofan > scoreHawa);
});

test('getRecommendedMovies matches language, genre, and director similarity', () => {
  const recsForHawa = getRecommendedMovies(mockMovies, mockMovies[0]);
  assert.ok(recsForHawa.length > 0);
  assert.equal(recsForHawa[0].language, 'Bengali');
});

test('formatViews formats numbers with K and M suffix', () => {
  assert.equal(formatViews(950), '950');
  assert.equal(formatViews(1500), '1.5K');
  assert.equal(formatViews(45000), '45K');
  assert.equal(formatViews(2400000), '2.4M');
});

test('formatSecondsToTime formats MM:SS and HH:MM:SS properly', () => {
  assert.equal(formatSecondsToTime(0), '00:00');
  assert.equal(formatSecondsToTime(65), '01:05');
  assert.equal(formatSecondsToTime(3665), '1:01:05');
});

test('validateMovieUpload enforces required fields', () => {
  const invalid = validateMovieUpload({});
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.videoUrl);

  const valid = validateMovieUpload({
    title: 'Surongo',
    description: 'An underground heist thriller based in Bangladesh.',
    videoUrl: 'https://example.com/surongo.mp4',
    genre: ['Crime', 'Thriller'],
    language: 'Bengali',
    releaseYear: 2023,
  });
  assert.equal(valid.isValid, true);
});

test('permissions check creator, admin, and owner correctly', () => {
  const viewer: User = {
    id: 'u1',
    username: 'viewer',
    role: 'user',
    avatar: '',
    createdAt: '',
    subscribersCount: 0,
    subscribedCreators: [],
  };
  const creator: User = {
    id: 'u2',
    username: 'creator',
    role: 'creator',
    avatar: '',
    createdAt: '',
    subscribersCount: 0,
    subscribedCreators: [],
  };
  const admin: User = {
    id: 'u_admin',
    username: 'admin',
    role: 'admin',
    avatar: '',
    createdAt: '',
    subscribersCount: 0,
    subscribedCreators: [],
  };

  assert.equal(canUserUpload(viewer), false);
  assert.equal(canUserUpload(creator), true);
  assert.equal(canUserUpload(admin), true);

  assert.equal(canUserManageMovie(creator, mockMovies[0]), false); // belongs to u1
  assert.equal(canUserManageMovie(creator, mockMovies[1]), true); // belongs to u2
  assert.equal(canUserManageMovie(admin, mockMovies[0]), true); // admin can manage all
});

test('addMovieToPlaylist and removeMovieFromPlaylist update list immutably', () => {
  const playlist: Playlist = {
    id: 'p1',
    userId: 'u1',
    title: 'Weekend Binge',
    isPublic: true,
    movieIds: ['m1'],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const added = addMovieToPlaylist(playlist, 'm2');
  assert.deepEqual(added.movieIds, ['m1', 'm2']);

  // Does not duplicate
  const duplicate = addMovieToPlaylist(added, 'm2');
  assert.equal(duplicate.movieIds.length, 2);

  const removed = removeMovieFromPlaylist(added, 'm1');
  assert.deepEqual(removed.movieIds, ['m2']);
});
