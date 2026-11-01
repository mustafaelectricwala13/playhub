import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GameRegistryItem } from '../types/game';
import { GameRenderer } from '../components/games/GameRenderer';
import { GameCard } from '../components/games/GameCard';
import { AdBanner } from '../components/layout/AdBanner';
import { storageService } from '../services/storage';
import { soundManager } from '../audio/soundManager';
import { 
  Heart, 
  Maximize2, 
  Minimize2, 
  Share2, 
  MessageCircle, 
  Twitter, 
  Copy, 
  Check, 
  Trophy, 
  Sparkles, 
  HelpCircle, 
  Keyboard, 
  ArrowLeft,
  Star,
  Users
} from 'lucide-react';

interface GameDetailPageProps {
  games: GameRegistryItem[];
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({
  games,
  favorites,
  onToggleFavorite
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);

  const game = games.find((g) => g.slug === slug);

  useEffect(() => {
    if (slug) {
      storageService.recordGamePlayed(slug);
      const stats = storageService.getUserStats();
      setPersonalBest(stats.highScores[slug] || 0);
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (!game) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
        <h2 className="font-arcade text-3xl font-black text-white">Game Not Found</h2>
        <p className="text-slate-400">The game you are looking for does not exist or has been moved.</p>
        <Link
          to="/games"
          className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-arcade text-xs font-bold"
        >
          EXPLORE ALL GAMES
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(game.slug);
  const relatedGames = games.filter((g) => g.slug !== game.slug).slice(0, 4);

  const toggleFullscreen = () => {
    const el = document.getElementById('game-theater-wrapper');
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleWhatsApp = () => {
    const text = `Play ${game.title} on PLAYHUB! 🎮 Can you beat my high score of ${personalBest}? Play here: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleTwitter = () => {
    const text = `Playing ${game.title} on @PLAYHUB 🕹️ Jump into the game:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between text-xs font-arcade">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </button>

        <div className="flex items-center gap-2 text-slate-500">
          <Link to="/" className="hover:text-slate-300">HOME</Link>
          <span>/</span>
          <Link to="/games" className="hover:text-slate-300">GAMES</Link>
          <span>/</span>
          <span className="text-indigo-400 font-bold uppercase">{game.title}</span>
        </div>
      </div>

      {/* Main Game Theater Container */}
      <div id="game-theater-wrapper" className="flex flex-col w-full">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
          {/* Top Game Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <h1 className="font-arcade text-xl sm:text-2xl font-black text-white">
                {game.title}
              </h1>
              <span className="text-[10px] font-arcade px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                {game.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(game.slug)}
                className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                  isFavorite
                    ? 'bg-pink-500 text-white border-pink-400 shadow-md'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                }`}
                title={isFavorite ? 'Saved to favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
                title="Theater / Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Actual Playable Game Component */}
          <div className="w-full">
            <GameRenderer
              game={game}
              onScoreUpdate={(s) => {
                if (s > personalBest) {
                  setPersonalBest(s);
                }
              }}
            />
          </div>

          {/* Quick Share & Best Score Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-arcade text-slate-400 block">YOUR BEST SCORE</span>
                <span className="font-arcade text-xl font-black text-white">{personalBest}</span>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] text-white font-arcade text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">WHATSAPP</span>
              </button>

              <button
                onClick={handleTwitter}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1DA1F2] text-white font-arcade text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
              >
                <Twitter className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">TWEET</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-200 font-arcade text-xs font-bold hover:text-white active:scale-95 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monetization Slot */}
      <AdBanner />

      {/* Instructions & Game Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
        {/* Description & Overview */}
        <div className="md:col-span-2 bg-slate-900/60 rounded-3xl p-6 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-400 font-arcade text-sm font-black">
            <HelpCircle className="w-5 h-5" />
            <span>ABOUT THIS GAME</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed font-display">
            {game.longDescription || game.description}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>{game.plays.toLocaleString()} Total Plays</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{game.rating} / 5.0 Community Rating</span>
            </div>
          </div>
        </div>

        {/* Controls Card */}
        <div className="bg-slate-900/60 rounded-3xl p-6 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-pink-400 font-arcade text-sm font-black">
            <Keyboard className="w-5 h-5" />
            <span>HOW TO PLAY</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {game.controls.map((ctrl, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-slate-300 font-display">{ctrl.action}</span>
                <kbd className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px]">
                  {ctrl.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Games Carousel / Grid */}
      <section className="flex flex-col gap-4 max-w-4xl mx-auto w-full pt-4">
        <h3 className="font-arcade text-xl font-black text-white">MORE MINI-GAMES</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {relatedGames.map((rel) => (
            <GameCard
              key={rel.id}
              game={rel}
              isFavorite={favorites.includes(rel.slug)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

