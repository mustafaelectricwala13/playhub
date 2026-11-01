import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Gamepad2, 
  Search, 
  Trophy, 
  Heart, 
  User, 
  Sparkles, 
  Menu, 
  X,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface NavbarProps {
  onOpenSearch: () => void;
  favoritesCount: number;
  totalCoins: number;
  nickname: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  favoritesCount,
  totalCoins,
  nickname
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'All Games', path: '/games' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Favorites', path: '/favorites' },
    { label: 'Admin', path: '/admin' }
  ];

  const handleNavClick = () => {
    soundManager.playClick();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 group select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-indigo-400 group-hover:text-pink-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-arcade text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-pink-300">
                PLAYHUB
              </span>
              <span className="text-[9px] font-arcade tracking-widest text-indigo-400/80 -mt-1 uppercase">
                Arcade Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleNavClick}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-arcade font-bold tracking-wider transition-all
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons: Search, Favorites, Coins, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenSearch();
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 text-slate-300 hover:text-white flex items-center gap-2 text-xs transition-all active:scale-95"
              title="Search Games (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline font-display text-slate-400">Search games...</span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-400">⌘K</span>
            </button>

            {/* Favorites Icon with Badge */}
            <Link
              to="/favorites"
              onClick={handleNavClick}
              className="relative p-2.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-pink-500/50 text-slate-300 hover:text-pink-400 transition-all active:scale-95"
              title="Favorite Games"
            >
              <Heart className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white font-arcade text-[10px] font-black flex items-center justify-center shadow-lg">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Coins Balance */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-yellow-500/30 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-arcade text-xs font-black text-amber-400">{totalCoins}</span>
            </div>

            {/* Profile Link */}
            <Link
              to="/profile"
              onClick={handleNavClick}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 hover:border-indigo-400 transition-all text-xs active:scale-95"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                {nickname.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-arcade text-xs font-bold text-slate-200 truncate max-w-[90px]">
                {nickname}
              </span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-white/10 px-4 pt-3 pb-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleNavClick}
              className={`
                px-4 py-3 rounded-xl text-sm font-arcade font-bold
                ${
                  location.pathname === link.path
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

