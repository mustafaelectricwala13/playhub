import React from 'react';
import { Tv, Sparkles } from 'lucide-react';

interface AdBannerProps {
  format?: 'horizontal' | 'rectangle' | 'badge';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  format = 'horizontal',
  className = ''
}) => {
  // Enabled only when real AdSense ID is provided via environment variable
  const adSenseId = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';
  const isLive = Boolean(adSenseId);

  if (isLive) {
    return (
      <div className={`w-full overflow-hidden flex justify-center my-4 ${className}`}>
        {/* Google AdSense ins container */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adSenseId}
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Elegant non-intrusive monetization placeholder (ready for activation)
  return (
    <div
      className={`
        w-full rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm
        flex items-center justify-between p-3.5 my-4 text-xs text-slate-400 select-none
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-arcade text-[10px] font-bold text-slate-300">
            SPONSOR SPACE • NON-INTRUSIVE MONETIZATION
          </span>
          <span className="text-[11px] text-slate-400 font-display">
            Google AdSense / H5 Games Ads ready slot (activated upon domain approval)
          </span>
        </div>
      </div>

      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400 uppercase font-mono">
        Ad Slot
      </span>
    </div>
  );
};

