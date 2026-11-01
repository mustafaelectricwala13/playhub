import React from 'react';
import { GameRegistryItem } from '../../types/game';
import { PerfectStackGame } from '../../games/perfect-stack/PerfectStackGame';
import { OneMoreTryGame } from '../../games/one-more-try/OneMoreTryGame';
import { Gamepad2, AlertTriangle } from 'lucide-react';

interface GameRendererProps {
  game: GameRegistryItem;
  onScoreUpdate?: (score: number) => void;
  onCoinsEarned?: (coins: number) => void;
}

export const GameRenderer: React.FC<GameRendererProps> = ({
  game,
  onScoreUpdate,
  onCoinsEarned
}) => {
  if (game.componentName === 'PerfectStack') {
    return <PerfectStackGame onScoreUpdate={onScoreUpdate} onCoinsEarned={onCoinsEarned} />;
  }

  if (game.componentName === 'OneMoreTry') {
    return <OneMoreTryGame onScoreUpdate={onScoreUpdate} onCoinsEarned={onCoinsEarned} />;
  }

  if (game.componentName === 'External' && game.iframeUrl && game.iframeUrl !== 'about:blank') {
    return (
      <div className="relative w-full h-[620px] max-h-[85vh] rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
        <iframe
          src={game.iframeUrl}
          title={game.title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  // Placeholder / Upcoming game preview
  return (
    <div className="relative w-full h-[540px] max-h-[80vh] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
      <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-4">
        <Gamepad2 className="w-10 h-10 text-indigo-400 animate-pulse" />
      </div>
      <h3 className="font-arcade text-3xl font-black text-white mb-2">{game.title}</h3>
      <p className="text-slate-300 max-w-md mb-6">{game.description}</p>
      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-xl text-indigo-300 font-arcade text-xs font-bold">
        <span>🎮 NATIVE GAME EXPANSION SLOT READY</span>
      </div>
    </div>
  );
};
