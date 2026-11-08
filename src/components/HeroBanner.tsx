import React from 'react';
import { ShieldCheck, Truck, Clock, ArrowRight, Flame, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../utils/currency';

import { StoreSettings } from '../types';
import { cleanPhoneForWhatsApp } from '../utils/currency';

interface HeroBannerProps {
  onShopNow: () => void;
  onViewPromotions?: () => void;
  onOpenPromos?: () => void;
  onOpenExportShopify?: () => void;
  featuredProduct?: Product;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  settings?: StoreSettings;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ 
  onShopNow, 
  onViewPromotions,
  onOpenPromos,
  onOpenExportShopify,
  featuredProduct,
  products = [],
  onSelectProduct,
  settings
}) => {
  const handlePromos = onOpenPromos || onViewPromotions || onShopNow;
  const config = settings?.homepageConfig;

  // Custom texts from admin homepage customizer
  const badgeText = config?.heroBadge || "Efficacité • Rapidité • Fiabilité";
  const mainTitle = config?.heroTitle || "Les bons produits";
  const highlightWord = config?.heroHighlight || "au bon prix.";
  const subtitle = config?.heroSubtitle || "Découvrez nos produits tendance et profitez de nos meilleures offres au Sénégal. Livraison rapide à Dakar, banlieue et dans toutes les régions.";
  const primaryBtnText = config?.heroPrimaryBtnText || "ACHETER MAINTENANT";
  const secondaryBtnText = config?.heroSecondaryBtnText || "VOIR LES PROMOTIONS";
  const customBgImage = config?.heroBgImage;
  const gradientTheme = config?.heroBgGradient || 'dark-emerald';

  // Gradient themes mapping
  const gradientClasses = {
    'dark-emerald': 'from-gray-950 via-gray-900 to-emerald-950',
    'sunset': 'from-gray-950 via-red-950 to-orange-950',
    'deep-blue': 'from-gray-950 via-slate-900 to-blue-950',
    'classic-dark': 'from-gray-950 via-gray-900 to-black',
    'electric-purple': 'from-gray-950 via-purple-950 to-indigo-950',
    'midnight-gold': 'from-black via-zinc-900 to-amber-950'
  }[gradientTheme] || 'from-gray-950 via-gray-900 to-emerald-950';

  // Button actions handlers
  const handlePrimaryClick = () => {
    const action = config?.heroPrimaryBtnAction || 'shop';
    if (action === 'promotions') {
      handlePromos();
    } else if (action === 'whatsapp') {
      const phone = cleanPhoneForWhatsApp(settings?.whatsappPhone || settings?.phone || '707717281');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent("Bonjour DIAYMA GAAW, je souhaite avoir des renseignements sur vos produits disponibles.")}`, '_blank');
    } else {
      onShopNow();
    }
  };

  const handleSecondaryClick = () => {
    const action = config?.heroSecondaryBtnAction || 'promotions';
    if (action === 'shop') {
      onShopNow();
    } else if (action === 'whatsapp') {
      const phone = cleanPhoneForWhatsApp(settings?.whatsappPhone || settings?.phone || '707717281');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent("Bonjour DIAYMA GAAW, je souhaite commander un article en promotion.")}`, '_blank');
    } else {
      handlePromos();
    }
  };

  // Sélectionne le produit en promotion vedette (soit celui passé en prop, soit le premier en promo du catalogue)
  const promoProduct = featuredProduct || products.find(p => (p.discountPercent && p.discountPercent > 0) || p.isFlashSale) || products[0];
  const displayImage = promoProduct?.images?.[0] || 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop';
  const displayTitle = promoProduct ? promoProduct.name : 'Produit en Promotion au Sénégal';
  const displayPrice = promoProduct ? formatFCFA(promoProduct.price) : null;
  const displayOriginalPrice = promoProduct?.originalPrice ? formatFCFA(promoProduct.originalPrice) : null;
  const discountText = promoProduct?.discountPercent ? `-${promoProduct.discountPercent}%` : null;

  const handleShowcaseClick = () => {
    if (promoProduct && onSelectProduct) {
      onSelectProduct(promoProduct);
    } else {
      onShopNow();
    }
  };

  return (
    <div className={`relative bg-gradient-to-br ${gradientClasses} text-white overflow-hidden py-12 lg:py-20 border-b border-gray-800`}>
      
      {/* Background Image (If customized by Admin) */}
      {customBgImage && customBgImage.trim() && (
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${customBgImage.trim()})` }}
        />
      )}

      {/* Subtle background glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{badgeText}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] font-display">
              {mainTitle} <br />
              <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                {highlightWord}
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handlePrimaryClick}
                className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base rounded-2xl transition shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>{primaryBtnText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={handleSecondaryClick}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-base rounded-2xl backdrop-blur-md border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>{secondaryBtnText}</span>
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
                    src={displayImage}
                    alt={displayTitle}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
                  
                  {/* Floating Promo Tag */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>PROMO SÉNÉGAL</span>
                    {discountText && (
                      <span className="bg-white/25 px-1.5 py-0.5 rounded text-[10px] ml-0.5 font-black">
                        {discountText}
                      </span>
                    )}
                  </div>

                  {/* Stock Counter Tag */}
                  <div className="absolute top-4 right-4 bg-gray-950/80 backdrop-blur-md text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    ● En stock à Dakar
                  </div>

                  {/* Bottom showcase details */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl text-gray-900 shadow-xl flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold uppercase">
                        <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
                        <span>Offre Spéciale en Promo</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-red-600 transition truncate">
                        {displayTitle}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        {displayPrice && (
                          <span className="text-sm sm:text-base font-black text-red-600">
                            {displayPrice}
                          </span>
                        )}
                        {displayOriginalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {displayOriginalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowcaseClick();
                      }}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer shrink-0"
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
