import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, Flame, Check, X, Download, Tag, Layers, Sparkles } from 'lucide-react';
import { formatFCFA, cleanPhoneForWhatsApp } from '../utils/currency';
import { ActiveFlame } from './ActiveFlame';

interface ShopCatalogProps {
  products: Product[];
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategorySlug: (slug: string | null) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
  settings?: StoreSettings;
}

export const ShopCatalog: React.FC<ShopCatalogProps> = ({
  products,
  categories,
  selectedCategorySlug,
  onSelectCategorySlug,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  settings
}) => {
  const highestProductPrice = useMemo(() => {
    if (!products || products.length === 0) return 10000000;
    return Math.max(...products.map(p => p.price || 0), 2000000);
  }, [products]);

  const [searchFilter, setSearchFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(() => 10000000);
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState<string | null>(null);

  // Reset subcategory filter when category changes
  useEffect(() => {
    setSelectedSubcategorySlug(null);
  }, [selectedCategorySlug]);

  const activeCategoryObject = categories.find((c) => c.slug === selectedCategorySlug);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategorySlug && selectedCategorySlug !== 'promotions') {
          if (p.category !== selectedCategorySlug) return false;
        } else if (selectedCategorySlug === 'promotions') {
          if (!p.discountPercent || p.discountPercent <= 0) return false;
        }

        // Subcategory filter
        if (selectedSubcategorySlug) {
          const pSub = (p.subcategory || '').toLowerCase().trim();
          const targetSub = selectedSubcategorySlug.toLowerCase().trim();
          const targetSlug = targetSub.replace(/[^a-z0-9]+/g, '-');
          const pSubSlug = pSub.replace(/[^a-z0-9]+/g, '-');
          const matchSubcat = pSub === targetSub || pSubSlug === targetSlug || pSub.includes(targetSub);
          if (!matchSubcat) return false;
        }

        // Search query
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.subcategory && p.subcategory.toLowerCase().includes(q));
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
  }, [products, selectedCategorySlug, selectedSubcategorySlug, searchFilter, maxPrice, onlyPromos, onlyInStock, sortBy]);

  return (
    <div className="py-8 bg-gray-50/60 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Breadcrumb & Title Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1.5 flex-wrap">
                <button 
                  onClick={() => onSelectCategorySlug(null)}
                  className="hover:text-red-600 transition cursor-pointer"
                >
                  Boutique
                </button>
                {activeCategoryObject && (
                  <>
                    <span>/</span>
                    <strong className="text-red-600">{activeCategoryObject.name}</strong>
                    {selectedSubcategorySlug && (
                      <>
                        <span>/</span>
                        <span className="text-gray-800 font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                          {activeCategoryObject.subcategories?.find(s => s.slug === selectedSubcategorySlug)?.name || selectedSubcategorySlug}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display flex items-center gap-2">
                {selectedCategorySlug === 'promotions' && <ActiveFlame size="md" />}
                <span>{activeCategoryObject ? activeCategoryObject.name : 'Tous les Produits au Sénégal'}</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Affichage de <strong>{filteredProducts.length}</strong> article(s) disponible(s) en stock immédiat
              </p>
            </div>

            {/* Actions & Sort */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
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

          {/* Category Description Banner */}
          {activeCategoryObject && activeCategoryObject.description && (
            <div className="bg-gradient-to-r from-red-50/80 via-amber-50/50 to-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-red-100/90 text-gray-700 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs text-red-600 shrink-0 mt-0.5 border border-red-100">
                <Tag className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2 flex-wrap">
                  <span>À propos du rayon {activeCategoryObject.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-bold text-emerald-700">Garantie & Test DIAYMA GAAW</span>
                </div>
                <p className="text-gray-700 text-xs sm:text-sm font-medium leading-relaxed">
                  {activeCategoryObject.description}
                </p>
              </div>
            </div>
          )}

          {/* Subcategories Navigation Chips */}
          {activeCategoryObject && activeCategoryObject.subcategories && activeCategoryObject.subcategories.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-red-600" />
                  <span>Sous-catégories du rayon :</span>
                </div>
                {selectedSubcategorySlug && (
                  <button
                    onClick={() => setSelectedSubcategorySlug(null)}
                    className="text-[11px] text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    Effacer le filtre sous-catégorie
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => setSelectedSubcategorySlug(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedSubcategorySlug === null
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Tous ({products.filter(p => p.category === selectedCategorySlug).length})
                </button>
                {activeCategoryObject.subcategories.map(subcat => {
                  const subSlug = subcat.slug || subcat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const count = products.filter(p => 
                    p.category === selectedCategorySlug && 
                    p.subcategory && (
                      p.subcategory.toLowerCase() === subcat.name.toLowerCase() ||
                      p.subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-') === subSlug
                    )
                  ).length;
                  const isSelected = selectedSubcategorySlug === subSlug || selectedSubcategorySlug === subcat.name;
                  return (
                    <button
                      key={subcat.id || subcat.slug || subcat.name}
                      onClick={() => setSelectedSubcategorySlug(isSelected ? null : subSlug)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-400/40'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span>{subcat.name}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-gray-600 shadow-2xs'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
                    setMaxPrice(highestProductPrice);
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
                min={5000}
                max={Math.max(highestProductPrice, 5000000)}
                step={10000}
                value={Math.min(maxPrice, Math.max(highestProductPrice, 5000000))}
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
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <ActiveFlame size="xs" glow={false} />
                  <span>Promotions uniquement</span>
                </span>
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
            
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl mx-auto flex items-center justify-center font-bold text-xl">
                  📦
                </div>
                <p className="text-base font-bold text-gray-800">Le catalogue est actuellement vide</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Tous les articles ont été remis à zéro par l'administrateur. De nouveaux produits et arrivages seront ajoutés très prochainement.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
                <p className="text-base font-bold text-gray-800">Aucun produit ne correspond à ces critères</p>
                <p className="text-xs text-gray-500">Essayez d'ajuster votre budget ou de changer de catégorie.</p>
                <button
                  onClick={() => {
                    onSelectCategorySlug(null);
                    setOnlyPromos(false);
                    setMaxPrice(highestProductPrice);
                  }}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {(() => {
                  const seen = new Set<string>();
                  return filteredProducts
                    .filter(p => {
                      if (seen.has(p.id)) return false;
                      seen.add(p.id);
                      return true;
                    })
                    .map((prod, idx) => (
                      <ProductCard
                        key={`${prod.id}-${idx}`}
                        product={prod}
                        onSelectProduct={onSelectProduct}
                        onAddToCart={onAddToCart}
                        onBuyNow={onBuyNow}
                        settings={settings}
                      />
                    ));
                })()}
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
