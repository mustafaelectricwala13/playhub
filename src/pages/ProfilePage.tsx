import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserStats, GameRegistryItem } from '../types/game';
import { storageService } from '../services/storage';
import { soundManager } from '../audio/soundManager';
import { User, Trophy, Sparkles, Clock, Check, Edit2, Play, Flame } from 'lucide-react';

interface ProfilePageProps {
  stats: UserStats;
  games: GameRegistryItem[];
  onStatsChange: (stats: UserStats) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  stats,
  games,
  onStatsChange
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(stats.nickname);

  const handleSaveName = () => {
    if (name.trim()) {
      const updated = { ...stats, nickname: name.trim() };
      storageService.saveUserStats(updated);
      onStatsChange(updated);
      setEditing(false);
      soundManager.playClick();
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in max-w-4xl mx-auto w-full">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shrink-0 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl font-arcade font-black text-white">
            {stats.nickname.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
          <div className="flex items-center gap-2 mb-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  maxLength={16}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border border-indigo-500 rounded-xl px-3 py-1 font-arcade text-lg text-white focus:outline-none"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 rounded-xl bg-indigo-600 text-white"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h1 className="font-arcade text-2xl sm:text-3xl font-black text-white">
                  {stats.nickname}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <span className="text-xs font-arcade text-indigo-400">GUEST PLAYER PROFILE • NO LOGIN REQUIRED</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-yellow-500/30 px-4 py-2.5 rounded-2xl shrink-0 shadow-lg">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          <div className="text-left">
            <span className="text-[10px] font-arcade text-slate-400 block">TOTAL GEMS</span>
            <span className="font-arcade text-lg font-black text-amber-400">{stats.totalCoins}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-arcade text-slate-400 block">TOTAL MATCHES</span>
            <span className="font-arcade text-2xl font-black text-white">{stats.totalGamesPlayed}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-arcade text-slate-400 block">FAVORITE GAMES</span>
            <span className="font-arcade text-2xl font-black text-white">{stats.favorites.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-arcade text-slate-400 block">RECENT RUNS</span>
            <span className="font-arcade text-2xl font-black text-white">{stats.recentlyPlayed.length}</span>
          </div>
        </div>
      </div>

      {/* High Scores By Game */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
        <h3 className="font-arcade text-lg font-black text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>YOUR HIGH SCORES BY GAME</span>
        </h3>

        <div className="flex flex-col gap-2">
          {games.map((g) => {
            const score = stats.highScores[g.slug] || 0;
            return (
              <div
                key={g.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                    <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-arcade text-sm font-bold text-white block">{g.title}</span>
                    <span className="text-[10px] font-arcade text-indigo-400">{g.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-arcade text-lg font-black text-amber-400">{score}</span>
                    <span className="text-[10px] font-arcade text-slate-400 block">BEST PTS</span>
                  </div>
                  <Link
                    to={`/games/${g.slug}`}
                    className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

