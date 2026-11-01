import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameRegistryItem } from '../../types/game';
import { Search, X, Play, Gamepad2, ArrowRight } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface SearchModalProps {
  games: GameRegistryItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  games,
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle search
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = games.filter((g) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      g.title.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    );
  });

  const handleSelect = (slug: string) => {
    soundManager.playClick();
    onClose();
    navigate(`/games/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all mini-games by name, category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white font-display text-base focus:outline-none placeholder:text-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-arcade text-slate-300 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 flex flex-col gap-2 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No games found matching "{query}".
            </div>
          ) : (
            filtered.map((g) => (
              <div
                key={g.id}
                onClick={() => handleSelect(g.slug)}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-11 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                    <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-arcade text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {g.title}
                      </span>
                      <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        {g.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 font-display">
                      {g.description}
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

