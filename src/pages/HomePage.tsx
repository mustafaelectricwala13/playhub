import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GameRegistryItem, GameCategory } from '../types/game';
import { GameCard } from '../components/games/GameCard';
import { AdBanner } from '../components/layout/AdBanner';
import { soundManager } from '../audio/soundManager';
import { 
  Play, 
  Sparkles, 
  Flame, 
  Trophy, 
  TrendingUp, 
  Gamepad2, 
  Layers, 
  ArrowRight,
  Zap,
  Star
} from 'lucide-react';

interface HomePageProps {
  games: GameRegistryItem[];
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  games,
  favorites,
  onToggleFavorite
}) => {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState<GameCategory>('All');

  const categories: GameCategory[] = ['All', 'Arcade', 'Puzzle', 'Casual', 'Skill'];

  const featuredGames = games.filter((g) => g.featured);
  const heroGame = featuredGames[0] || games[0];

  const trendingGames = [...games].sort((a, b) => b.plays - a.plays).slice(0, 4);
  const newGames = [...games].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 4);

  const filteredGames = selectedCat === 'All' 
    ? games 
    : games.filter((g) => g.category.toLowerCase() === selectedCat.toLowerCase());

  return (
    <div className="flex flex-col gap-12 pb-12 animate-fade-in">
      {/* Hero Banner Section */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Background glow orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start gap-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-arcade text-xs font-bold tracking-wider">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>OVER 50,000+ PLAYS WORLDWIDE</span>
            </div>

            <div className="flex flex-col">
              <h1 className="font-arcade text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
                PLAY. COMPETE. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300">
                  REPEAT.
                </span>
              </h1>
              <p className="font-display text-base sm:text-lg text-slate-300 mt-4 max-w-xl leading-relaxed">
                Your favourite browser mini-games, all in one place. No downloads, zero lag, instant 3D and arcade fun directly on desktop and mobile!
              </p>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/games/${heroGame.slug}`}
                onClick={() => soundManager.playClick()}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-arcade text-sm font-black tracking-wider shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>PLAY {heroGame.title.toUpperCase()}</span>
              </Link>

              <Link
                to="/games"
                onClick={() => soundManager.playClick()}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 border border-white/10 hover:border-indigo-400 text-slate-200 hover:text-white font-arcade text-sm font-bold tracking-wider active:scale-95 transition-all flex items-center gap-2"
              >
                <span>EXPLORE ALL GAMES</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10 w-full max-w-md">
              <div>
                <span className="font-arcade text-2xl font-black text-white">100%</span>
                <span className="text-xs text-slate-400 block font-display">Free to Play</span>
              </div>
              <div>
                <span className="font-arcade text-2xl font-black text-indigo-400">60 FPS</span>
                <span className="text-xs text-slate-400 block font-display">Optimized</span>
              </div>
              <div>
                <span className="font-arcade text-2xl font-black text-pink-400">Instant</span>
                <span className="text-xs text-slate-400 block font-display">Zero Installs</span>
              </div>
            </div>
          </div>

          {/* Right Spotlight Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-slate-900/90 border border-indigo-500/40 p-2 shadow-2xl group hover:border-pink-500/50 transition-all duration-300">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={heroGame.thumbnail}
                  alt={heroGame.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-arcade text-xs font-black tracking-wider shadow-lg">
                    FEATURED GAME
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-arcade text-lg font-black text-white">{heroGame.title}</h3>
                  <p className="text-xs text-slate-400 font-display line-clamp-1">{heroGame.description}</p>
                </div>
                <Link
                  to={`/games/${heroGame.slug}`}
                  onClick={() => soundManager.playClick()}
                  className="p-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-lg shrink-0"
                >
                  <Play className="w-5 h-5 fill-current" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Filter */}
      <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundManager.playClick();
              setSelectedCat(cat);
            }}
            className={`
              px-5 py-2.5 rounded-2xl font-arcade text-xs font-black tracking-wider whitespace-nowrap transition-all active:scale-95
              ${
                selectedCat === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
              }
            `}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </section>

      {/* Featured Games Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-arcade text-xl sm:text-2xl font-black text-white tracking-wide">
                FEATURED GAMES
              </h2>
              <span className="text-xs text-slate-400 font-display">Hand-picked arcade hits</span>
            </div>
          </div>

          <Link
            to="/games"
            className="text-xs font-arcade font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {featuredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favorites.includes(game.slug)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* Ad Placement Container (Monetization Ready) */}
      <AdBanner />

      {/* Trending Games Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-arcade text-xl sm:text-2xl font-black text-white tracking-wide">
                TRENDING NOW
              </h2>
              <span className="text-xs text-slate-400 font-display">Most active players right now</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {trendingGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favorites.includes(game.slug)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* Filtered Section (if user picked category) */}
      {selectedCat !== 'All' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <h2 className="font-arcade text-xl sm:text-2xl font-black text-white tracking-wide">
              {selectedCat.toUpperCase()} GAMES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isFavorite={favorites.includes(game.slug)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
