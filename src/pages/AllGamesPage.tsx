import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GameRegistryItem, GameCategory } from '../types/game';
import { GameGrid } from '../components/games/GameGrid';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface AllGamesPageProps {
  games: GameRegistryItem[];
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
}

export const AllGamesPage: React.FC<AllGamesPageProps> = ({
  games,
  favorites,
  onToggleFavorite
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = (searchParams.get('cat') as GameCategory) || 'All';

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GameCategory>(initialCat);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'az'>('popular');

  const categories: GameCategory[] = ['All', 'Arcade', 'Puzzle', 'Casual', 'Skill'];

  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        const matchesCat = category === 'All' || g.category.toLowerCase() === category.toLowerCase();
        const matchesQuery = 
          !query.trim() ||
          g.title.toLowerCase().includes(query.toLowerCase()) ||
          g.description.toLowerCase().includes(query.toLowerCase());
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.plays - a.plays;
        if (sortBy === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'az') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [games, category, query, sortBy]);

  const handleCategoryChange = (cat: GameCategory) => {
    soundManager.playClick();
    setCategory(cat);
    if (cat === 'All') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat });
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-arcade text-3xl sm:text-4xl font-black text-white">
          ALL MINI-GAMES
        </h1>
        <p className="text-slate-400 font-display text-sm">
          Browse our entire arcade collection. Filter, search, and jump into instant play!
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/60 p-4 rounded-3xl border border-white/10">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search games by title or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`
                px-4 py-2 rounded-xl font-arcade text-xs font-bold tracking-wider whitespace-nowrap transition-all active:scale-95
                ${
                  category === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-950 border border-white/10 text-slate-400 hover:text-white'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-2xl px-3 py-2 shrink-0">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-arcade font-bold text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="popular" className="bg-slate-900 text-white">Most Popular</option>
            <option value="newest" className="bg-slate-900 text-white">Newest First</option>
            <option value="rating" className="bg-slate-900 text-white">Highest Rated</option>
            <option value="az" className="bg-slate-900 text-white">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid Results */}
      <div>
        <div className="flex items-center justify-between mb-4 text-xs font-arcade text-slate-400">
          <span>SHOWING {filteredGames.length} GAMES</span>
          {category !== 'All' && <span>FILTER: {category.toUpperCase()}</span>}
        </div>

        <GameGrid
          games={filteredGames}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          emptyMessage="No games matched your current filter criteria."
        />
      </div>
    </div>
  );
};
