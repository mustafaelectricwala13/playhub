import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '../types/game';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch {
    supabase = null;
  }
}

const DEFAULT_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb-1', nickname: 'NeonStacker', gameSlug: 'perfect-stack', gameTitle: 'Perfect Stack', score: 142, rank: 1, date: 'Today' },
  { id: 'lb-2', nickname: 'CyberViper', gameSlug: 'one-more-try', gameTitle: 'One More Try', score: 118, rank: 2, date: 'Today' },
  { id: 'lb-3', nickname: 'ZenTower', gameSlug: 'perfect-stack', gameTitle: 'Perfect Stack', score: 98, rank: 3, date: 'Yesterday' },
  { id: 'lb-4', nickname: 'ReflexKing', gameSlug: 'one-more-try', gameTitle: 'One More Try', score: 87, rank: 4, date: '2d ago' },
  { id: 'lb-5', nickname: 'PixelMaster', gameSlug: 'perfect-stack', gameTitle: 'Perfect Stack', score: 79, rank: 5, date: '3d ago' },
  { id: 'lb-6', nickname: 'ShadowBlade', gameSlug: 'one-more-try', gameTitle: 'One More Try', score: 65, rank: 6, date: '3d ago' },
  { id: 'lb-7', nickname: 'SkylinePro', gameSlug: 'perfect-stack', gameTitle: 'Perfect Stack', score: 58, rank: 7, date: '4d ago' },
  { id: 'lb-8', nickname: 'AstroDodge', gameSlug: 'one-more-try', gameTitle: 'One More Try', score: 52, rank: 8, date: '5d ago' },
];

export const supabaseService = {
  isConfigured(): boolean {
    return !!supabase;
  },

  async getLeaderboard(gameSlug?: string): Promise<LeaderboardEntry[]> {
    if (supabase) {
      try {
        let query = supabase.from('leaderboard').select('*').order('score', { ascending: false }).limit(25);
        if (gameSlug && gameSlug !== 'all') {
          query = query.eq('game_slug', gameSlug);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item, idx) => ({
            id: item.id || `supa-${idx}`,
            nickname: item.nickname || 'Guest',
            gameSlug: item.game_slug || 'perfect-stack',
            gameTitle: item.game_title || 'Arcade Game',
            score: item.score || 0,
            rank: idx + 1,
            date: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Online'
          }));
        }
      } catch {
        // fallback
      }
    }

    // Local cached or mock fallback
    const key = `playhub_leaderboard_${gameSlug || 'all'}`;
    try {
      const local = localStorage.getItem(key);
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // ignore
    }

    if (gameSlug && gameSlug !== 'all') {
      return DEFAULT_GLOBAL_LEADERBOARD.filter(entry => entry.gameSlug === gameSlug);
    }
    return DEFAULT_GLOBAL_LEADERBOARD;
  },

  async submitScore(nickname: string, gameSlug: string, gameTitle: string, score: number): Promise<LeaderboardEntry[]> {
    if (score <= 0) return this.getLeaderboard(gameSlug);

    if (supabase) {
      try {
        await supabase.from('leaderboard').insert([
          {
            nickname,
            game_slug: gameSlug,
            game_title: gameTitle,
            score
          }
        ]);
      } catch {
        // continue to update local
      }
    }

    const current = await this.getLeaderboard(gameSlug);
    const existingIndex = current.findIndex(e => e.nickname === nickname && e.gameSlug === gameSlug);

    if (existingIndex >= 0) {
      if (score > current[existingIndex].score) {
        current[existingIndex].score = score;
        current[existingIndex].date = 'Today';
        current[existingIndex].isCurrentUser = true;
      }
    } else {
      current.push({
        id: `local-${Date.now()}`,
        nickname,
        gameSlug,
        gameTitle,
        score,
        date: 'Today',
        isCurrentUser: true
      });
    }

    current.sort((a, b) => b.score - a.score);
    const ranked = current.map((item, idx) => ({ ...item, rank: idx + 1 }));

    try {
      const key = `playhub_leaderboard_${gameSlug || 'all'}`;
      localStorage.setItem(key, JSON.stringify(ranked));
    } catch {
      // ignore
    }

    return ranked;
  }
};
