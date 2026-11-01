import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, GameRegistryItem } from '../types/game';
import { supabaseService } from '../services/supabase';
import { Trophy, Crown, Medal, Globe, Sparkles, Filter } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface LeaderboardPageProps {
  games: GameRegistryItem[];
  currentUserNickname: string;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  games,
  currentUserNickname
}) => {
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabaseService.getLeaderboard(selectedGame).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [selectedGame]);

  const isOnline = supabaseService.isConfigured();

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
          <Trophy className="w-7 h-7" />
        </div>
        <h1 className="font-arcade text-3xl sm:text-4xl font-black text-white">
          ARCADE HALL OF FAME
        </h1>
        <p className="text-slate-400 font-display text-sm max-w-md">
          Top players, highest towers, and fastest survival reflexes worldwide. Can you reach #1?
        </p>

        {/* Sync Status Badge */}
        <div className="inline-flex items-center gap-2 text-[11px] font-arcade px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 mt-1">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">NETWORK:</span>
          <span className={`font-bold ${isOnline ? 'text-emerald-400' : 'text-indigo-400'}`}>
            {isOnline ? 'SUPABASE CLOUD SYNCED' : 'PLAYHUB GLOBAL LEADERBOARD'}
          </span>
        </div>
      </div>

      {/* Game Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            soundManager.playClick();
            setSelectedGame('all');
          }}
          className={`
            px-4 py-2 rounded-xl font-arcade text-xs font-bold tracking-wider transition-all active:scale-95
            ${
              selectedGame === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
            }
          `}
        >
          ALL GAMES
        </button>
        {games.map((g) => (
          <button
            key={g.slug}
            onClick={() => {
              soundManager.playClick();
              setSelectedGame(g.slug);
            }}
            className={`
              px-4 py-2 rounded-xl font-arcade text-xs font-bold tracking-wider whitespace-nowrap transition-all active:scale-95
              ${
                selectedGame === g.slug
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
              }
            `}
          >
            {g.title.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Rankings List */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-2.5">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-arcade text-xs animate-pulse">
            RETRIEVING LEADERBOARD DATA...
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No scores submitted for this game yet. Be the first to set a record!
          </div>
        ) : (
          entries.map((item, index) => {
            const rank = item.rank || index + 1;
            const isUser = item.nickname === currentUserNickname || item.isCurrentUser;

            return (
              <div
                key={item.id || index}
                className={`
                  flex items-center justify-between p-3.5 sm:px-5 sm:py-4 rounded-2xl border transition-all
                  ${
                    isUser
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : rank === 1
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : rank === 2
                      ? 'bg-slate-400/10 border-slate-400/30'
                      : rank === 3
                      ? 'bg-amber-700/10 border-amber-700/30'
                      : 'bg-slate-950/60 border-white/5'
                  }
                `}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Rank Badge */}
                  <div className="w-8 text-center font-arcade font-black text-sm">
                    {rank === 1 ? (
                      <Crown className="w-6 h-6 text-amber-400 mx-auto fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                    ) : rank === 2 ? (
                      <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                    ) : rank === 3 ? (
                      <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                    ) : (
                      <span className="text-slate-500 font-bold">#{rank}</span>
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <span className={`font-arcade text-sm font-bold ${isUser ? 'text-indigo-400' : 'text-white'}`}>
                      {item.nickname} {isUser && '★ (YOU)'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-display">
                      {item.gameTitle} • {item.date}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2">
                  <span className="font-arcade text-lg sm:text-xl font-black text-amber-400 drop-shadow-md">
                    {item.score.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-arcade text-slate-500 hidden sm:inline">PTS</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
