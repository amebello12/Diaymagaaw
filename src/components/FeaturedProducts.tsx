import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Flame, Sparkles } from 'lucide-react';
import { ActiveFlame } from './ActiveFlame';

interface FeaturedProductsProps {
  products: Product[];
  categories?: any[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
  onViewAll?: () => void;
  onViewCatalog?: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onViewAll,
  onViewCatalog
}) => {
  const handleViewAll = onViewCatalog || onViewAll || (() => {});
  const [filter, setFilter] = useState<'all' | 'promos' | 'electronics' | 'appliances'>('all');

  const filteredProducts = products.filter(p => {
    if (filter === 'promos') return (p.discountPercent && p.discountPercent > 0) || p.isFlashSale;
    if (filter === 'electronics') return p.category === 'telephones-accessoires' || p.category === 'tv-audio' || p.category === 'informatique';
    if (filter === 'appliances') return p.category === 'electromenager' || p.category === 'maison';
    return true;
  });

  return (
    <section className="py-12 bg-gray-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200 mb-2">
              <Flame className="w-3.5 h-3.5 fill-red-600" />
              <span>SÉLECTION POPULAIRE AU SÉNÉGAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 font-display">
              🔥 NOS PRODUITS VEDETTES
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Les articles les plus demandés et recommandés par nos clients à Dakar et dans les régions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tous les Vedettes
            </button>

            <button
              onClick={() => setFilter('promos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filter === 'promos'
                  ? 'bg-linear-to-r from-red-600 to-orange-600 text-white shadow-md'
                  : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
              }`}
            >
              <ActiveFlame size="xs" glow={false} />
              <span>Promos & Réductions</span>
            </button>

            <button
              onClick={() => setFilter('electronics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === 'electronics'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              📱 Électronique
            </button>

            <button
              onClick={() => setFilter('appliances')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === 'appliances'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              ❄️ Électroménager
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={handleViewAll}
            className="px-8 py-3.5 bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-sm rounded-2xl border-2 border-gray-200 hover:border-gray-400 shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Voir l'ensemble du catalogue ({products.length} produits)</span>
            <span>→</span>
          </button>
        </div>

      </div>
    </section>
  );
};
