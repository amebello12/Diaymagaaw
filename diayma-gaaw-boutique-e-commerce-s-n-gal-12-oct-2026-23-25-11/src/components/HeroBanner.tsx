import React from 'react';
import { ShieldCheck, Truck, Clock, ArrowRight, Flame, Sparkles } from 'lucide-react';
import { WaveLogo, OrangeMoneyLogo, FreeMoneyLogo, CashOnDeliveryLogo } from './PaymentLogos';
import { Product } from '../types';

interface HeroBannerProps {
  onShopNow: () => void;
  onViewPromotions?: () => void;
  onOpenPromos?: () => void;
  onOpenExportShopify?: () => void;
  featuredProduct?: Product;
  onSelectProduct?: (product: Product) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ 
  onShopNow, 
  onViewPromotions,
  onOpenPromos,
  onOpenExportShopify,
  featuredProduct,
  onSelectProduct
}) => {
  const handlePromos = onOpenPromos || onViewPromotions || onShopNow;
  const handleShowcaseClick = () => {
    if (featuredProduct && onSelectProduct) {
      onSelectProduct(featuredProduct);
    } else {
      onShopNow();
    }
  };
  return (
    <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 text-white overflow-hidden py-12 lg:py-20 border-b border-gray-800">
      
      {/* Subtle background glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Efficacité • Rapidité • Fiabilité</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] font-display">
              Les bons produits <br />
              <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                au bon prix.
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Découvrez nos produits tendance et profitez de nos meilleures offres au Sénégal. 
              Livraison rapide à Dakar, banlieue et dans toutes les régions. 
              Payez en toute tranquillité avec <strong className="text-white font-semibold">Wave</strong>, <strong className="text-white font-semibold">Orange Money</strong>, <strong className="text-white font-semibold">Free Money</strong> ou <strong className="text-white font-semibold">à la livraison</strong>.
            </p>

            {/* Official Mobile Money Badges */}
            <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap pt-1">
              <WaveLogo size="sm" />
              <OrangeMoneyLogo size="sm" />
              <FreeMoneyLogo size="sm" />
              <CashOnDeliveryLogo size="sm" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base rounded-2xl transition shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>ACHETER MAINTENANT</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={handlePromos}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-base rounded-2xl backdrop-blur-md border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>VOIR LES PROMOTIONS</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-800 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white leading-none">Express 2H-4H</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Dakar & Banlieue</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white leading-none">100% Neuf</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Garantie & Facture</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0 font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white leading-none">Paiement Simple</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">À la réception</p>
                </div>
              </div>
            </div>

          </div>

          {/* Hero Visual Card / Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              
              {/* Product Card Container */}
              <div 
                onClick={handleShowcaseClick}
                className="relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl p-3 cursor-pointer group"
                title="Voir les détails du produit"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-square">
                  <img
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"
                    alt="Smartphone et Électronique DIAYMA GAAW"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
                  
                  {/* Floating Promo Tag */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>PROMO SÉNÉGAL</span>
                  </div>

                  {/* Stock Counter Tag */}
                  <div className="absolute top-4 right-4 bg-gray-950/80 backdrop-blur-md text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    ● En stock à Dakar
                  </div>

                  {/* Bottom showcase details */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl text-gray-900 shadow-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold uppercase">
                        <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>Offre Spéciale Semaine</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-red-600 transition">Électronique & Électroménager</h4>
                      <p className="text-xs text-gray-600">Jusqu'à -35% de réduction</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowcaseClick();
                      }}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating review badge */}
              <div className="absolute -bottom-4 -left-4 bg-gray-900/90 backdrop-blur-md border border-gray-700 p-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs text-white">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm">
                  ★
                </div>
                <div>
                  <p className="font-bold">4.9 / 5 étoiles</p>
                  <p className="text-[11px] text-gray-400">+1 200 clients satisfaits</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
