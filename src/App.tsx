import React, { useState, useEffect } from 'react';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_DELIVERY_ZONES, 
  INITIAL_PROMO_CODES, 
  INITIAL_ORDERS,
  INITIAL_STORE_SETTINGS,
  INITIAL_REVIEWS
} from './data/initialData';
import { 
  Product, 
  Category, 
  CartItem, 
  PromoCode, 
  Order, 
  CustomerUser, 
  ActiveView,
  StoreSettings,
  Review,
  DeliveryZone,
  VisitorStats
} from './types';
import { getVisitorStats, recordVisitHit, resetVisitorStatsToZero } from './utils/visitorTracker';
import { 
  subscribeToProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  seedInitialProducts,
  subscribeToOrders,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  subscribeToDeliveryZones,
  saveDeliveryZoneToFirestore,
  deleteDeliveryZoneFromFirestore,
  subscribeToPromoCodes,
  savePromoCodeToFirestore,
  deletePromoCodeFromFirestore,
  subscribeToReviews,
  saveReviewToFirestore,
  deleteReviewFromFirestore,
  subscribeToStoreSettings,
  saveStoreSettingsToFirestore,
  subscribeSyncStatus
} from './utils/firebase';

// Component Imports
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryGrid } from './components/CategoryGrid';
import { FlashSaleSection } from './components/FlashSaleSection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { ReviewsSection } from './components/ReviewsSection';
import { TrustBadges } from './components/TrustBadges';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { DeliveryPage } from './components/DeliveryPage';
import { ShopCatalog } from './components/ShopCatalog';
import { ContactPage, AboutPage, FAQPage } from './components/InfoPages';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ShopifyExportModal } from './components/ShopifyExportModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { WelcomePopup } from './components/WelcomePopup';
import { Footer } from './components/Footer';

export default function App() {
  // 1. Core State with Local Storage Synchronization
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dg_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(() => {
    try {
      const saved = localStorage.getItem('dg_delivery_zones');
      return saved ? JSON.parse(saved) : INITIAL_DELIVERY_ZONES;
    } catch {
      return INITIAL_DELIVERY_ZONES;
    }
  });

  // Clean slate migration: ensure admin dashboard starts with 0 orders, 0 FCFA revenue, and 0 stock alerts
  useEffect(() => {
    try {
      const isCleaned = localStorage.getItem('dg_admin_clean_v3');
      if (!isCleaned) {
        setOrders([]);
        localStorage.setItem('dg_orders', JSON.stringify([]));
        localStorage.setItem('dg_admin_clean_v3', 'true');
      }
    } catch {
      // ignore
    }
  }, []);
  
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('dg_promos');
      return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
    } catch {
      return INITIAL_PROMO_CODES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('dg_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dg_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('dg_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('dg_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('dg_store_settings');
      return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
    } catch {
      return INITIAL_STORE_SETTINGS;
    }
  });

  // Statistiques de Fréquentation & Visiteurs du Site
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(() => getVisitorStats());

  // 1.5. Synchronisation Multi-Appareils Cloud en Temps Réel (Firebase Firestore)
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [lastSyncDate, setLastSyncDate] = useState<Date>(new Date());

  useEffect(() => {
    // Écoute de l'état de synchronisation
    const unsubStatus = subscribeSyncStatus((status, time) => {
      setSyncStatus(status);
      if (time) setLastSyncDate(time);
    });

    // Synchronisation en temps réel des articles du catalogue
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
        try {
          localStorage.setItem('dg_products', JSON.stringify(cloudProducts));
        } catch {
          // ignore
        }
      }
    }, INITIAL_PRODUCTS);

    // Synchronisation en temps réel des commandes
    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders) {
        setOrders(cloudOrders);
        try {
          localStorage.setItem('dg_orders', JSON.stringify(cloudOrders));
        } catch {
          // ignore
        }
      }
    });

    // Synchronisation des zones de livraison
    const unsubZones = subscribeToDeliveryZones((cloudZones) => {
      if (cloudZones && cloudZones.length > 0) {
        setDeliveryZones(cloudZones);
      }
    }, INITIAL_DELIVERY_ZONES);

    // Synchronisation des codes promos
    const unsubPromos = subscribeToPromoCodes((cloudPromos) => {
      if (cloudPromos && cloudPromos.length > 0) {
        setPromoCodes(cloudPromos);
      }
    }, INITIAL_PROMO_CODES);

    // Synchronisation des avis clients
    const unsubReviews = subscribeToReviews((cloudReviews) => {
      if (cloudReviews && cloudReviews.length > 0) {
        setReviews(cloudReviews);
      }
    }, INITIAL_REVIEWS);

    // Synchronisation des paramètres de boutique
    const unsubSettings = subscribeToStoreSettings((cloudSettings) => {
      if (cloudSettings) {
        setStoreSettings(cloudSettings);
      }
    }, INITIAL_STORE_SETTINGS);

    return () => {
      unsubStatus();
      unsubProducts();
      unsubOrders();
      unsubZones();
      unsubPromos();
      unsubReviews();
      unsubSettings();
    };
  }, []);

  // 2. Navigation & Modal UI States
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // Enregistrement des visites à chaque changement de page / navigation
  useEffect(() => {
    const updated = recordVisitHit(activeView);
    setVisitorStats(updated);
  }, [activeView]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cartOpen, setCartOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [shopifyExportOpen, setShopifyExportOpen] = useState(false);

  // Détection URL et raccourci clavier secret pour l'accès administrateur sur le site publié
  useEffect(() => {
    const checkAdminFromUrl = () => {
      try {
        const search = window.location.search.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const pathname = window.location.pathname.toLowerCase();
        if (
          search.includes('admin') || 
          hash === '#admin' || 
          pathname.endsWith('/admin') ||
          pathname === '/admin'
        ) {
          setActiveView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch {
        // ignore
      }
    };

    checkAdminFromUrl();
    window.addEventListener('hashchange', checkAdminFromUrl);
    window.addEventListener('popstate', checkAdminFromUrl);

    // Raccourci clavier universel : Ctrl + Shift + A (ou Cmd + Shift + A sur Mac)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setActiveView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminFromUrl);
      window.removeEventListener('popstate', checkAdminFromUrl);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sync products to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dg_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  // Sync orders to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dg_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dg_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Sync promos to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dg_promos', JSON.stringify(promoCodes));
    } catch {
      // ignore
    }
  }, [promoCodes]);

  // Sync reviews to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dg_reviews', JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  const handleAddReview = async (newRev: Omit<Review, 'id' | 'date'>) => {
    const fullReview: Review = {
      ...newRev,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setReviews(prev => [fullReview, ...prev]);
    saveReviewToFirestore(fullReview).catch(() => {});

    // Update product rating and reviewsCount if linked to an existing product
    if (newRev.productId && newRev.productId !== 'general') {
      let targetProductToSync: Product | null = null;
      setProducts(prevProds => {
        const updated = prevProds.map(p => {
          if (p.id === newRev.productId) {
            const currentCount = p.reviewsCount || 0;
            const currentRating = p.rating || 5.0;
            const newCount = currentCount + 1;
            const newRating = Number(((currentRating * currentCount + newRev.rating) / newCount).toFixed(1));
            targetProductToSync = {
              ...p,
              reviewsCount: newCount,
              rating: newRating
            };
            return targetProductToSync;
          }
          return p;
        });
        try {
          localStorage.setItem('dg_products', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      if (targetProductToSync) {
        saveProductToFirestore(targetProductToSync).catch(() => {});
      }
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== reviewId);
      try {
        localStorage.setItem('dg_reviews', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    deleteReviewFromFirestore(reviewId).catch(() => {});
  };

  // Sync user to local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('dg_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('dg_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // 3. Cart Actions
  const handleAddToCart = (product: Product, e?: React.MouseEvent, quantityToAdd = 1) => {
    if (e) e.stopPropagation();
    
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }
      return [...prev, { product, quantity: quantityToAdd }];
    });
    setCartOpen(true);
  };

  const handleBuyNow = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleApplyPromoCode = (codeStr: string): { success: boolean; message: string } => {
    const clean = codeStr.trim().toUpperCase();
    const found = promoCodes.find(p => p.code === clean);
    if (found) {
      setAppliedPromo(found);
      return { success: true, message: `Code ${found.code} appliqué (-${found.discountPercent}%) !` };
    }
    return { success: false, message: 'Code promo invalide pour le Sénégal.' };
  };

  // 4. Navigation Actions
  const handleNavigate = (view: ActiveView, categorySlug: string | null = null) => {
    setActiveView(view);
    setSelectedCategorySlug(categorySlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setActiveView('shop');
    setSelectedCategorySlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Checkout Completion
  const handleOrderCompleted = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCartItems([]);
    setAppliedPromo(null);
    setCheckoutOpen(false);
    setCompletedOrder(order);
    try {
      await saveOrderToFirestore(order);
    } catch (e) {
      console.warn('Order sync fallback:', e);
    }
  };

  // 6. Admin Product, Order & Promo Management (avec synchronisation multi-appareils Firestore)
  const handleAddProduct = async (newProd: Product) => {
    setProducts(prev => {
      const updated = [newProd, ...prev.filter(p => p.id !== newProd.id)];
      try {
        localStorage.setItem('dg_products', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      await saveProductToFirestore(newProd);
    } catch (e) {
      console.warn('Sync new product to Firestore fallback:', e);
    }
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === updatedProd.id ? updatedProd : p));
      try {
        localStorage.setItem('dg_products', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      await saveProductToFirestore(updatedProd);
    } catch (e) {
      console.warn('Sync updated product to Firestore fallback:', e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      try {
        localStorage.setItem('dg_products', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      await deleteProductFromFirestore(productId);
    } catch (e) {
      console.warn('Sync delete product to Firestore fallback:', e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    try {
      await updateOrderStatusInFirestore(orderId, newStatus);
    } catch (e) {
      console.warn('Order status sync fallback:', e);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      await deleteOrderFromFirestore(orderId);
    } catch (e) {
      console.warn('Delete order sync fallback:', e);
    }
  };

  const handleAddPromoCode = async (newPromo: PromoCode) => {
    setPromoCodes(prev => [newPromo, ...prev.filter(p => p.code !== newPromo.code)]);
    try {
      await savePromoCodeToFirestore(newPromo);
    } catch (e) {
      console.warn('Promo sync fallback:', e);
    }
  };

  const handleDeletePromoCode = async (code: string) => {
    setPromoCodes(prev => prev.filter(p => p.code !== code));
    try {
      await deletePromoCodeFromFirestore(code);
    } catch (e) {
      console.warn('Delete promo sync fallback:', e);
    }
  };

  // Delivery Zone Management Handlers
  const handleUpdateDeliveryZone = async (zoneId: string, updatedFields: Partial<DeliveryZone>) => {
    let targetZone: DeliveryZone | undefined;
    setDeliveryZones(prev => {
      const updated = prev.map(z => {
        if (z.id === zoneId) {
          targetZone = { ...z, ...updatedFields };
          return targetZone;
        }
        return z;
      });
      try {
        localStorage.setItem('dg_delivery_zones', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    if (targetZone) {
      try {
        await saveDeliveryZoneToFirestore(targetZone);
      } catch (e) {
        console.warn('Delivery zone sync fallback:', e);
      }
    }
  };

  const handleAddDeliveryZone = async (newZone: DeliveryZone) => {
    setDeliveryZones(prev => {
      const updated = [...prev, newZone];
      try {
        localStorage.setItem('dg_delivery_zones', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      await saveDeliveryZoneToFirestore(newZone);
    } catch (e) {
      console.warn('Add delivery zone sync fallback:', e);
    }
  };

  const handleDeleteDeliveryZone = async (zoneId: string) => {
    setDeliveryZones(prev => {
      const updated = prev.filter(z => z.id !== zoneId);
      try {
        localStorage.setItem('dg_delivery_zones', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      await deleteDeliveryZoneFromFirestore(zoneId);
    } catch (e) {
      console.warn('Delete delivery zone sync fallback:', e);
    }
  };

  const handleResetDeliveryZones = () => {
    setDeliveryZones(INITIAL_DELIVERY_ZONES);
    try {
      localStorage.setItem('dg_delivery_zones', JSON.stringify(INITIAL_DELIVERY_ZONES));
      INITIAL_DELIVERY_ZONES.forEach(z => {
        saveDeliveryZoneToFirestore(z).catch(() => {});
      });
    } catch {
      // ignore
    }
  };

  // Dashboard & Admin Reset Handlers
  const handleResetDashboardStats = () => {
    setOrders([]);
    try {
      localStorage.setItem('dg_orders', JSON.stringify([]));
    } catch {
      // ignore
    }
  };

  const handleResetStockAlerts = async () => {
    const updated = products.map(p => ({
      ...p,
      stock: p.stock <= 5 ? 15 : p.stock
    }));
    setProducts(updated);
    try {
      localStorage.setItem('dg_products', JSON.stringify(updated));
      await seedInitialProducts(updated);
    } catch {
      // ignore
    }
  };

  const handleResetVisitorStats = () => {
    const reset = resetVisitorStatsToZero();
    setVisitorStats(reset);
  };

  const handleResetAllAdmin = async () => {
    setOrders([]);
    setProducts(INITIAL_PRODUCTS);
    setDeliveryZones(INITIAL_DELIVERY_ZONES);
    setPromoCodes(INITIAL_PROMO_CODES);
    const resetVis = resetVisitorStatsToZero();
    setVisitorStats(resetVis);
    try {
      localStorage.setItem('dg_orders', JSON.stringify([]));
      localStorage.setItem('dg_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('dg_delivery_zones', JSON.stringify(INITIAL_DELIVERY_ZONES));
      localStorage.setItem('dg_promos', JSON.stringify(INITIAL_PROMO_CODES));
      await seedInitialProducts(INITIAL_PRODUCTS);
    } catch {
      // ignore
    }
  };

  const handleUpdateStoreSettings = async (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    try {
      localStorage.setItem('dg_store_settings', JSON.stringify(newSettings));
      await saveStoreSettingsToFirestore(newSettings);
    } catch {
      // ignore
    }
  };

  const handleResetData = () => {
    handleResetAllAdmin();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 text-gray-900 font-sans">
      
      {/* 1. Global Header with navigation & cart badge */}
      <Header
        cartCount={cartItems.reduce((acc, it) => acc + it.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
        onOpenAccount={() => setAccountModalOpen(true)}
        onOpenAdmin={() => handleNavigate('admin', null)}
        onOpenExportShopify={() => setShopifyExportOpen(true)}
        onNavigate={handleNavigate}
        onSearchSubmit={handleSearchSubmit}
        products={products}
        onSelectProduct={setSelectedProduct}
        activeView={activeView}
        settings={storeSettings}
      />

      {/* 2. Main Dynamic Content Switcher */}
      <main className="flex-1">
        
        {/* VIEW: HOME */}
        {activeView === 'home' && (
          <div className="space-y-4">
            {/* Hero Main Banner */}
            <HeroBanner
              onShopNow={() => handleNavigate('shop', null)}
              onOpenPromos={() => handleNavigate('shop', 'promotions')}
              onOpenExportShopify={() => setShopifyExportOpen(true)}
              featuredProduct={products[0]}
              onSelectProduct={setSelectedProduct}
            />

            {/* Visual Category Grid */}
            <CategoryGrid
              categories={categories}
              onSelectCategory={(slug) => handleNavigate('shop', slug)}
            />

            {/* Flash Sales Section with Senegal Wave/Orange money notice */}
            <FlashSaleSection
              products={products}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onViewAllPromos={() => handleNavigate('shop', 'promotions')}
            />

            {/* Featured Best Sellers & Filterable Catalog Preview */}
            <FeaturedProducts
              products={products}
              categories={categories}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onViewCatalog={() => handleNavigate('shop', null)}
            />

            {/* Customer Reviews & Testimonials Section */}
            <ReviewsSection
              reviews={reviews}
              products={products}
              onAddReview={handleAddReview}
              onSelectProduct={setSelectedProduct}
              onNavigate={handleNavigate}
            />

            {/* Trust Badges: Payment, Delivery, Guarantees */}
            <TrustBadges onNavigate={handleNavigate} />
          </div>
        )}

        {/* VIEW: REVIEWS / AVIS CLIENTS */}
        {activeView === 'reviews' && (
          <ReviewsSection
            reviews={reviews}
            products={products}
            onAddReview={handleAddReview}
            onSelectProduct={setSelectedProduct}
            onNavigate={handleNavigate}
            isFullPage={true}
          />
        )}

        {/* VIEW: SHOP / CATALOGUE */}
        {activeView === 'shop' && (
          <ShopCatalog
            products={products}
            categories={categories}
            selectedCategorySlug={selectedCategorySlug}
            onSelectCategorySlug={setSelectedCategorySlug}
            onSelectProduct={setSelectedProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {/* VIEW: DELIVERY & SHIPPING */}
        {activeView === 'delivery' && (
          <DeliveryPage
            deliveryZones={deliveryZones}
            onStartShopping={() => handleNavigate('shop', null)}
            settings={storeSettings}
          />
        )}

        {/* VIEW: CONTACT */}
        {activeView === 'contact' && (
          <ContactPage 
            onStartShopping={() => handleNavigate('shop', null)} 
            settings={storeSettings}
          />
        )}

        {/* VIEW: ABOUT */}
        {activeView === 'about' && (
          <AboutPage onStartShopping={() => handleNavigate('shop', null)} />
        )}

        {/* VIEW: FAQ & RETURNS */}
        {activeView === 'faq' && (
          <FAQPage
            onStartShopping={() => handleNavigate('shop', null)}
            onOpenContact={() => handleNavigate('contact', null)}
            settings={storeSettings}
          />
        )}

        {/* VIEW: ADMIN PANEL */}
        {activeView === 'admin' && (
          <AdminPanelModal
            isOpen={true}
            isPageMode={true}
            onClose={() => handleNavigate('home', null)}
            products={products}
            categories={categories}
            orders={orders}
            promoCodes={promoCodes}
            deliveryZones={deliveryZones}
            settings={storeSettings}
            onUpdateSettings={handleUpdateStoreSettings}
            syncStatus={syncStatus}
            lastSyncDate={lastSyncDate}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onAddPromoCode={handleAddPromoCode}
            onDeletePromoCode={handleDeletePromoCode}
            onOpenExportShopify={() => setShopifyExportOpen(true)}
            onResetData={handleResetData}
            onUpdateDeliveryZone={handleUpdateDeliveryZone}
            onAddDeliveryZone={handleAddDeliveryZone}
            onDeleteDeliveryZone={handleDeleteDeliveryZone}
            onResetDeliveryZones={handleResetDeliveryZones}
            onResetDashboardStats={handleResetDashboardStats}
            onResetStockAlerts={handleResetStockAlerts}
            onResetAllAdmin={handleResetAllAdmin}
            reviews={reviews}
            onDeleteReview={handleDeleteReview}
            visitorStats={visitorStats}
            onResetVisitorStats={handleResetVisitorStats}
          />
        )}

      </main>

      {/* 3. Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenExportShopify={() => setShopifyExportOpen(true)}
        onOpenAdmin={() => handleNavigate('admin', null)}
        settings={storeSettings}
      />

      {/* 4. Floating Elements */}
      <FloatingWhatsApp settings={storeSettings} />
      <WelcomePopup onShopNow={() => handleNavigate('shop', 'promotions')} />

      {/* 5. Modals & Drawers */}
      
      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={(discountPct) => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        onContinueShopping={() => setCartOpen(false)}
        settings={storeSettings}
        promoCodes={promoCodes}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        allProducts={products}
        reviews={reviews}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, qty) => handleAddToCart(prod, undefined, qty)}
        onBuyNow={(prod, qty) => {
          handleAddToCart(prod, undefined, qty);
          setSelectedProduct(null);
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        onSelectProduct={setSelectedProduct}
        onAddReview={handleAddReview}
        settings={storeSettings}
      />

      {/* Checkout Modal with Senegal Form & Wave/OM/Cash */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        appliedDiscountPercent={appliedPromo?.discountPercent || 0}
        deliveryZones={deliveryZones}
        onOrderCompleted={handleOrderCompleted}
        settings={storeSettings}
      />

      {/* Order Success Modal with WhatsApp Transmission */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onContinueShopping={() => handleNavigate('shop', null)}
        settings={storeSettings}
      />

      {/* Customer Account & Package Tracker Modal */}
      <CustomerAccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        orders={orders}
        currentUser={currentUser}
        onLogin={setCurrentUser}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Store Administration Modal (when opened from other context) */}
      {activeView !== 'admin' && (
        <AdminPanelModal
          isOpen={adminModalOpen}
          isPageMode={false}
          onClose={() => setAdminModalOpen(false)}
          products={products}
          categories={categories}
          orders={orders}
          promoCodes={promoCodes}
          deliveryZones={deliveryZones}
          settings={storeSettings}
          onUpdateSettings={handleUpdateStoreSettings}
          syncStatus={syncStatus}
          lastSyncDate={lastSyncDate}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onAddPromoCode={handleAddPromoCode}
          onDeletePromoCode={handleDeletePromoCode}
          onOpenExportShopify={() => {
            setAdminModalOpen(false);
            setShopifyExportOpen(true);
          }}
          onResetData={handleResetData}
          onUpdateDeliveryZone={handleUpdateDeliveryZone}
          onAddDeliveryZone={handleAddDeliveryZone}
          onDeleteDeliveryZone={handleDeleteDeliveryZone}
          onResetDeliveryZones={handleResetDeliveryZones}
          onResetDashboardStats={handleResetDashboardStats}
          onResetStockAlerts={handleResetStockAlerts}
          onResetAllAdmin={handleResetAllAdmin}
          reviews={reviews}
          onDeleteReview={handleDeleteReview}
          visitorStats={visitorStats}
          onResetVisitorStats={handleResetVisitorStats}
        />
      )}

      {/* Shopify OS 2.0 Theme Downloader Modal */}
      <ShopifyExportModal
        isOpen={shopifyExportOpen}
        onClose={() => setShopifyExportOpen(false)}
      />

    </div>
  );
}
