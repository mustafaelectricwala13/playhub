import React from 'react';
import { GameRegistryItem } from '../../types/game';
import { GameCard } from './GameCard';
import { Gamepad2 } from 'lucide-react';

interface GameGridProps {
  games: GameRegistryItem[];
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
  emptyMessage?: string;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  favorites,
  onToggleFavorite,
  emptyMessage = 'No games found.'
}) => {
  if (games.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 rounded-3xl border border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
          <Gamepad2 className="w-8 h-8 opacity-60" />
        </div>
        <h4 className="font-arcade text-lg font-bold text-white mb-1">No Games Found</h4>
        <p className="text-slate-400 text-sm max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          isFavorite={favorites.includes(game.slug)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

