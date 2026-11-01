import React from 'react';
import { Link } from 'react-router-dom';
import { GameRegistryItem } from '../../types/game';
import { soundManager } from '../../audio/soundManager';
import { Play, Heart, Star, Users } from 'lucide-react';

interface GameCardProps {
  game: GameRegistryItem;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onToggleFavorite
}) => {
  const handlePlayClick = () => {
    soundManager.playClick();
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    soundManager.playClick();
    onToggleFavorite(game.slug);
  };

  const badgeColors: Record<string, string> = {
    HOT: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    NEW: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black',
    POPULAR: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black',
    FEATURED: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
  };

  return (
    <div className="group relative bg-slate-900/90 rounded-2xl border border-white/10 hover:border-indigo-500/50 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(99,102,241,0.25)]">
      {/* Thumbnail Area with Aspect Ratio */}
      <Link
        to={`/games/${game.slug}`}
        onClick={handlePlayClick}
        className="relative block w-full aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer"
      >
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Badge (HOT / NEW / POPULAR) */}
        {game.badge && (
          <div className="absolute top-2.5 left-2.5">
            <span className={`px-2 py-0.5 rounded-md font-arcade text-[10px] tracking-wider shadow-md ${badgeColors[game.badge] || 'bg-indigo-600 text-white'}`}>
              {game.badge}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavClick}
          className={`
            absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90
            ${
              isFavorite
                ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)]'
                : 'bg-slate-950/60 border border-white/10 text-white/70 hover:text-white hover:bg-slate-900'
            }
          `}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Play Pill */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-arcade text-xs font-black tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.8)] transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY NOW</span>
          </div>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-arcade text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              {game.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-display font-semibold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{game.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/games/${game.slug}`}
            onClick={handlePlayClick}
            className="block font-arcade text-base font-black text-white group-hover:text-indigo-300 transition-colors line-clamp-1"
          >
            {game.title}
          </Link>

          {/* Short Description */}
          <p className="text-xs text-slate-400 font-display mt-1 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Card Footer: Plays & Play Button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-display">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{(game.plays / 1000).toFixed(1)}k plays</span>
          </div>

          <Link
            to={`/games/${game.slug}`}
            onClick={handlePlayClick}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-arcade text-[11px] font-black transition-all flex items-center gap-1"
          >
            <span>PLAY</span>
            <Play className="w-2.5 h-2.5 fill-current" />
          </Link>
        </div>
      </div>
    </div>
  );
};
