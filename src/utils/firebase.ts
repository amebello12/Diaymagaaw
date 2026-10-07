import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order, DeliveryZone, PromoCode, Review, StoreSettings } from '../types';

// 1. Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// 2. Validate Connection to Firestore on boot as mandated
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Connexion Firestore en attente du réseau.");
    }
  }
}
testConnection();

// 3. Error Handling Architecture
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  return errInfo;
}

// 4. Multi-device sync state listeners
type SyncStatusCallback = (status: 'connected' | 'syncing' | 'offline', lastSyncTime?: Date) => void;
const syncListeners: Set<SyncStatusCallback> = new Set();
let currentSyncStatus: 'connected' | 'syncing' | 'offline' = 'connected';
let lastSyncDate = new Date();

export function subscribeSyncStatus(callback: SyncStatusCallback) {
  syncListeners.add(callback);
  callback(currentSyncStatus, lastSyncDate);
  return () => {
    syncListeners.delete(callback);
  };
}

function updateSyncStatus(status: 'connected' | 'syncing' | 'offline') {
  currentSyncStatus = status;
  lastSyncDate = new Date();
  syncListeners.forEach(cb => cb(currentSyncStatus, lastSyncDate));
}

// Helper to strip undefined values so Firestore never rejects mutations
export function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    return value === undefined ? null : value;
  }));
}

// 5. Products Real-time Synchronization (Articles Multi-appareils)
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  initialFallback?: Product[]
) {
  const path = 'products';
  const productsCol = collection(db, path);

  const unsubscribe = onSnapshot(
    productsCol,
    (snapshot) => {
      updateSyncStatus('connected');
      if (snapshot.empty) {
        // If Firestore products collection is empty on first setup, seed with initial catalog
        if (initialFallback && initialFallback.length > 0) {
          seedInitialProducts(initialFallback).catch(err => {
            console.warn('Seeding initial products warning:', err);
          });
        }
        onUpdate(initialFallback || []);
        return;
      }

      const prods: Product[] = [];
      snapshot.forEach(docSnap => {
        prods.push(docSnap.data() as Product);
      });

      // Sort: Newly created products (timestamp in ID) appear first at the top of the store!
      prods.sort((a, b) => {
        const timeA = a.id.startsWith('prod-1') && a.id.length > 8 ? parseInt(a.id.replace('prod-', ''), 10) : 0;
        const timeB = b.id.startsWith('prod-1') && b.id.length > 8 ? parseInt(b.id.replace('prod-', ''), 10) : 0;
        if (timeA && timeB) return timeB - timeA;
        if (timeA) return -1;
        if (timeB) return 1;
        const numA = parseInt(a.id.replace('prod-', ''), 10) || 999;
        const numB = parseInt(b.id.replace('prod-', ''), 10) || 999;
        return numA - numB;
      });

      onUpdate(prods);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      updateSyncStatus('offline');
    }
  );

  return unsubscribe;
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  updateSyncStatus('syncing');
  try {
    const cleanProduct = sanitizeForFirestore(product);
    await setDoc(doc(db, 'products', product.id), cleanProduct);
    updateSyncStatus('connected');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    updateSyncStatus('offline');
    throw error;
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  updateSyncStatus('syncing');
  try {
    await deleteDoc(doc(db, 'products', productId));
    updateSyncStatus('connected');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    updateSyncStatus('offline');
    throw error;
  }
}

export async function seedInitialProducts(initialProducts: Product[]): Promise<void> {
  updateSyncStatus('syncing');
  try {
    const batch = writeBatch(db);
    initialProducts.forEach(prod => {
      const docRef = doc(db, 'products', prod.id);
      batch.set(docRef, sanitizeForFirestore(prod));
    });
    await batch.commit();
    updateSyncStatus('connected');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
    updateSyncStatus('offline');
  }
}

// 6. Orders Real-time Synchronization
export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  const path = 'orders';
  const ordersCol = collection(db, path);

  const unsubscribe = onSnapshot(
    ordersCol,
    (snapshot) => {
      const ords: Order[] = [];
      snapshot.forEach(docSnap => {
        ords.push(docSnap.data() as Order);
      });
      // Sort newest first
      ords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(ords);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), sanitizeForFirestore(order));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateOrderStatusInFirestore(orderId: string, status: Order['orderStatus']): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await setDoc(doc(db, 'orders', orderId), { orderStatus: status }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// 7. Delivery Zones Synchronization
export function subscribeToDeliveryZones(
  onUpdate: (zones: DeliveryZone[]) => void,
  initialZones?: DeliveryZone[]
) {
  const path = 'delivery_zones';
  const col = collection(db, path);

  const unsubscribe = onSnapshot(
    col,
    (snapshot) => {
      if (snapshot.empty && initialZones && initialZones.length > 0) {
        // Seed default delivery zones
        const batch = writeBatch(db);
        initialZones.forEach(z => {
          batch.set(doc(db, 'delivery_zones', z.id), sanitizeForFirestore(z));
        });
        batch.commit().catch(() => {});
        onUpdate(initialZones);
        return;
      }

      const zones: DeliveryZone[] = [];
      snapshot.forEach(docSnap => {
        zones.push(docSnap.data() as DeliveryZone);
      });
      if (zones.length > 0) {
        onUpdate(zones);
      } else if (initialZones) {
        onUpdate(initialZones);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

export async function saveDeliveryZoneToFirestore(zone: DeliveryZone): Promise<void> {
  const path = `delivery_zones/${zone.id}`;
  try {
    await setDoc(doc(db, 'delivery_zones', zone.id), sanitizeForFirestore(zone));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteDeliveryZoneFromFirestore(zoneId: string): Promise<void> {
  const path = `delivery_zones/${zoneId}`;
  try {
    await deleteDoc(doc(db, 'delivery_zones', zoneId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// 8. Promo Codes Synchronization
export function subscribeToPromoCodes(
  onUpdate: (promos: PromoCode[]) => void,
  initialPromos?: PromoCode[]
) {
  const path = 'promo_codes';
  const col = collection(db, path);

  const unsubscribe = onSnapshot(
    col,
    (snapshot) => {
      if (snapshot.empty && initialPromos && initialPromos.length > 0) {
        const batch = writeBatch(db);
        initialPromos.forEach(p => {
          batch.set(doc(db, 'promo_codes', p.code), sanitizeForFirestore(p));
        });
        batch.commit().catch(() => {});
        onUpdate(initialPromos);
        return;
      }

      const promos: PromoCode[] = [];
      snapshot.forEach(docSnap => {
        promos.push(docSnap.data() as PromoCode);
      });
      if (promos.length > 0) {
        onUpdate(promos);
      } else if (initialPromos) {
        onUpdate(initialPromos);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

export async function savePromoCodeToFirestore(promo: PromoCode): Promise<void> {
  const path = `promo_codes/${promo.code}`;
  try {
    await setDoc(doc(db, 'promo_codes', promo.code), sanitizeForFirestore(promo));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deletePromoCodeFromFirestore(code: string): Promise<void> {
  const path = `promo_codes/${code}`;
  try {
    await deleteDoc(doc(db, 'promo_codes', code));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// 9. Reviews Synchronization
export function subscribeToReviews(
  onUpdate: (reviews: Review[]) => void,
  initialReviews?: Review[]
) {
  const path = 'reviews';
  const col = collection(db, path);

  const unsubscribe = onSnapshot(
    col,
    (snapshot) => {
      if (snapshot.empty && initialReviews && initialReviews.length > 0) {
        const batch = writeBatch(db);
        initialReviews.forEach(r => {
          batch.set(doc(db, 'reviews', r.id), sanitizeForFirestore(r));
        });
        batch.commit().catch(() => {});
        onUpdate(initialReviews);
        return;
      }

      const revs: Review[] = [];
      snapshot.forEach(docSnap => {
        revs.push(docSnap.data() as Review);
      });
      if (revs.length > 0) {
        onUpdate(revs);
      } else if (initialReviews) {
        onUpdate(initialReviews);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

export async function saveReviewToFirestore(review: Review): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    await setDoc(doc(db, 'reviews', review.id), sanitizeForFirestore(review));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  const path = `reviews/${reviewId}`;
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// 10. Store Settings Synchronization
export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  initialSettings?: StoreSettings
) {
  const path = 'settings/general';
  const docRef = doc(db, 'settings', 'general');

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as StoreSettings);
      } else if (initialSettings) {
        setDoc(docRef, sanitizeForFirestore(initialSettings)).catch(() => {});
        onUpdate(initialSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function saveStoreSettingsToFirestore(settings: StoreSettings): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore(settings));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// 11. Google Auth for Admin
export async function signInAdminWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  }
}

export async function signOutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
