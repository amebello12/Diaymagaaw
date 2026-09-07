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
  DeliveryZone
} from './types';

// Component Imports
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryGrid } from './components/CategoryGrid';
import { FlashSaleSection } from './components/FlashSaleSection';
import { FeaturedProducts } from './components/FeaturedProducts';
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
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('dg_products', JSON.stringify(INITIAL_PRODUCTS));
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

  // 2. Navigation & Modal UI States
  const [activeView, setActiveView] = useState<ActiveView>('home');
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

  const handleAddReview = (newRev: Omit<Review, 'id' | 'date'>) => {
    const fullReview: Review = {
      ...newRev,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setReviews(prev => [fullReview, ...prev]);
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
  const handleOrderCompleted = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCartItems([]);
    setAppliedPromo(null);
    setCheckoutOpen(false);
    setCompletedOrder(order);
  };

  // 6. Admin Product, Order & Promo Management
  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => {
      const updated = [newProd, ...prev];
      try {
        localStorage.setItem('dg_products', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === updatedProd.id ? updatedProd : p));
      try {
        localStorage.setItem('dg_products', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      try {
        localStorage.setItem('dg_products', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['orderStatus']) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleAddPromoCode = (newPromo: PromoCode) => {
    setPromoCodes(prev => [newPromo, ...prev.filter(p => p.code !== newPromo.code)]);
  };

  const handleDeletePromoCode = (code: string) => {
    setPromoCodes(prev => prev.filter(p => p.code !== code));
  };

  // Delivery Zone Management Handlers
  const handleUpdateDeliveryZone = (zoneId: string, updatedFields: Partial<DeliveryZone>) => {
    setDeliveryZones(prev => {
      const updated = prev.map(z => z.id === zoneId ? { ...z, ...updatedFields } : z);
      try {
        localStorage.setItem('dg_delivery_zones', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleAddDeliveryZone = (newZone: DeliveryZone) => {
    setDeliveryZones(prev => {
      const updated = [...prev, newZone];
      try {
        localStorage.setItem('dg_delivery_zones', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteDeliveryZone = (zoneId: string) => {
    setDeliveryZones(prev => {
      const updated = prev.filter(z => z.id !== zoneId);
      try {
        localStorage.setItem('dg_delivery_zones', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetDeliveryZones = () => {
    setDeliveryZones(INITIAL_DELIVERY_ZONES);
    try {
      localStorage.setItem('dg_delivery_zones', JSON.stringify(INITIAL_DELIVERY_ZONES));
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

  const handleResetStockAlerts = () => {
    setProducts(prev => {
      const updated = prev.map(p => ({
        ...p,
        stock: p.stock <= 5 ? 15 : p.stock
      }));
      try {
        localStorage.setItem('dg_products', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetAllAdmin = () => {
    setOrders([]);
    setProducts(INITIAL_PRODUCTS);
    setDeliveryZones(INITIAL_DELIVERY_ZONES);
    setPromoCodes(INITIAL_PROMO_CODES);
    try {
      localStorage.setItem('dg_orders', JSON.stringify([]));
      localStorage.setItem('dg_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('dg_delivery_zones', JSON.stringify(INITIAL_DELIVERY_ZONES));
      localStorage.setItem('dg_promos', JSON.stringify(INITIAL_PROMO_CODES));
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

            {/* Trust Badges: Payment, Delivery, Guarantees */}
            <TrustBadges onNavigate={handleNavigate} />
          </div>
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
            onUpdateSettings={setStoreSettings}
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
          onUpdateSettings={setStoreSettings}
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
