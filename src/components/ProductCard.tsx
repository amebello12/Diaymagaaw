import React, { useState } from 'react';
import { ShoppingCart, Zap, Star, MessageCircle, Share2 } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatFCFA, createWhatsAppProductMessage } from '../utils/currency';
import { ActiveFlame } from './ActiveFlame';
import { SocialShareModal } from './SocialShareModal';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
  settings?: StoreSettings;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  settings
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => onSelectProduct(product)}
        className="group relative bg-white rounded-2xl border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
      >
        {/* Badges Top Bar */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
          {product.discountPercent && product.discountPercent > 0 ? (
            <span className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 border border-red-400/40">
              <ActiveFlame size="xs" glow={false} />
              <span>PROMO</span>
              <span>-{product.discountPercent}%</span>
            </span>
          ) : product.isFlashSale ? (
            <span className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 border border-red-400/40">
              <ActiveFlame size="xs" glow={false} />
              <span>FLASH</span>
            </span>
          ) : product.isNew ? (
            <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md">
              NOUVEAU
            </span>
          ) : (
            <div></div>
          )}

          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
              Plus que {product.stock}
            </span>
          )}
        </div>

        {/* Product Image */}
        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden p-3">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Share Button (WhatsApp, Facebook, Instagram, etc.) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsShareOpen(true);
            }}
            className="absolute bottom-2 left-2 bg-white/90 hover:bg-white active:scale-95 text-gray-700 hover:text-red-600 p-2 rounded-xl shadow-md transition flex items-center justify-center border border-gray-200 z-10 cursor-pointer"
            title="Partager cet article (WhatsApp, Facebook, Instagram...)"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Bouton direct Commander via WhatsApp Business */}
          <a
            href={createWhatsAppProductMessage(product.name, product.price, product.sku, settings?.whatsappPhone || settings?.phone)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2.5 py-1.5 rounded-xl shadow-lg transition flex items-center gap-1.5 text-[11px] font-black z-10"
            title="Commander directement cet article sur WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>WhatsApp</span>
          </a>
        </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">
              {product.brand || 'DIAYMA GAAW'}
            </span>
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-gray-800 text-[11px]">{product.rating}</span>
              <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-red-600 transition leading-snug">
            {product.name}
          </h3>

          {/* Prices */}
          <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-red-600">
              {formatFCFA(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatFCFA(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
          
          <button
            onClick={(e) => onAddToCart(product, e)}
            className="w-full py-2.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
            title="Ajouter au panier"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="truncate">Au panier</span>
          </button>

          <button
            onClick={(e) => onBuyNow(product, e)}
            className="w-full py-2.5 px-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-red-600/30 cursor-pointer"
            title="Acheter directement"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span className="truncate">Acheter</span>
          </button>

        </div>
      </div>
    </div>

    <SocialShareModal
      product={product}
      isOpen={isShareOpen}
      onClose={() => setIsShareOpen(false)}
      settings={settings}
    />
  </>
  );
};
