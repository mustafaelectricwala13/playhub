import { UserStats, LeaderboardEntry, GameRegistryItem } from '../types/game';

const KEYS = {
  USER_STATS: 'playhub_user_stats_v1',
  ADMIN_GAMES: 'playhub_custom_games_v1',
  LEADERBOARD: 'playhub_local_leaderboard_v1'
};

const DEFAULT_USER_STATS: UserStats = {
  nickname: `Gamer_${Math.floor(1000 + Math.random() * 9000)}`,
  avatarSeed: 'pixel-avatar-1',
  totalGamesPlayed: 0,
  favorites: ['perfect-stack', 'one-more-try'],
  recentlyPlayed: [],
  highScores: {
    'perfect-stack': 0,
    'one-more-try': 0
  },
  totalCoins: 150
};

export const storageService = {
  getUserStats(): UserStats {
    try {
      const data = localStorage.getItem(KEYS.USER_STATS);
      if (data) {
        return { ...DEFAULT_USER_STATS, ...JSON.parse(data) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_USER_STATS;
  },

  saveUserStats(stats: UserStats) {
    try {
      localStorage.setItem(KEYS.USER_STATS, JSON.stringify(stats));
    } catch {
      // ignore
    }
  },

  recordGamePlayed(slug: string, score?: number) {
    const stats = this.getUserStats();
    stats.totalGamesPlayed += 1;

    // Update recently played (push to front, max 10)
    stats.recentlyPlayed = [
      { slug, lastPlayed: new Date().toISOString() },
      ...stats.recentlyPlayed.filter(r => r.slug !== slug)
    ].slice(0, 10);

    if (score !== undefined) {
      const currentBest = stats.highScores[slug] || 0;
      if (score > currentBest) {
        stats.highScores[slug] = score;
      }
    }

    this.saveUserStats(stats);
    return stats;
  },

  toggleFavorite(slug: string): boolean {
    const stats = this.getUserStats();
    let isFav = false;
    if (stats.favorites.includes(slug)) {
      stats.favorites = stats.favorites.filter(s => s !== slug);
    } else {
      stats.favorites.push(slug);
      isFav = true;
    }
    this.saveUserStats(stats);
    return isFav;
  },

  getAdminGames(): GameRegistryItem[] | null {
    try {
      const saved = localStorage.getItem(KEYS.ADMIN_GAMES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  },

  saveAdminGames(games: GameRegistryItem[]) {
    try {
      localStorage.setItem(KEYS.ADMIN_GAMES, JSON.stringify(games));
    } catch {
      // ignore
    }
  }
};
