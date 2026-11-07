import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, Flame } from 'lucide-react';
import { StoreSettings } from '../types';

interface PromoAnnouncementBannerProps {
  settings?: StoreSettings;
  onAction?: () => void;
}

export const PromoAnnouncementBanner: React.FC<PromoAnnouncementBannerProps> = ({
  settings,
  onAction
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // If disabled by admin or dismissed by user, do not render
  if (!settings?.enablePromoBanner || isDismissed) {
    return null;
  }

  const text = settings.promoBannerText?.trim() || 
    "🔥 GRANDES PROMOTIONS AU SÉNÉGAL : Jusqu'à -20% avec nos codes promos validés ! • Livraison express 2h sur Dakar • Service client 7j/7 au 70 771 72 81 🇸🇳";
  const badge = settings.promoBannerBadge?.trim() || "VENTE FLASH";
  const buttonText = settings.promoBannerButtonText?.trim() || "Voir les offres";
  const colorTheme = settings.promoBannerBgColor || 'red';
  const isMarquee = settings.promoBannerSpeed !== 'static';

  const themeStyles = {
    red: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xs',
    gold: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-gray-950 shadow-xs font-bold',
    emerald: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xs',
    dark: 'bg-gradient-to-r from-gray-950 via-slate-900 to-black text-amber-300 border-b border-amber-500/20 shadow-xs',
    blue: 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white shadow-xs'
  };

  const badgeBg = {
    red: 'bg-white/20 text-white border-white/30',
    gold: 'bg-black/15 text-gray-950 border-black/20 font-black',
    emerald: 'bg-white/20 text-white border-white/30',
    dark: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    blue: 'bg-white/20 text-white border-white/30'
  };

  const buttonStyles = {
    red: 'bg-white text-red-700 hover:bg-red-50',
    gold: 'bg-gray-950 text-amber-300 hover:bg-black',
    emerald: 'bg-white text-emerald-800 hover:bg-emerald-50',
    dark: 'bg-amber-400 text-gray-950 hover:bg-amber-300',
    blue: 'bg-white text-blue-800 hover:bg-blue-50'
  };

  return (
    <aside 
      aria-label="Bande passante promotionnelle"
      className={`relative w-full overflow-hidden text-xs py-2 px-3 sm:px-4 z-50 select-none transition-colors duration-300 ${themeStyles[colorTheme] || themeStyles.red}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left Badge */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-2xs ${badgeBg[colorTheme] || badgeBg.red}`}>
            <Flame className="w-3 h-3 animate-pulse" />
            <span>{badge}</span>
          </span>
        </div>

        {/* Center: Marquee or Static text */}
        <div className="flex-1 min-w-0 overflow-hidden relative">
          {isMarquee ? (
            <div 
              onClick={onAction}
              className="flex items-center gap-6 cursor-pointer whitespace-nowrap animate-marquee hover:[animation-play-state:paused]"
              title="Cliquer pour voir les promotions"
            >
              <div className="flex items-center gap-2 font-medium tracking-wide">
                <span>{text}</span>
                <span className="opacity-60">•</span>
                <span>{text}</span>
              </div>
            </div>
          ) : (
            <div 
              onClick={onAction}
              className="text-center font-medium tracking-wide truncate cursor-pointer hover:underline flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{text}</span>
            </div>
          )}
        </div>

        {/* Right CTA Button & Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          {onAction && buttonText && (
            <button
              type="button"
              onClick={onAction}
              className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1 transition shadow-xs cursor-pointer ${buttonStyles[colorTheme] || buttonStyles.red}`}
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-full opacity-70 hover:opacity-100 hover:bg-black/10 transition cursor-pointer"
            title="Masquer le bandeau"
            aria-label="Fermer le bandeau promo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </aside>
  );
};
