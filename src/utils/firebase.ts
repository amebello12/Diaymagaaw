import { Product, Category, Order, DeliveryZone, PromoCode, Review, StoreSettings } from '../types';

type SyncStatus = 'connected' | 'syncing' | 'offline';
type StatusListener = (status: SyncStatus, lastSyncTime?: Date) => void;

const statusListeners: StatusListener[] = [];
let currentSyncStatus: SyncStatus = 'connected';
let lastSyncTime: Date = new Date();

export function subscribeSyncStatus(listener: StatusListener) {
  statusListeners.push(listener);
  listener(currentSyncStatus, lastSyncTime);
  return () => {
    const idx = statusListeners.indexOf(listener);
    if (idx !== -1) statusListeners.splice(idx, 1);
  };
}

function updateSyncStatus(status: SyncStatus) {
  currentSyncStatus = status;
  if (status === 'connected') {
    lastSyncTime = new Date();
  }
  statusListeners.forEach((l) => l(currentSyncStatus, lastSyncTime));
}

// =================== PRODUCTS ===================
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  initialFallback?: Product[]
): () => void {
  let active = true;

  const fetchProducts = async () => {
    try {
      updateSyncStatus('syncing');
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: Product[] = await res.json();
      if (active) {
        updateSyncStatus('connected');
        onUpdate(data);
        try {
          localStorage.setItem('dg_products', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('API fetchProducts fallback:', err);
      if (active) {
        updateSyncStatus('offline');
        try {
          const cached = localStorage.getItem('dg_products');
          if (cached) {
            onUpdate(JSON.parse(cached));
            return;
          }
        } catch {
          // ignore
        }
        if (initialFallback) onUpdate(initialFallback);
      }
    }
  };

  fetchProducts();
  const interval = setInterval(fetchProducts, 8000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  updateSyncStatus('syncing');
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to save product');
    updateSyncStatus('connected');
  } catch (error) {
    updateSyncStatus('offline');
    throw error;
  }
}

export async function saveProductsBatchToFirestore(productsList: Product[]): Promise<void> {
  if (!productsList || productsList.length === 0) return;
  updateSyncStatus('syncing');
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productsList),
    });
    if (!res.ok) throw new Error('Failed to save products batch');
    updateSyncStatus('connected');
  } catch (error) {
    updateSyncStatus('offline');
    throw error;
  }
}


export async function deleteProductFromFirestore(productId: string): Promise<void> {
  updateSyncStatus('syncing');
  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    updateSyncStatus('connected');
  } catch (error) {
    updateSyncStatus('offline');
    throw error;
  }
}

export async function deleteAllProductsFromFirestore(): Promise<void> {
  updateSyncStatus('syncing');
  try {
    const res = await fetch('/api/products', {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear products');
    updateSyncStatus('connected');
  } catch (error) {
    updateSyncStatus('offline');
    throw error;
  }
}

export async function resetAllProductDiscountsInFirestore(): Promise<void> {
  updateSyncStatus('syncing');
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    const prods: Product[] = await res.json();
    for (const p of prods) {
      if (p.discountPercent || p.originalPrice) {
        await saveProductToFirestore({
          ...p,
          discountPercent: undefined,
          originalPrice: undefined,
          isFlashSale: false,
        });
      }
    }
    updateSyncStatus('connected');
  } catch (error) {
    updateSyncStatus('offline');
    throw error;
  }
}

export async function seedInitialProducts(prods: Product[]): Promise<void> {
  for (const p of prods) {
    await saveProductToFirestore(p);
  }
}

// =================== CATEGORIES ===================
export function subscribeToCategories(
  onUpdate: (cats: Category[]) => void,
  initialFallback?: Category[]
): () => void {
  let active = true;

  const fetchCats = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: Category[] = await res.json();
      if (active) {
        onUpdate(data);
        try {
          localStorage.setItem('dg_categories', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      if (active) {
        try {
          const cached = localStorage.getItem('dg_categories');
          if (cached) {
            onUpdate(JSON.parse(cached));
            return;
          }
        } catch {
          // ignore
        }
        if (initialFallback) onUpdate(initialFallback);
      }
    }
  };

  fetchCats();
  const interval = setInterval(fetchCats, 15000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveCategoryToFirestore(cat: Category): Promise<void> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cat),
  });
  if (!res.ok) throw new Error('Failed to save category');
}

export async function seedInitialCategories(cats: Category[]): Promise<void> {
  for (const c of cats) {
    await saveCategoryToFirestore(c);
  }
}

// =================== ORDERS ===================
export function subscribeToOrders(onUpdate: (orders: Order[]) => void): () => void {
  let active = true;

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: Order[] = await res.json();
      if (active) {
        onUpdate(data);
        try {
          localStorage.setItem('dg_orders', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      if (active) {
        try {
          const cached = localStorage.getItem('dg_orders');
          if (cached) onUpdate(JSON.parse(cached));
        } catch {
          // ignore
        }
      }
    }
  };

  fetchOrders();
  const interval = setInterval(fetchOrders, 8000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error('Failed to save order');
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: Order['orderStatus']
): Promise<void> {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  // Not implemented or no-op
}

// =================== DELIVERY ZONES ===================
export function subscribeToDeliveryZones(
  onUpdate: (zones: DeliveryZone[]) => void,
  initialFallback?: DeliveryZone[]
): () => void {
  let active = true;

  const fetchZones = async () => {
    try {
      const res = await fetch('/api/delivery-zones');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: DeliveryZone[] = await res.json();
      if (active) {
        onUpdate(data);
        try {
          localStorage.setItem('dg_delivery_zones', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      if (active) {
        try {
          const cached = localStorage.getItem('dg_delivery_zones');
          if (cached) {
            onUpdate(JSON.parse(cached));
            return;
          }
        } catch {
          // ignore
        }
        if (initialFallback) onUpdate(initialFallback);
      }
    }
  };

  fetchZones();
  const interval = setInterval(fetchZones, 20000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveDeliveryZoneToFirestore(zone: DeliveryZone): Promise<void> {
  const res = await fetch('/api/delivery-zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zone),
  });
  if (!res.ok) throw new Error('Failed to save delivery zone');
}

export async function deleteDeliveryZoneFromFirestore(zoneId: string): Promise<void> {
  // no-op
}

// =================== PROMO CODES ===================
export function subscribeToPromoCodes(
  onUpdate: (promos: PromoCode[]) => void,
  initialFallback?: PromoCode[]
): () => void {
  let active = true;

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/promo-codes');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: PromoCode[] = await res.json();
      if (active) {
        onUpdate(data);
        try {
          localStorage.setItem('dg_promos', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      if (active) {
        try {
          const cached = localStorage.getItem('dg_promos');
          if (cached) {
            onUpdate(JSON.parse(cached));
            return;
          }
        } catch {
          // ignore
        }
        if (initialFallback) onUpdate(initialFallback);
      }
    }
  };

  fetchPromos();
  const interval = setInterval(fetchPromos, 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function savePromoCodeToFirestore(promo: PromoCode): Promise<void> {
  const res = await fetch('/api/promo-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(promo),
  });
  if (!res.ok) throw new Error('Failed to save promo code');
}

export async function deletePromoCodeFromFirestore(code: string): Promise<void> {
  const res = await fetch(`/api/promo-codes/${code}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete promo code');
}

export async function deleteAllPromoCodesFromFirestore(): Promise<void> {
  const res = await fetch('/api/promo-codes', {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear promo codes');
}

// =================== REVIEWS ===================
export function subscribeToReviews(
  onUpdate: (reviews: Review[]) => void,
  initialFallback?: Review[]
): () => void {
  let active = true;

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: Review[] = await res.json();
      if (active) {
        onUpdate(data);
        try {
          localStorage.setItem('dg_reviews', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      if (active) {
        try {
          const cached = localStorage.getItem('dg_reviews');
          if (cached) {
            onUpdate(JSON.parse(cached));
            return;
          }
        } catch {
          // ignore
        }
        if (initialFallback) onUpdate(initialFallback);
      }
    }
  };

  fetchReviews();
  const interval = setInterval(fetchReviews, 20000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveReviewToFirestore(review: Review): Promise<void> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Failed to save review');
}

export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  // no-op
}

// =================== STORE SETTINGS ===================
export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  initialFallback?: StoreSettings
): () => void {
  let active = true;

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: StoreSettings = await res.json();
      if (active) {
        onUpdate(data);
        try {
          localStorage.setItem('dg_store_settings', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      if (active) {
        try {
          const cached = localStorage.getItem('dg_store_settings');
          if (cached) {
            onUpdate(JSON.parse(cached));
            return;
          }
        } catch {
          // ignore
        }
        if (initialFallback) onUpdate(initialFallback);
      }
    }
  };

  fetchSettings();
  const interval = setInterval(fetchSettings, 20000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveStoreSettingsToFirestore(settings: StoreSettings): Promise<void> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save store settings');
}

export function isFirestoreQuotaExceeded(): boolean {
  return false;
}
