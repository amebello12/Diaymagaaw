import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  PhoneCall, 
  Truck, 
  ShieldCheck, 
  Flame, 
  Download,
  Settings,
  Sparkles,
  Lock
} from 'lucide-react';
import { Product, ActiveView, StoreSettings } from '../types';
import { formatFCFA, STORE_PHONE_DISPLAY, formatPhoneNumber, cleanPhoneForWhatsApp } from '../utils/currency';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView?: (view: ActiveView) => void;
  selectedCategory?: string | null;
  selectedCategorySlug?: string | null;
  setSelectedCategory?: (cat: string | null) => void;
  onNavigate?: (view: ActiveView, categorySlug?: string | null) => void;
  cartCount: number;
  openCart?: () => void;
  onOpenCart?: () => void;
  openAccount?: () => void;
  onOpenAccount?: () => void;
  openAdmin?: () => void;
  onOpenAdmin?: () => void;
  openExportShopify?: () => void;
  onOpenExportShopify?: () => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onSearchSubmit?: (query: string) => void;
  settings?: StoreSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  selectedCategory,
  selectedCategorySlug,
  setSelectedCategory,
  onNavigate,
  cartCount,
  openCart,
  onOpenCart,
  openAccount,
  onOpenAccount,
  openAdmin,
  onOpenAdmin,
  openExportShopify,
  onOpenExportShopify,
  products = [],
  onSelectProduct,
  onSearchSubmit,
  settings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const currentCategorySlug = selectedCategorySlug || selectedCategory || null;

  const handleOpenCart = onOpenCart || openCart || (() => {});
  const handleOpenAccount = onOpenAccount || openAccount || (() => {});
  const handleOpenExportShopify = onOpenExportShopify || openExportShopify || (() => {});
  
  const handleNavClick = (view: ActiveView, catSlug: string | null = null) => {
    if (onNavigate) {
      onNavigate(view, catSlug);
    }
    if (setActiveView) {
      setActiveView(view);
    }
    if (setSelectedCategory) {
      setSelectedCategory(catSlug);
    }
    setMobileMenuOpen(false);
    setShowSearchDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    handleNavClick('admin', null);
    if (onOpenAdmin) onOpenAdmin();
    if (openAdmin) openAdmin();
  };

  // Live search filtering
  const searchResults = searchQuery.trim().length > 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductSearchSelect = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  const handleSearchExecution = () => {
    if (!searchQuery.trim()) return;
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    } else {
      handleNavClick('shop', null);
    }
    setShowSearchDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 font-sans">
      {/* Top Notification Bar */}
      <div className="bg-gray-950 text-white text-xs py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap font-medium tracking-wide">
            <span className="flex items-center gap-1 text-emerald-400">
              <Truck className="w-3.5 h-3.5" /> Livraison rapide à Dakar & régions
            </span>
            <span className="hidden md:inline text-gray-600">|</span>
            <span className="flex items-center gap-1 text-gray-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Paiement à la livraison
            </span>
            <span className="hidden md:inline text-gray-600">|</span>
            <span className="hidden sm:inline text-emerald-300 font-semibold">
              📱 Wave, Orange Money & Free Money
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a 
              href={`tel:+${cleanPhoneForWhatsApp(settings?.phone || settings?.whatsappPhone)}`} 
              className="flex items-center gap-1.5 text-gray-300 hover:text-emerald-400 font-medium transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatPhoneNumber(settings?.phone || settings?.whatsappPhone)}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => handleNavClick('home', null)}
              className="flex items-center group cursor-pointer"
              title="DIAYMA GAAW - Vends-moi vite !"
            >
              <BrandLogo size="md" />
            </button>
          </div>

          {/* Search Bar Desktop */}
          <div className="hidden md:block flex-1 max-w-xl mx-4" ref={searchRef}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchExecution();
              }}
              className="relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Que recherchez-vous ? (Smartphone, blender, air fryer, TV...)"
                className="w-full pl-11 pr-28 py-3 rounded-full border-2 border-gray-200 focus:border-red-600 focus:outline-none text-sm text-gray-900 bg-gray-50/70 focus:bg-white transition shadow-inner"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-24 top-3.5 text-gray-400 hover:text-gray-600 text-xs p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Chercher</span>
              </button>

              {/* Live Search Suggestions Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold">
                    <span>{searchResults.length} produit(s) trouvé(s)</span>
                    <span className="text-red-600">Stock Sénégal vérifié</span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSearchSelect(product)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 text-left transition group"
                      >
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-red-600 transition">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-red-600">
                              {formatFCFA(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[11px] text-gray-400 line-through">
                                {formatFCFA(product.originalPrice)}
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              En Stock
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Actions: Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Account Button */}
            <button
              onClick={handleOpenAccount}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 p-2 sm:px-3 sm:py-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
              aria-label="Mon compte et suivi de commande"
            >
              <User className="w-5 h-5" />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs text-gray-500 font-medium leading-none">Bonjour,</span>
                <span className="text-sm font-bold text-gray-800 leading-tight">Mon Compte</span>
              </div>
            </button>

            {/* Cart Button */}
            <button
              onClick={handleOpenCart}
              className="relative flex items-center gap-2.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-full font-bold text-sm transition shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
              aria-label="Voir le panier"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-gray-950 text-xs font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">Panier</span>
            </button>
          </div>

        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchExecution();
            }}
            className="relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit au Sénégal..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-red-600"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </form>
          {searchQuery && searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductSearchSelect(product)}
                  className="w-full p-2.5 flex items-center gap-2.5 text-left hover:bg-gray-50"
                >
                  <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs font-bold text-red-600">{formatFCFA(product.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation Menu */}
        <nav className="hidden lg:flex items-center justify-between border-t border-gray-100 py-3 text-sm font-semibold text-gray-700">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNavClick('home', null)}
              className={`hover:text-red-600 transition pb-0.5 cursor-pointer ${
                activeView === 'home' ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Accueil
            </button>

            <button
              onClick={() => handleNavClick('shop', null)}
              className={`hover:text-red-600 transition pb-0.5 cursor-pointer ${
                activeView === 'shop' && !currentCategorySlug ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Toute la Boutique
            </button>

            <button
              onClick={() => handleNavClick('shop', 'telephones-accessoires')}
              className={`hover:text-red-600 transition pb-0.5 cursor-pointer ${
                currentCategorySlug === 'telephones-accessoires' ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Électronique
            </button>

            <button
              onClick={() => handleNavClick('shop', 'electromenager')}
              className={`hover:text-red-600 transition pb-0.5 cursor-pointer ${
                currentCategorySlug === 'electromenager' ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Électroménager
            </button>

            <button
              onClick={() => handleNavClick('shop', 'sante-bien-etre')}
              className={`hover:text-red-600 transition pb-0.5 cursor-pointer ${
                currentCategorySlug === 'sante-bien-etre' ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Santé & Bien-être
            </button>

            <button
              onClick={() => handleNavClick('shop', 'promotions')}
              className={`hover:text-red-700 text-red-600 font-extrabold flex items-center gap-1.5 pb-0.5 cursor-pointer ${
                currentCategorySlug === 'promotions' ? 'border-b-2 border-red-600' : ''
              }`}
            >
              <Flame className="w-4 h-4 fill-red-600 text-red-600 animate-pulse" />
              <span>Promotions Flash</span>
            </button>

            <button
              onClick={() => handleNavClick('delivery', null)}
              className={`hover:text-red-600 transition pb-0.5 cursor-pointer ${
                activeView === 'delivery' ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Tarifs Livraison
            </button>

            <button
              onClick={() => handleNavClick('contact', null)}
              className={`hover:text-red-600 transition pb-0.5 cursor-pointer ${
                activeView === 'contact' ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
              <span>Dakar 24h Express</span>
            </span>
          </div>
        </nav>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleNavClick('home', null)}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-bold text-gray-900 hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Accueil</span>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => handleNavClick('shop', null)}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Toute la Boutique</span>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => handleNavClick('shop', 'telephones-accessoires')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              📱 Téléphones & Accessoires
            </button>

            <button
              onClick={() => handleNavClick('shop', 'electromenager')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ❄️ Électroménager
            </button>

            <button
              onClick={() => handleNavClick('shop', 'sante-bien-etre')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              👕 Santé & Bien-être
            </button>

            <button
              onClick={() => handleNavClick('shop', 'informatique')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              💻 Informatique & Bureautique
            </button>

            <button
              onClick={() => handleNavClick('shop', 'promotions')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-bold text-red-600 bg-red-50/70 flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>Grandes Promotions Flash</span>
            </button>

            <button
              onClick={() => handleNavClick('delivery', null)}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              🚚 Zones & Tarifs de Livraison
            </button>

            <button
              onClick={() => handleNavClick('contact', null)}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              📞 Service Client & WhatsApp
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
