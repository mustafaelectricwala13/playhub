import React from 'react';
import { Link } from 'react-router-dom';
import { GameRegistryItem } from '../types/game';
import { GameGrid } from '../components/games/GameGrid';
import { Heart, ArrowRight } from 'lucide-react';

interface FavoritesPageProps {
  games: GameRegistryItem[];
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  games,
  favorites,
  onToggleFavorite
}) => {
  const favoriteGames = games.filter((g) => favorites.includes(g.slug));

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="font-arcade text-3xl font-black text-white">YOUR FAVORITE GAMES</h1>
          <p className="text-slate-400 font-display text-sm">
            Quick access to your saved arcade mini-games.
          </p>
        </div>
      </div>

      {favoriteGames.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-slate-900/40 rounded-3xl border border-white/5">
          <Heart className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="font-arcade text-xl font-bold text-white mb-2">No Saved Favorites Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-6">
            Click the heart icon on any game card to bookmark your top favorites here for quick play!
          </p>
          <Link
            to="/games"
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-arcade text-xs font-bold flex items-center gap-2"
          >
            <span>DISCOVER GAMES</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <GameGrid
          games={favoriteGames}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
};
