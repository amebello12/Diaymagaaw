import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../utils/currency';
import { ActiveFlame } from './ActiveFlame';

interface FlashSaleSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, e?: React.MouseEvent) => void;
  onBuyNow?: (product: Product, e?: React.MouseEvent) => void;
  onViewPromotions?: () => void;
  onViewAllPromos?: () => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onViewPromotions,
  onViewAllPromos
}) => {
  const handlePromos = onViewAllPromos || onViewPromotions || (() => {});
  // 12 hours countdown loop
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter(p => p.isFlashSale).slice(0, 3);

  return (
    <section className="py-14 bg-gradient-to-br from-gray-950 via-red-950/90 to-gray-950 text-white relative overflow-hidden">
      
      {/* Decorative fire/glow elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header with Countdown */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-red-900/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600/40 via-orange-600/30 to-amber-600/30 text-red-200 border border-red-500/50 text-xs font-black uppercase tracking-wider mb-3 shadow-sm shadow-red-900/50">
              <ActiveFlame size="xs" />
              <span>OFFRES EN FEU • DURÉE LIMITÉE</span>
            </div>
            
            <div className="flex items-center gap-3">
              <ActiveFlame size="lg" className="shrink-0" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display text-white drop-shadow-md">
                GRANDES PROMOTIONS FLASH
              </h2>
              <ActiveFlame size="lg" className="shrink-0 hidden sm:inline-flex" />
            </div>

            <p className="text-gray-300 text-sm sm:text-base mt-2 max-w-xl">
              Profitez de nos offres exceptionnelles avant la fin du stock. Livraison express dans tout le Sénégal.
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-red-500/30">
            <div className="flex items-center gap-2 text-red-400">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider">Expire dans :</span>
            </div>
            <div className="flex items-center gap-2 text-center">
              <div className="bg-red-600/80 px-3 py-2 rounded-xl border border-red-400/40">
                <span className="text-xl sm:text-2xl font-black font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-red-200">Heures</span>
              </div>
              <span className="text-xl font-bold text-red-400">:</span>
              <div className="bg-red-600/80 px-3 py-2 rounded-xl border border-red-400/40">
                <span className="text-xl sm:text-2xl font-black font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-red-200">Min</span>
              </div>
              <span className="text-xl font-bold text-red-400">:</span>
              <div className="bg-red-600/80 px-3 py-2 rounded-xl border border-red-400/40">
                <span className="text-xl sm:text-2xl font-black font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-red-200">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Items Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {flashProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className="bg-gray-900/90 rounded-2xl border border-red-900/40 hover:border-red-500 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950 flex flex-col justify-between cursor-pointer group"
            >
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/40 mb-4">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5 border border-red-400/40">
                  <ActiveFlame size="xs" glow={false} />
                  <span>-{prod.discountPercent || 30}% ÉCONOMIE</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-red-400 transition mb-2">
                  {prod.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-black text-white">
                    {formatFCFA(prod.price)}
                  </span>
                  {prod.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatFCFA(prod.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Stock Progress Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] text-gray-300 font-semibold">
                    <span>Stock restant : {prod.stock} unités</span>
                    <span className="text-amber-400">Presque épuisé</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full"
                      style={{ width: `${Math.max(15, (prod.stock / 20) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBuyNow) {
                    onBuyNow(prod, e);
                  } else {
                    onSelectProduct(prod);
                  }
                }}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:to-orange-700 active:scale-95 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                <ActiveFlame size="xs" glow={false} />
                <span>COMMANDER EN PROMO FLASH</span>
              </button>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-10 text-center">
          <button
            onClick={handlePromos}
            className="px-8 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-900/50 transition inline-flex items-center gap-3 active:scale-95 cursor-pointer border border-red-400/30"
          >
            <ActiveFlame size="sm" />
            <span>DÉCOUVRIR TOUTES LES OFFRES FLASH EN FEU</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
