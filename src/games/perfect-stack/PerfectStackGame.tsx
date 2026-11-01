import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { StackEngine } from './StackEngine';
import { soundManager } from '../../audio/soundManager';
import { storageService } from '../../services/storage';
import { supabaseService } from '../../services/supabase';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  MessageCircle, 
  Trophy, 
  Tv, 
  Pause, 
  Flame
} from 'lucide-react';

interface PerfectStackGameProps {
  onScoreUpdate?: (score: number) => void;
  onCoinsEarned?: (coins: number) => void;
}

export const PerfectStackGame: React.FC<PerfectStackGameProps> = ({
  onScoreUpdate,
  onCoinsEarned
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<StackEngine | null>(null);

  // Game state
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled());
  const [rewardedAdAvailable, setRewardedAdAvailable] = useState(true);

  // Load High Score on mount
  useEffect(() => {
    const stats = storageService.getUserStats();
    setHighScore(stats.highScores['perfect-stack'] || 0);
  }, []);

  // Initialize Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new StackEngine(containerRef.current, {
      onScoreUpdate: (s) => {
        setScore(s);
        if (onScoreUpdate) onScoreUpdate(s);
      },
      onComboUpdate: (c) => setCombo(c),
      onCoinUpdate: (c) => {
        setCoins(c);
        if (onCoinsEarned) onCoinsEarned(c);
      },
      onGameOver: (finalScore, earnedCoins) => {
        setGameState('gameover');
        const stats = storageService.getUserStats();
        const prevBest = stats.highScores['perfect-stack'] || 0;
        const isBest = finalScore > prevBest;
        setIsNewHigh(isBest);

        storageService.recordGamePlayed('perfect-stack', finalScore);
        if (earnedCoins > 0) {
          stats.totalCoins += earnedCoins;
          storageService.saveUserStats(stats);
        }

        // Leaderboard submission
        supabaseService.submitScore(stats.nickname, 'perfect-stack', 'Perfect Stack', finalScore);

        if (isBest && finalScore > 5) {
          try {
            confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
        }
      }
    });

    engineRef.current = engine;

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
  }, [onScoreUpdate, onCoinsEarned]);

  const handleStart = () => {
    setScore(0);
    setCombo(0);
    setCoins(0);
    setIsNewHigh(false);
    setGameState('playing');
    engineRef.current?.start();
  };

  const handlePause = () => {
    setGameState('paused');
    engineRef.current?.pause();
  };

  const handleResume = () => {
    setGameState('playing');
    engineRef.current?.resume();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        if (gameState === 'playing' && engineRef.current) {
          engineRef.current.handlePlace();
        } else if (gameState === 'idle' || gameState === 'gameover') {
          handleStart();
        }
      } else if (e.code === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
          handlePause();
        } else if (gameState === 'paused') {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleTapAction = (e: React.PointerEvent) => {
    if (gameState === 'playing' && engineRef.current) {
      e.preventDefault();
      engineRef.current.handlePlace();
    } else if (gameState === 'idle') {
      e.preventDefault();
      handleStart();
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSoundEnabled(next);
  };

  const handleShareWhatsApp = () => {
    const text = `I just scored ${score} in PERFECT STACK! 🏆 Can you beat me? Play now: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleWatchRewardedAd = () => {
    soundManager.playCoin();
    setRewardedAdAvailable(false);
    const stats = storageService.getUserStats();
    stats.totalCoins += 50;
    storageService.saveUserStats(stats);
    alert('Rewarded Ad watched! +50 bonus gems added to your wallet.');
  };

  return (
    <div 
      onPointerDown={handleTapAction}
      className="relative w-full h-[620px] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl select-none bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border border-white/10 flex items-center justify-center cursor-pointer touch-none"
    >
      {/* 3D Three.js Container */}
      <div
        ref={containerRef}
        className="w-full h-full pointer-events-none"
      />

      {/* Top HUD (during play) */}
      {gameState === 'playing' && (
        <div className="absolute top-4 inset-x-4 flex items-start justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-arcade text-sm font-black text-amber-400">+{coins}</span>
            </div>
            {combo > 1 && (
              <div className="bg-gradient-to-r from-pink-500 to-indigo-500 px-3 py-1 rounded-full text-xs font-arcade font-black text-white shadow-lg animate-bounce flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>PERFECT x{combo}!</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="font-arcade text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]">
              {score}
            </span>
            <span className="text-[10px] font-arcade text-white/50 tracking-wider">
              BEST: {Math.max(highScore, score)}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={toggleSound}
              className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-white/40" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePause();
              }}
              className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Start / Idle Screen */}
      {gameState === 'idle' && (
        <div 
          onClick={handleStart}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-4 max-w-sm">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-[0_0_40px_rgba(99,102,241,0.6)] animate-float">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-pink-500 rounded-lg transform rotate-12 shadow-md" />
              </div>
            </div>

            <div>
              <h2 className="font-arcade text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 drop-shadow-[0_0_25px_rgba(99,102,241,0.8)]">
                PERFECT STACK
              </h2>
              <p className="text-sm font-display text-slate-300 mt-1">
                Tap anywhere to drop 3D blocks. Slice overhangs & stack to infinity!
              </p>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-2xl px-6 py-2.5 shadow-xl flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] font-arcade text-slate-400 block">PERSONAL RECORD</span>
                <span className="font-arcade text-2xl font-black text-white">{highScore}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-arcade text-lg font-black tracking-widest shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>TAP TO PLAY</span>
            </button>
            <span className="text-xs text-slate-400 font-display">
              Or press <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-white">SPACE</kbd>
            </span>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div 
          onClick={handleStart}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-4 max-w-sm w-full cursor-default"
          >
            {/* Prominent OUT! Announcement */}
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-600/30 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-bounce">
                <span className="text-xl">💥</span>
                <span className="font-arcade text-sm font-black text-red-300 tracking-widest uppercase">
                  YOU ARE OUT!
                </span>
              </div>
              <h2 className="font-arcade text-4xl sm:text-5xl font-black text-white drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]">
                GAME OVER
              </h2>
              <span className="text-xs font-arcade text-pink-400 font-bold tracking-wider uppercase">
                {isNewHigh ? '★ NEW ALL-TIME RECORD! ★' : 'Tower Toppled! Ready for revenge?'}
              </span>
            </div>

            {/* Score Display */}
            <div className="flex flex-col items-center py-1">
              <span className="font-arcade text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white drop-shadow-[0_0_25px_rgba(99,102,241,0.8)]">
                {score}
              </span>
              <span className="text-xs font-arcade text-slate-400 tracking-wider">BLOCKS STACKED</span>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full bg-slate-900/90 border border-white/10 rounded-2xl p-3 shadow-xl">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <span className="text-[10px] font-arcade text-slate-400 block">BEST SCORE</span>
                  <span className="font-arcade text-lg font-black text-white">{Math.max(highScore, score)}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 border-l border-white/10">
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div className="text-left">
                  <span className="text-[10px] font-arcade text-slate-400 block">GEMS EARNED</span>
                  <span className="font-arcade text-lg font-black text-amber-400">+{coins}</span>
                </div>
              </div>
            </div>

            {/* Restart & Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-500 via-pink-500 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-arcade text-lg font-black tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-white/20"
              >
                <RotateCcw className="w-6 h-6 stroke-[3]" />
                <span>🔄 RESTART (PLAY AGAIN)</span>
              </button>

              <div 
                onClick={handleStart}
                className="text-[11px] font-arcade text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Or tap anywhere / press <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-white text-[11px]">SPACE</kbd>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareWhatsApp();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] text-white font-arcade text-xs font-black tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>CHALLENGE ON WHATSAPP</span>
              </button>

              {rewardedAdAvailable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWatchRewardedAd();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800/80 border border-amber-500/40 text-amber-300 font-arcade text-[11px] font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Tv className="w-4 h-4" />
                  <span>WATCH AD FOR +50 GEMS (MONETIZATION READY)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {gameState === 'paused' && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20"
        >
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-xs w-full text-center flex flex-col gap-4 shadow-2xl">
            <h3 className="font-arcade text-2xl font-black text-white">PAUSED</h3>
            <button
              onClick={handleResume}
              className="py-3 px-6 rounded-xl bg-indigo-600 text-white font-arcade text-sm font-bold active:scale-95 transition-all"
            >
              RESUME
            </button>
            <button
              onClick={handleStart}
              className="py-2.5 px-6 rounded-xl bg-slate-800 text-slate-200 font-arcade text-xs font-bold active:scale-95 transition-all"
            >
              RESTART
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
