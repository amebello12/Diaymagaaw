import React, { useState } from 'react';
import { Product, StoreSettings } from '../types';
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
  settings?: StoreSettings;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  categories = [],
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onViewAll,
  onViewCatalog,
  settings
}) => {
  const handleViewAll = onViewCatalog || onViewAll || (() => {});
  const [filter, setFilter] = useState<string>('all');
  const config = settings?.homepageConfig;

  const sectionTitle = config?.sectionTitles?.featuredTitle || '🔥 NOS PRODUITS VEDETTES';
  const sectionSubtitle = config?.sectionTitles?.featuredSubtitle || 'Les articles les plus demandés et recommandés par nos clients à Dakar et dans les régions.';

  // Extraire les catégories qui contiennent des produits pour les boutons filtres
  const activeCategories = React.useMemo(() => {
    return categories.filter(c => {
      if (c.slug === 'promotions') return false;
      return products.some(p => p.category === c.slug);
    });
  }, [categories, products]);

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'promos') return (p.discountPercent && p.discountPercent > 0) || p.isFlashSale;
    return p.category === filter;
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
              {sectionTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {sectionSubtitle}
            </p>
          </div>

          {/* Filter Pills Dynamiques */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tous ({products.length})
            </button>

            <button
              onClick={() => setFilter('promos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filter === 'promos'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                  : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
              }`}
            >
              <ActiveFlame size="xs" glow={false} />
              <span>Promos</span>
            </button>

            {activeCategories.map((c) => {
              const count = products.filter(p => p.category === c.slug).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setFilter(c.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    filter === c.slug
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 max-w-md mx-auto space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl mx-auto flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <h3 className="text-base font-bold text-gray-900">Catalogue en cours de renouvellement</h3>
            <p className="text-xs text-gray-500">
              De nouveaux arrivages de haute qualité arrivent bientôt à Dakar. Contactez notre équipe sur WhatsApp pour toute commande !
            </p>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {(() => {
                const seen = new Set<string>();
                return filteredProducts
                  .filter(p => {
                    if (seen.has(p.id)) return false;
                    seen.add(p.id);
                    return true;
                  })
                  .map((product, idx) => (
                    <ProductCard
                      key={`${product.id}-${idx}`}
                      product={product}
                      onSelectProduct={onSelectProduct}
                      onAddToCart={onAddToCart}
                      onBuyNow={onBuyNow}
                      settings={settings}
                    />
                  ));
              })()}
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
          </>
        )}

      </div>
    </section>
  );
};
