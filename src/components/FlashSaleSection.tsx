import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Clock, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  ShoppingCart, 
  Zap,
  Sparkles,
  Tag
} from 'lucide-react';
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

  // Compte à rebours 12h
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

  // Produits en promotion pour le diaporama
  const promoProducts = products.filter(p => (p.discountPercent && p.discountPercent > 0) || p.isFlashSale);

  // Configuration du Diaporama / Slider
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Détection responsive du nombre de cartes visibles par diapositive
  useEffect(() => {
    const updateVisibleCount = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setVisibleCount(1); // Mobile: 1 carte
        } else if (window.innerWidth < 1024) {
          setVisibleCount(2); // Tablette: 2 cartes
        } else {
          setVisibleCount(3); // Desktop: 3 cartes
        }
      }
    };
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, promoProducts.length - visibleCount);

  // Navigation du diaporama
  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
  };

  // Défilement automatique du diaporama toutes les 4.5 secondes
  useEffect(() => {
    if (!isAutoPlaying || isHovered || maxIndex === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, maxIndex]);

  // Support du glissement tactile (swipe) sur mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext(); // Glissement vers la gauche -> slide suivante
    } else if (diff < -45) {
      handlePrev(); // Glissement vers la droite -> slide précédente
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (promoProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-gradient-to-br from-gray-950 via-red-950/95 to-gray-950 text-white relative overflow-hidden font-sans border-y border-red-900/40">
      
      {/* Lueur d'ambiance festive */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Entête de la section Promo Sénégal avec compte à rebours */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-red-900/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600/50 via-orange-600/40 to-amber-600/40 text-red-200 border border-red-500/50 text-xs font-black uppercase tracking-wider mb-2.5 shadow-md shadow-red-950">
              <ActiveFlame size="xs" />
              <span>🇸🇳 PROMO SÉNÉGAL • GRAND DIAPORAMA EXCLUSIF</span>
            </div>
            
            <div className="flex items-center gap-3">
              <ActiveFlame size="lg" className="shrink-0" />
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display text-white drop-shadow-md">
                PROMO SÉNÉGAL : OFFRES FLASH
              </h2>
              <ActiveFlame size="lg" className="shrink-0 hidden sm:inline-flex" />
            </div>

            <p className="text-gray-300 text-xs sm:text-base mt-2 max-w-xl">
              Faites défiler le diaporama des meilleures remises au Sénégal. Articles neufs avec garantie, en stock à Dakar et expédiés rapidement partout dans le pays.
            </p>
          </div>

          {/* Horloge compte à rebours & Contrôles du Diaporama */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Countdown Box */}
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-red-500/30 shadow-lg">
              <div className="flex items-center gap-1.5 text-red-400">
                <Clock className="w-4 h-4 animate-pulse text-amber-400" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Fin dans :</span>
              </div>
              <div className="flex items-center gap-1 text-center font-mono">
                <div className="bg-red-600 px-2.5 py-1.5 rounded-lg border border-red-400/40 shadow-xs">
                  <span className="text-base sm:text-lg font-black text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] uppercase tracking-wider text-red-100">H</span>
                </div>
                <span className="text-sm font-bold text-red-400">:</span>
                <div className="bg-red-600 px-2.5 py-1.5 rounded-lg border border-red-400/40 shadow-xs">
                  <span className="text-base sm:text-lg font-black text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] uppercase tracking-wider text-red-100">M</span>
                </div>
                <span className="text-sm font-bold text-red-400">:</span>
                <div className="bg-red-600 px-2.5 py-1.5 rounded-lg border border-red-400/40 shadow-xs">
                  <span className="text-base sm:text-lg font-black text-white">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] uppercase tracking-wider text-red-100">S</span>
                </div>
              </div>
            </div>

            {/* Boutons de contrôle du Diaporama (Précédent / Lecture-Pause / Suivant) */}
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-2xl border border-red-900/60">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl bg-gray-900 hover:bg-red-600 text-white flex items-center justify-center transition border border-gray-800 hover:border-red-500 cursor-pointer shadow-md active:scale-95"
                title="Diapositive précédente"
                aria-label="Article promo précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition border cursor-pointer active:scale-95 ${
                  isAutoPlaying 
                    ? 'bg-red-600/30 text-amber-300 border-red-500/40 hover:bg-red-600/50' 
                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                }`}
                title={isAutoPlaying ? 'Mettre en pause le diaporama' : 'Reprendre le diaporama automatique'}
                aria-label="Lecture ou pause du diaporama"
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-xl bg-gray-900 hover:bg-red-600 text-white flex items-center justify-center transition border border-gray-800 hover:border-red-500 cursor-pointer shadow-md active:scale-95"
                title="Diapositive suivante"
                aria-label="Article promo suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* DIAPORAMA / CARROUSEL INTERACTIF */}
        <div 
          className="relative group/diaporama"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Flèches de navigation latérales flottantes */}
          <button
            onClick={handlePrev}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gray-950/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl border border-red-500/40 hover:border-red-400 transition transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Diapositive précédente"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gray-950/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl border border-red-500/40 hover:border-red-400 transition transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Diapositive suivante"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Rail du diaporama (Track) */}
          <div className="overflow-hidden rounded-2xl py-2 px-1">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
              }}
            >
              {promoProducts.map((prod) => {
                const discountAmount = prod.originalPrice && prod.originalPrice > prod.price 
                  ? prod.originalPrice - prod.price 
                  : 0;

                return (
                  <div
                    key={prod.id}
                    style={{ width: `${100 / visibleCount}%` }}
                    className="shrink-0 p-2 sm:p-3"
                  >
                    <div
                      onClick={() => onSelectProduct(prod)}
                      className="h-full bg-gradient-to-b from-gray-900/95 to-gray-950/95 rounded-2xl border border-red-900/40 hover:border-red-500 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/80 flex flex-col justify-between cursor-pointer group/card relative"
                    >
                      {/* En-tête photo du produit */}
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/50 mb-3.5">
                        <img
                          src={prod.images && prod.images[0] ? prod.images[0] : ''}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover/card:scale-108 transition duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent"></div>

                        {/* Badge Promo Sénégal & Remise */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                          <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 border border-red-400/40">
                            <ActiveFlame size="xs" glow={false} />
                            <span>-{prod.discountPercent || 25}% ÉCONOMIE</span>
                          </span>
                          <span className="bg-black/80 backdrop-blur-xs text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded shadow">
                            🇸🇳 PROMO SÉNÉGAL
                          </span>
                        </div>

                        {/* Badge Vente Flash */}
                        <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span>Flash</span>
                        </div>

                        {/* Économie en FCFA */}
                        {discountAmount > 0 && (
                          <div className="absolute bottom-2 left-2.5 right-2.5">
                            <span className="text-[10px] font-extrabold text-amber-200 bg-red-950/90 backdrop-blur-xs px-2 py-0.5 rounded border border-red-500/30">
                              Gain : {formatFCFA(discountAmount)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contenu textuel */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {prod.brand && (
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                              {prod.brand}
                            </span>
                          )}

                          <h3 className="text-sm font-bold text-white line-clamp-2 group-hover/card:text-red-400 transition mt-0.5 mb-2 leading-snug">
                            {prod.name}
                          </h3>

                          {/* Prix */}
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-xl sm:text-2xl font-black text-white">
                              {formatFCFA(prod.price)}
                            </span>
                            {prod.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatFCFA(prod.originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* Jauge de stock restant */}
                          <div className="space-y-1 mb-4 bg-gray-950/60 p-2 rounded-xl border border-gray-800">
                            <div className="flex justify-between text-[11px] text-gray-300 font-semibold">
                              <span>Stock à Dakar : <strong className="text-white">{prod.stock} unités</strong></span>
                              <span className="text-amber-400 font-bold">En cours</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(20, (prod.stock / 25) * 100))}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Boutons d'action rapides */}
                        <div className="space-y-2 pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onBuyNow) {
                                onBuyNow(prod, e);
                              } else {
                                onSelectProduct(prod);
                              }
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:to-orange-700 active:scale-95 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer"
                          >
                            <ActiveFlame size="xs" glow={false} />
                            <span>COMMANDER EN PROMO</span>
                          </button>

                          {onAddToCart && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(prod, e);
                              }}
                              className="w-full py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-gray-200 hover:text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/15"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 text-red-400" />
                              <span>Ajouter au panier</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indicateurs de diapositives / Pagination */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-8 h-2.5 bg-gradient-to-r from-red-500 to-orange-500 shadow-md shadow-red-600/50'
                    : 'w-2.5 h-2.5 bg-gray-700 hover:bg-gray-500'
                }`}
                aria-label={`Aller à la diapositive ${idx + 1}`}
              />
            ))}
          </div>

          {/* Numérotation de la diapositive courante */}
          <div className="text-center mt-2 text-[11px] font-bold text-gray-400">
            <span>Affichage {currentIndex + 1} à {Math.min(currentIndex + visibleCount, promoProducts.length)} sur {promoProducts.length} articles en promotion</span>
          </div>
        </div>

        {/* Bouton pour parcourir toutes les offres */}
        <div className="mt-8 text-center">
          <button
            onClick={handlePromos}
            className="px-8 py-3.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-950 transition inline-flex items-center gap-3 active:scale-95 cursor-pointer border border-red-400/30"
          >
            <ActiveFlame size="sm" />
            <span>VOIR TOUTES LES PROMOTIONS DU SÉNÉGAL ({promoProducts.length} ARTICLES)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
