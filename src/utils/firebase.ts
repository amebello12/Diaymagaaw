import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch, 
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Product, 
  Category, 
  Order, 
  OrderCustomer,
  DeliveryZone, 
  PromoCode, 
  Review, 
  StoreSettings 
} from '../types';

// ==========================================
// 1. FIREBASE INITIALIZATION (CENTRAL SINGLE SOURCE OF TRUTH)
// ==========================================
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// ==========================================
// 2. ERROR HANDLING (MANDATED SPECIFICATION)
// ==========================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let quotaExceededState = false;

export function isFirestoreQuotaExceeded(): boolean {
  return quotaExceededState;
}

export function setFirestoreQuotaExceeded(val: boolean): void {
  quotaExceededState = val;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  if (errMessage.includes('Quota exceeded') || errMessage.includes('Quota limit exceeded')) {
    quotaExceededState = true;
    updateSyncStatus('offline');
  }
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Clean undefined fields to avoid Firestore setDoc errors
function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// ==========================================
// 3. SYNCHRONIZATION STATUS EMITTER
// ==========================================
export type SyncStatus = 'connected' | 'syncing' | 'offline';
export type StatusListener = (status: SyncStatus, lastSyncTime?: Date) => void;

const statusListeners: StatusListener[] = [];
let currentSyncStatus: SyncStatus = 'syncing';
let lastSyncTime: Date = new Date();

export function subscribeSyncStatus(listener: StatusListener): () => void {
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

// Dual-write helper to keep Postgres / server-side Meta Commerce feed aligned
async function dualWriteServerProduct(method: 'POST' | 'DELETE', payload?: any, productId?: string) {
  try {
    const url = method === 'DELETE' && productId ? `/api/products/${productId}` : '/api/products';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(payload) : undefined
    });
  } catch {
    // Non-blocking background sync
  }
}

// ==========================================
// 4. PRODUCTS (CENTRAL STREAMING SOURCE OF TRUTH)
// ==========================================
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  initialFallback?: Product[]
): Unsubscribe {
  const collectionPath = 'products';
  updateSyncStatus('syncing');

  const unsubscribe = onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      try {
        const liveProducts: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.name && data.price !== undefined) {
            liveProducts.push({
              id: docSnap.id,
              name: data.name,
              slug: data.slug || docSnap.id,
              category: data.category || 'electromenager',
              price: Number(data.price) || 0,
              originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
              discountPercent: data.discountPercent ? Number(data.discountPercent) : undefined,
              rating: Number(data.rating) || 5,
              reviewsCount: Number(data.reviewsCount) || 0,
              images: Array.isArray(data.images) && data.images.length > 0 
                ? data.images 
                : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80'],
              description: data.description || data.name,
              features: Array.isArray(data.features) ? data.features : [],
              stock: data.stock !== undefined ? Number(data.stock) : 10,
              isFeatured: Boolean(data.isFeatured),
              isFlashSale: Boolean(data.isFlashSale),
              isNew: Boolean(data.isNew),
              brand: data.brand || 'DIAYMA GAAW',
              sku: data.sku || `DG-${docSnap.id.slice(-6)}`,
              warranty: data.warranty || 'Garantie 12 Mois',
              subcategory: data.subcategory || undefined
            });
          }
        });

        // Always sort consistently by newest first or ID
        liveProducts.sort((a, b) => b.id.localeCompare(a.id));

        updateSyncStatus('connected');
        onUpdate(liveProducts);

        try {
          localStorage.setItem('dg_products', JSON.stringify(liveProducts));
          if (liveProducts.length > 0) {
            localStorage.removeItem('dg_catalog_cleared');
          }
        } catch {
          // ignore
        }
      } catch (err) {
        console.error('Error processing live products snapshot:', err);
      }
    },
    (error) => {
      console.warn('Live Firestore product stream error:', error);
      updateSyncStatus('offline');
      // If Firestore connection fails, try local cache or fallback
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
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );

  return unsubscribe;
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const collectionPath = 'products';
  if (!product.id || !product.name) throw new Error('Produit invalide (ID ou Nom manquant)');
  updateSyncStatus('syncing');

  const sanitized = cleanForFirestore({
    id: product.id,
    name: product.name.trim(),
    slug: product.slug || product.id,
    category: product.category || 'electromenager',
    price: Math.max(0, Math.round(Number(product.price) || 0)),
    originalPrice: product.originalPrice ? Math.max(0, Math.round(Number(product.originalPrice))) : undefined,
    discountPercent: product.discountPercent ? Math.round(Number(product.discountPercent)) : undefined,
    rating: Number(product.rating) || 5,
    reviewsCount: Number(product.reviewsCount) || 0,
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [],
    description: product.description || product.name,
    features: Array.isArray(product.features) ? product.features : [],
    stock: product.stock !== undefined ? Math.round(Number(product.stock)) : 10,
    isFeatured: Boolean(product.isFeatured),
    isFlashSale: Boolean(product.isFlashSale),
    isNew: Boolean(product.isNew),
    brand: product.brand || 'DIAYMA GAAW',
    sku: product.sku || `DG-${product.id.slice(-6)}`,
    warranty: product.warranty || 'Garantie 12 Mois',
    subcategory: product.subcategory || undefined,
  });

  try {
    const docRef = doc(db, collectionPath, product.id);
    await setDoc(docRef, sanitized, { merge: true });
    updateSyncStatus('connected');
    // Background dual-write to PostgreSQL
    dualWriteServerProduct('POST', product);
  } catch (error) {
    updateSyncStatus('offline');
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${product.id}`);
  }
}

export async function saveProductsBatchToFirestore(productsList: Product[]): Promise<void> {
  if (!productsList || productsList.length === 0) return;
  const collectionPath = 'products';
  updateSyncStatus('syncing');

  try {
    // Firestore allows maximum 500 operations per batch
    const batchSize = 400;
    for (let i = 0; i < productsList.length; i += batchSize) {
      const slice = productsList.slice(i, i + batchSize);
      const batch = writeBatch(db);
      for (const p of slice) {
        if (!p || !p.id) continue;
        const ref = doc(db, collectionPath, p.id);
        batch.set(ref, cleanForFirestore(p), { merge: true });
      }
      await batch.commit();
    }
    updateSyncStatus('connected');
    dualWriteServerProduct('POST', productsList);
  } catch (error) {
    updateSyncStatus('offline');
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const collectionPath = 'products';
  updateSyncStatus('syncing');
  try {
    const docRef = doc(db, collectionPath, productId);
    await deleteDoc(docRef);
    updateSyncStatus('connected');
    dualWriteServerProduct('DELETE', undefined, productId);
  } catch (error) {
    updateSyncStatus('offline');
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${productId}`);
  }
}

export async function deleteAllProductsFromFirestore(): Promise<void> {
  const collectionPath = 'products';
  updateSyncStatus('syncing');
  try {
    const snap = await getDocs(collection(db, collectionPath));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    updateSyncStatus('connected');
    fetch('/api/products', { method: 'DELETE' }).catch(() => {});
  } catch (error) {
    updateSyncStatus('offline');
    handleFirestoreError(error, OperationType.DELETE, collectionPath);
  }
}

export async function resetAllProductDiscountsInFirestore(): Promise<void> {
  const collectionPath = 'products';
  updateSyncStatus('syncing');
  try {
    const snap = await getDocs(collection(db, collectionPath));
    const batch = writeBatch(db);
    snap.docs.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.discountPercent || d.originalPrice || d.isFlashSale) {
        batch.update(docSnap.ref, {
          discountPercent: null,
          originalPrice: null,
          isFlashSale: false
        });
      }
    });
    await batch.commit();
    updateSyncStatus('connected');
  } catch (error) {
    updateSyncStatus('offline');
    handleFirestoreError(error, OperationType.UPDATE, collectionPath);
  }
}

export async function seedInitialProducts(prods: Product[]): Promise<void> {
  await saveProductsBatchToFirestore(prods);
}

// ==========================================
// 5. CATEGORIES (REAL-TIME STREAM)
// ==========================================
export function subscribeToCategories(
  onUpdate: (cats: Category[]) => void,
  initialFallback?: Category[]
): Unsubscribe {
  const collectionPath = 'categories';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      try {
        const liveCats: Category[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.name) {
            liveCats.push({
              id: docSnap.id,
              name: data.name,
              slug: data.slug || docSnap.id,
              icon: data.icon || 'Package',
              image: data.image || '',
              itemCount: Number(data.itemCount) || 0,
              description: data.description || '',
              subcategories: Array.isArray(data.subcategories) ? data.subcategories : []
            });
          }
        });
        if (liveCats.length > 0) {
          onUpdate(liveCats);
          try {
            localStorage.setItem('dg_categories', JSON.stringify(liveCats));
          } catch {
            // ignore
          }
        } else if (initialFallback) {
          onUpdate(initialFallback);
        }
      } catch (err) {
        console.error('Error in categories snapshot:', err);
      }
    },
    (error) => {
      console.warn('Categories snapshot error:', error);
      if (initialFallback) onUpdate(initialFallback);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

export async function saveCategoryToFirestore(cat: Category): Promise<void> {
  const collectionPath = 'categories';
  try {
    const docRef = doc(db, collectionPath, cat.id);
    const sanitized = cleanForFirestore({
      id: cat.id,
      name: cat.name.trim(),
      slug: cat.slug || cat.id,
      icon: cat.icon || 'Package',
      image: cat.image || '',
      itemCount: Number(cat.itemCount) || 0,
      description: cat.description || '',
      subcategories: Array.isArray(cat.subcategories) ? cat.subcategories : []
    });
    await setDoc(docRef, sanitized, { merge: true });
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${cat.id}`);
  }
}

export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  const collectionPath = 'categories';
  try {
    const docRef = doc(db, collectionPath, categoryId);
    await deleteDoc(docRef);
    fetch(`/api/categories/${categoryId}`, { method: 'DELETE' }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${categoryId}`);
  }
}

export async function seedInitialCategories(cats: Category[]): Promise<void> {
  for (const c of cats) {
    await saveCategoryToFirestore(c);
  }
}

// ==========================================
// 6. ORDERS (REAL-TIME STREAM)
// ==========================================
export function subscribeToOrders(onUpdate: (orders: Order[]) => void): Unsubscribe {
  const collectionPath = 'orders';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      try {
        const liveOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const customerData: OrderCustomer = d.customer || {
            fullName: d.customerName || 'Client',
            phone: d.customerPhone || '',
            region: d.customerRegion || 'Dakar',
            city: d.customerCity || 'Dakar',
            neighborhood: d.customerNeighborhood || '',
            address: d.customerAddress || '',
            deliveryNotes: d.notes || ''
          };

          liveOrders.push({
            id: docSnap.id,
            orderNumber: d.orderNumber || `CMD-${docSnap.id.slice(-6)}`,
            createdAt: d.createdAt || new Date().toISOString(),
            items: Array.isArray(d.items) ? d.items : [],
            subtotal: Number(d.subtotal) || 0,
            deliveryFee: Number(d.deliveryFee) || 0,
            discount: Number(d.discount) || 0,
            total: Number(d.total) || 0,
            paymentMethod: d.paymentMethod || 'cod',
            paymentStatus: d.paymentStatus || 'pending',
            orderStatus: d.orderStatus || 'reçue',
            customer: customerData,
            trackingNumber: d.trackingNumber || `TRK-${docSnap.id.slice(-6)}`,
            waveOrOmNumber: d.waveOrOmNumber
          });
        });
        liveOrders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(liveOrders);
        try {
          localStorage.setItem('dg_orders', JSON.stringify(liveOrders));
        } catch {
          // ignore
        }
      } catch (err) {
        console.error('Error processing orders snapshot:', err);
      }
    },
    (error) => {
      console.warn('Orders snapshot error:', error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  const collectionPath = 'orders';
  try {
    const docRef = doc(db, collectionPath, order.id);
    await setDoc(docRef, cleanForFirestore(order), { merge: true });
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${order.id}`);
  }
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: Order['orderStatus']
): Promise<void> {
  const collectionPath = 'orders';
  try {
    const docRef = doc(db, collectionPath, orderId);
    await setDoc(docRef, { orderStatus: newStatus }, { merge: true });
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${orderId}`);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const collectionPath = 'orders';
  try {
    const docRef = doc(db, collectionPath, orderId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${orderId}`);
  }
}

// ==========================================
// 7. DELIVERY ZONES (REAL-TIME STREAM)
// ==========================================
export function subscribeToDeliveryZones(
  onUpdate: (zones: DeliveryZone[]) => void,
  initialFallback?: DeliveryZone[]
): Unsubscribe {
  const collectionPath = 'delivery_zones';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      try {
        const liveZones: DeliveryZone[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.name) {
            liveZones.push({
              id: docSnap.id,
              name: d.name,
              price: Number(d.price) || 0,
              estimatedTime: d.estimatedTime || '24h',
              description: d.description || '',
              regions: Array.isArray(d.regions) ? d.regions : []
            });
          }
        });
        if (liveZones.length > 0) {
          onUpdate(liveZones);
          try {
            localStorage.setItem('dg_delivery_zones', JSON.stringify(liveZones));
          } catch {
            // ignore
          }
        } else if (initialFallback) {
          onUpdate(initialFallback);
        }
      } catch (err) {
        console.error('Error processing delivery zones:', err);
      }
    },
    (error) => {
      console.warn('Delivery zones error:', error);
      if (initialFallback) onUpdate(initialFallback);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

export async function saveDeliveryZoneToFirestore(zone: DeliveryZone): Promise<void> {
  const collectionPath = 'delivery_zones';
  try {
    const docRef = doc(db, collectionPath, zone.id);
    await setDoc(docRef, cleanForFirestore(zone), { merge: true });
    fetch('/api/delivery-zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zone),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${zone.id}`);
  }
}

export async function deleteDeliveryZoneFromFirestore(zoneId: string): Promise<void> {
  const collectionPath = 'delivery_zones';
  try {
    await deleteDoc(doc(db, collectionPath, zoneId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${zoneId}`);
  }
}

// ==========================================
// 8. PROMO CODES (REAL-TIME STREAM)
// ==========================================
export function subscribeToPromoCodes(
  onUpdate: (promos: PromoCode[]) => void,
  initialFallback?: PromoCode[]
): Unsubscribe {
  const collectionPath = 'promo_codes';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      try {
        const livePromos: PromoCode[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.code) {
            livePromos.push({
              code: d.code.toUpperCase(),
              discountPercent: Number(d.discountPercent) || 0,
              description: d.description || '',
              isValidated: d.isValidated ?? true,
              isActive: d.isActive ?? true,
              createdAt: d.createdAt,
              validatedAt: d.validatedAt
            });
          }
        });
        onUpdate(livePromos);
        try {
          localStorage.setItem('dg_promos', JSON.stringify(livePromos));
          if (livePromos.length === 0) {
            localStorage.setItem('dg_promos_cleared', 'true');
          } else {
            localStorage.removeItem('dg_promos_cleared');
          }
        } catch {
          // ignore
        }
      } catch (err) {
        console.error('Error processing promo codes snapshot:', err);
      }
    },
    (error) => {
      console.warn('Promo codes error:', error);
      if (initialFallback) onUpdate(initialFallback);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

export async function savePromoCodeToFirestore(promo: PromoCode): Promise<void> {
  const collectionPath = 'promo_codes';
  const codeKey = promo.code.trim().toUpperCase();
  try {
    const docRef = doc(db, collectionPath, codeKey);
    await setDoc(docRef, cleanForFirestore({
      ...promo,
      code: codeKey,
      discountPercent: Number(promo.discountPercent) || 0
    }), { merge: true });
    fetch('/api/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promo),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${codeKey}`);
  }
}

export async function deletePromoCodeFromFirestore(code: string): Promise<void> {
  const collectionPath = 'promo_codes';
  const codeKey = code.trim().toUpperCase();
  try {
    const docRef = doc(db, collectionPath, codeKey);
    await deleteDoc(docRef);
    fetch(`/api/promo-codes/${codeKey}`, { method: 'DELETE' }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${codeKey}`);
  }
}

export async function deleteAllPromoCodesFromFirestore(): Promise<void> {
  const collectionPath = 'promo_codes';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    fetch('/api/promo-codes', { method: 'DELETE' }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionPath);
  }
}

// ==========================================
// 9. REVIEWS (REAL-TIME STREAM)
// ==========================================
export function subscribeToReviews(
  onUpdate: (reviews: Review[]) => void,
  initialFallback?: Review[]
): Unsubscribe {
  const collectionPath = 'reviews';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      try {
        const liveReviews: Review[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.authorName) {
            liveReviews.push({
              id: docSnap.id,
              productId: d.productId || '',
              authorName: d.authorName,
              city: d.city || 'Dakar',
              rating: Number(d.rating) || 5,
              date: d.date || 'Récemment',
              comment: d.comment || '',
              verifiedPurchase: d.verifiedPurchase ?? true
            });
          }
        });
        if (liveReviews.length > 0) {
          onUpdate(liveReviews);
        } else if (initialFallback) {
          onUpdate(initialFallback);
        }
      } catch (err) {
        console.error('Error processing reviews snapshot:', err);
      }
    },
    (error) => {
      console.warn('Reviews error:', error);
      if (initialFallback) onUpdate(initialFallback);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

export async function saveReviewToFirestore(review: Review): Promise<void> {
  const collectionPath = 'reviews';
  try {
    const docRef = doc(db, collectionPath, review.id);
    await setDoc(docRef, cleanForFirestore(review), { merge: true });
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${review.id}`);
  }
}

export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  const collectionPath = 'reviews';
  try {
    await deleteDoc(doc(db, collectionPath, reviewId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${reviewId}`);
  }
}

// ==========================================
// 10. STORE SETTINGS (REAL-TIME STREAM)
// ==========================================
export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  initialFallback?: StoreSettings
): Unsubscribe {
  const docPath = 'settings/general';
  return onSnapshot(
    doc(db, 'settings', 'general'),
    (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data() as StoreSettings;
          onUpdate(data);
          try {
            localStorage.setItem('dg_store_settings', JSON.stringify(data));
          } catch {
            // ignore
          }
        } else if (initialFallback) {
          onUpdate(initialFallback);
        }
      } catch (err) {
        console.error('Error processing settings snapshot:', err);
      }
    },
    (error) => {
      console.warn('Store settings error:', error);
      if (initialFallback) onUpdate(initialFallback);
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  );
}

export async function saveStoreSettingsToFirestore(settings: StoreSettings): Promise<void> {
  const docPath = 'settings/general';
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, cleanForFirestore(settings), { merge: true });
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
