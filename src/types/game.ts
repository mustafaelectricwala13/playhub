import React from 'react';

export type GameCategory = 'All' | 'Arcade' | 'Puzzle' | 'Casual' | 'Skill';

export interface GameRegistryItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: GameCategory;
  thumbnail: string;
  badge?: 'HOT' | 'NEW' | 'POPULAR' | 'FEATURED';
  plays: number;
  rating: number;
  componentName: 'PerfectStack' | 'OneMoreTry' | 'External';
  iframeUrl?: string;
  published: boolean;
  featured: boolean;
  controls: { action: string; key: string }[];
  dateAdded: string;
}

export interface UserStats {
  nickname: string;
  avatarSeed: string;
  totalGamesPlayed: number;
  favorites: string[];
  recentlyPlayed: { slug: string; lastPlayed: string }[];
  highScores: Record<string, number>;
  totalCoins: number;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  gameSlug: string;
  gameTitle: string;
  score: number;
  rank?: number;
  date: string;
  isCurrentUser?: boolean;
}

