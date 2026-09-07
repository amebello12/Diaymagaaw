import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, Flame, Check, X } from 'lucide-react';
import { formatFCFA } from '../utils/currency';

interface ShopCatalogProps {
  products: Product[];
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategorySlug: (slug: string | null) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
}

export const ShopCatalog: React.FC<ShopCatalogProps> = ({
  products,
  categories,
  selectedCategorySlug,
  onSelectCategorySlug,
  onSelectProduct,
  onAddToCart,
  onBuyNow
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(700000);
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategorySlug && selectedCategorySlug !== 'promotions') {
          if (p.category !== selectedCategorySlug) return false;
        } else if (selectedCategorySlug === 'promotions') {
          if (!p.discountPercent || p.discountPercent <= 0) return false;
        }

        // Search query
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Price filter
        if (p.price > maxPrice) return false;

        // Promo filter
        if (onlyPromos && (!p.discountPercent || p.discountPercent <= 0)) return false;

        // Stock filter
        if (onlyInStock && p.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategorySlug, searchFilter, maxPrice, onlyPromos, onlyInStock, sortBy]);

  const activeCategoryObject = categories.find((c) => c.slug === selectedCategorySlug);

  return (
    <div className="py-8 bg-gray-50/60 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <div className="text-xs text-gray-500 font-semibold mb-1">
              <span>Boutique</span>
              {activeCategoryObject && (
                <span> / <strong className="text-red-600">{activeCategoryObject.name}</strong></span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              {activeCategoryObject ? activeCategoryObject.name : 'Tous les Produits au Sénégal'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Affichage de <strong>{filteredProducts.length}</strong> article(s) disponible(s)
            </p>
          </div>

          {/* Sort & Mobile filter trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-gray-900 font-bold focus:outline-none text-xs cursor-pointer"
              >
                <option value="featured">Populaires & Vedettes</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="rating">Meilleures évaluations</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Filter (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs sticky top-28">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-red-600" />
                Filtres du Catalogue
              </h3>
              {(selectedCategorySlug || onlyPromos || searchFilter) && (
                <button
                  onClick={() => {
                    onSelectCategorySlug(null);
                    setOnlyPromos(false);
                    setSearchFilter('');
                    setMaxPrice(700000);
                  }}
                  className="text-[11px] text-red-600 font-bold hover:underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Categories list */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Catégories
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => onSelectCategorySlug(null)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                    !selectedCategorySlug
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>Tous les Rayons</span>
                  <span>{products.length}</span>
                </button>

                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCategorySlug(c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                      selectedCategorySlug === c.slug
                        ? 'bg-red-600 text-white font-bold shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-[11px] opacity-80">{c.itemCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-800">
                <span>Prix max :</span>
                <span className="font-mono text-red-600 font-black">{formatFCFA(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={10000}
                max={700000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

            {/* Checkbox toggles */}
            <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyPromos}
                  onChange={(e) => setOnlyPromos(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="font-semibold text-gray-700">Promotions uniquement</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="font-semibold text-gray-700">En stock à Dakar uniquement</span>
              </label>
            </div>

          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9 space-y-6">
            
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
                <p className="text-base font-bold text-gray-800">Aucun produit ne correspond à ces critères</p>
                <p className="text-xs text-gray-500">Essayez d'ajuster votre budget ou de changer de catégorie.</p>
                <button
                  onClick={() => {
                    onSelectCategorySlug(null);
                    setOnlyPromos(false);
                    setMaxPrice(700000);
                  }}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelectProduct={onSelectProduct}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                  />
                ))}
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
