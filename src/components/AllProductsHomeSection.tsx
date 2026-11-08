import React, { useState, useMemo } from 'react';
import { Product, Category, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { Package, Search, SlidersHorizontal, ArrowUpDown, Flame, CheckCircle2 } from 'lucide-react';
import { ActiveFlame } from './ActiveFlame';

interface AllProductsHomeSectionProps {
  products: Product[];
  categories: Category[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
  onViewCatalog?: () => void;
  settings?: StoreSettings;
}

export const AllProductsHomeSection: React.FC<AllProductsHomeSectionProps> = ({
  products,
  categories,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onViewCatalog,
  settings
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [displayLimit, setDisplayLimit] = useState(16);

  const config = settings?.homepageConfig;
  const sectionTitle = config?.sectionTitles?.allProductsTitle || '📦 TOUT LE CATALOGUE DISPONIBLE';
  const sectionSubtitle = config?.sectionTitles?.allProductsSubtitle || 'Tous nos articles testés et certifiés DIAYMA GAAW en stock immédiat à Dakar et expédiés en 24h.';

  // Filter products based on search, category, and sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory === 'promos') {
          if (!p.discountPercent || p.discountPercent <= 0) return false;
        } else if (selectedCategory !== 'all') {
          if (p.category !== selectedCategory) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.sku && p.sku.toLowerCase().includes(q));
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const displayedList = useMemo(() => {
    return filteredProducts.slice(0, displayLimit);
  }, [filteredProducts, displayLimit]);

  // Catégories avec comptage
  const activeCategories = useMemo(() => {
    return categories.filter(c => {
      if (c.slug === 'promotions') return false;
      return products.some(p => p.category === c.slug);
    });
  }, [categories, products]);

  return (
    <section className="py-14 bg-white border-t border-gray-150 font-sans" id="catalogue-complet">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-black tracking-wider uppercase mb-2 shadow-xs">
              <Package className="w-3.5 h-3.5 text-yellow-400" />
              <span>SYNCHRONISATION EN DIRECT • {products.length} ARTICLES EN STOCK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 font-display">
              {sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
              {sectionSubtitle}
            </p>
          </div>

          {/* Quick Search & Sort Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer parmi les 87+ articles..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-gray-900 font-bold focus:outline-none text-xs cursor-pointer"
              >
                <option value="newest">Derniers ajouts</option>
                <option value="featured">Populaires</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setDisplayLimit(16);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Tous les Rayons</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('promos');
              setDisplayLimit(16);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              selectedCategory === 'promos'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            }`}
          >
            <ActiveFlame size="xs" glow={false} />
            <span>En Promotion</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/25 text-[10px] font-black">
              {products.filter(p => (p.discountPercent && p.discountPercent > 0) || p.isFlashSale).length}
            </span>
          </button>

          {activeCategories.map((c) => {
            const count = products.filter(p => p.category === c.slug).length;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.slug);
                  setDisplayLimit(16);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === c.slug
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{c.name}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-black/10 text-[10px] font-black">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Counter Info Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Affichage de <strong>{displayedList.length}</strong> sur <strong>{filteredProducts.length}</strong> article(s) trouvé(s)
            </span>
          </div>
          {filteredProducts.length > displayedList.length && (
            <button
              onClick={() => setDisplayLimit(filteredProducts.length)}
              className="text-red-600 font-extrabold hover:underline cursor-pointer"
            >
              Afficher les {filteredProducts.length} d'un coup
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <p className="text-base font-bold text-gray-800">Aucun produit ne correspond à votre recherche</p>
            <p className="text-xs text-gray-500">Essayez d'effacer les mots-clés ou de choisir un autre rayon.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayedList.map((product, idx) => (
              <ProductCard
                key={`all-${product.id}-${idx}`}
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                settings={settings}
              />
            ))}
          </div>
        )}

        {/* Load More or Explore Full Catalog Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-gray-100">
          {filteredProducts.length > displayedList.length ? (
            <button
              onClick={() => setDisplayLimit(prev => Math.min(prev + 16, filteredProducts.length))}
              className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-extrabold text-xs rounded-2xl shadow-md transition cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <span>Charger 16 articles supplémentaires</span>
              <span>({filteredProducts.length - displayedList.length} restants)</span>
            </button>
          ) : null}

          {onViewCatalog && (
            <button
              onClick={onViewCatalog}
              className="px-8 py-3.5 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs rounded-2xl border border-red-200 transition cursor-pointer"
            >
              Ouvrir la page Boutique détaillée avec filtres avancés →
            </button>
          )}
        </div>

      </div>
    </section>
  );
};
