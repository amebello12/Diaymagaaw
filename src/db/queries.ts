import { db } from './index.ts';
import { products, categories, orders, promoCodes, deliveryZones, reviews, storeSettings } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { Product, Category, Order, PromoCode, DeliveryZone, Review, StoreSettings } from '../types.ts';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_DELIVERY_ZONES, 
  INITIAL_PROMO_CODES, 
  INITIAL_STORE_SETTINGS, 
  INITIAL_REVIEWS 
} from '../data/initialData.ts';

/**
 * Seed initial catalog and store data into PostgreSQL if tables are empty
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  try {
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0) {
      console.log('Seeding initial products into PostgreSQL...');
      for (const p of INITIAL_PRODUCTS) {
        await db.insert(products).values({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category,
          price: p.price,
          originalPrice: p.originalPrice ?? null,
          discountPercent: p.discountPercent ?? null,
          rating: p.rating ?? 5,
          reviewsCount: p.reviewsCount ?? 0,
          images: p.images || [],
          description: p.description,
          features: p.features || [],
          stock: p.stock ?? 0,
          isFeatured: p.isFeatured ?? false,
          isFlashSale: p.isFlashSale ?? false,
          isNew: p.isNew ?? false,
          brand: p.brand || 'DIAYMA GAAW',
          sku: p.sku || `SKU-${p.id}`,
          warranty: p.warranty ?? null,
        }).onConflictDoNothing();
      }
    }

    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length === 0) {
      console.log('Seeding initial categories into PostgreSQL...');
      for (const c of INITIAL_CATEGORIES) {
        await db.insert(categories).values({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          image: c.image,
          itemCount: c.itemCount ?? 0,
          description: c.description ?? null,
        }).onConflictDoNothing();
      }
    }

    const existingZones = await db.select().from(deliveryZones).limit(1);
    if (existingZones.length === 0) {
      for (const z of INITIAL_DELIVERY_ZONES) {
        await db.insert(deliveryZones).values({
          id: z.id,
          name: z.name,
          price: z.price,
          estimatedTime: z.estimatedTime,
          description: z.description,
          regions: z.regions || [],
        }).onConflictDoNothing();
      }
    }

    const existingPromos = await db.select().from(promoCodes).limit(1);
    if (existingPromos.length === 0) {
      for (const pr of INITIAL_PROMO_CODES) {
        await db.insert(promoCodes).values({
          code: pr.code,
          discountPercent: pr.discountPercent,
          description: pr.description,
          isValidated: pr.isValidated ?? true,
          isActive: pr.isActive ?? true,
          createdAt: pr.createdAt || new Date().toISOString(),
          validatedAt: pr.validatedAt || new Date().toISOString(),
        }).onConflictDoNothing();
      }
    }

    const existingReviews = await db.select().from(reviews).limit(1);
    if (existingReviews.length === 0) {
      for (const r of INITIAL_REVIEWS) {
        await db.insert(reviews).values({
          id: r.id,
          productId: r.productId,
          authorName: r.authorName,
          city: r.city,
          rating: r.rating,
          date: r.date,
          comment: r.comment,
          verifiedPurchase: r.verifiedPurchase ?? true,
        }).onConflictDoNothing();
      }
    }

    const existingSettings = await db.select().from(storeSettings).where(eq(storeSettings.id, 'general')).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(storeSettings).values({
        id: 'general',
        settings: INITIAL_STORE_SETTINGS,
      }).onConflictDoNothing();
    }
  } catch (error) {
    console.error('Error seeding initial data to PostgreSQL:', error);
  }
}

// =================== PRODUCTS ===================
export async function getProducts(): Promise<Product[]> {
  try {
    const rows = await db.select().from(products).orderBy(desc(products.updatedAt));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      price: r.price,
      originalPrice: r.originalPrice ?? undefined,
      discountPercent: r.discountPercent ?? undefined,
      rating: r.rating ?? 5,
      reviewsCount: r.reviewsCount ?? 0,
      images: (r.images as string[]) || [],
      description: r.description,
      features: (r.features as string[]) || [],
      stock: r.stock,
      isFeatured: r.isFeatured ?? false,
      isFlashSale: r.isFlashSale ?? false,
      isNew: r.isNew ?? false,
      brand: r.brand ?? undefined,
      sku: r.sku,
      warranty: r.warranty ?? undefined,
    }));
  } catch (error) {
    console.error('Database getProducts query failed:', error);
    throw new Error('Failed to retrieve products from database.', { cause: error });
  }
}

export async function upsertProduct(product: Product): Promise<void> {
  return upsertProductsBatch([product]);
}

export async function upsertProductsBatch(items: Product[]): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    for (const product of items) {
      if (!product || !product.id || !product.name) continue;

      const safeImages = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (typeof product.images === 'string' && (product.images as string).trim()
            ? [(product.images as string).trim()]
            : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80']);

      const safeFeatures = Array.isArray(product.features) && product.features.length > 0
        ? product.features
        : (product.features ? [String(product.features)] : [
            'Qualité certifiée et testée DIAYMA GAAW',
            'Compatible avec les réseaux et normes du Sénégal',
            'Livraison express 2h à 4h sur Dakar'
          ]);

      const timestamp = Date.now();
      const safeSlug = product.slug && product.slug.trim()
        ? product.slug.trim()
        : `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'article'}-${timestamp.toString().slice(-4)}`;

      const safePrice = Math.max(0, Math.round(Number(product.price) || 0));
      const safeOriginalPrice = product.originalPrice ? Math.max(0, Math.round(Number(product.originalPrice))) : null;
      const safeDiscount = product.discountPercent 
        ? Math.round(Number(product.discountPercent)) 
        : (safeOriginalPrice && safeOriginalPrice > safePrice 
            ? Math.round(((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100) 
            : null);
      const safeStock = product.stock !== undefined && product.stock !== null ? Math.round(Number(product.stock)) : 10;
      const safeBrand = (product.brand && product.brand.trim()) || 'DIAYMA GAAW';
      const safeSku = (product.sku && product.sku.trim()) || `DG-SKU-${Math.floor(1000 + Math.random() * 9000)}`;

      await db.insert(products).values({
        id: product.id,
        name: product.name.trim(),
        slug: safeSlug,
        category: product.category || 'electromenager',
        price: safePrice,
        originalPrice: safeOriginalPrice,
        discountPercent: safeDiscount,
        rating: Number(product.rating) || 5,
        reviewsCount: Number(product.reviewsCount) || 0,
        images: safeImages,
        description: product.description || product.name,
        features: safeFeatures,
        stock: safeStock,
        isFeatured: Boolean(product.isFeatured),
        isFlashSale: Boolean(product.isFlashSale),
        isNew: Boolean(product.isNew),
        brand: safeBrand,
        sku: safeSku,
        warranty: product.warranty || 'Garantie 12 Mois',
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: products.id,
        set: {
          name: product.name.trim(),
          slug: safeSlug,
          category: product.category || 'electromenager',
          price: safePrice,
          originalPrice: safeOriginalPrice,
          discountPercent: safeDiscount,
          images: safeImages,
          description: product.description || product.name,
          features: safeFeatures,
          stock: safeStock,
          isFeatured: Boolean(product.isFeatured),
          isFlashSale: Boolean(product.isFlashSale),
          isNew: Boolean(product.isNew),
          brand: safeBrand,
          sku: safeSku,
          warranty: product.warranty || 'Garantie 12 Mois',
          updatedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Database upsertProductsBatch query failed:', error);
    throw new Error('Failed to save products in database.', { cause: error });
  }
}

export async function deleteProductById(id: string): Promise<void> {
  try {
    await db.delete(products).where(eq(products.id, id));
  } catch (error) {
    console.error('Database deleteProduct query failed:', error);
    throw new Error('Failed to delete product.', { cause: error });
  }
}

export async function clearAllProducts(): Promise<void> {
  try {
    await db.delete(products);
  } catch (error) {
    console.error('Database clearAllProducts query failed:', error);
    throw new Error('Failed to clear products.', { cause: error });
  }
}

// =================== CATEGORIES ===================
export async function getCategories(): Promise<Category[]> {
  try {
    const rows = await db.select().from(categories);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      icon: r.icon,
      image: r.image,
      itemCount: r.itemCount ?? 0,
      description: r.description ?? undefined,
    }));
  } catch (error) {
    console.error('Database getCategories query failed:', error);
    throw new Error('Failed to retrieve categories.', { cause: error });
  }
}

export async function upsertCategory(cat: Category): Promise<void> {
  try {
    await db.insert(categories).values({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      image: cat.image,
      itemCount: cat.itemCount,
      description: cat.description ?? null,
    }).onConflictDoUpdate({
      target: categories.id,
      set: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        image: cat.image,
        itemCount: cat.itemCount,
        description: cat.description ?? null,
      },
    });
  } catch (error) {
    console.error('Database upsertCategory failed:', error);
    throw new Error('Failed to save category.', { cause: error });
  }
}

export async function deleteCategoryById(id: string): Promise<void> {
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch (error) {
    console.error('Database deleteCategory failed:', error);
    throw new Error('Failed to delete category.', { cause: error });
  }
}

// =================== ORDERS ===================
export async function getOrders(): Promise<Order[]> {
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.submittedAt));
    return rows.map((r) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      createdAt: r.createdAt,
      items: r.items as any,
      subtotal: r.subtotal,
      deliveryFee: r.deliveryFee,
      discount: r.discount,
      total: r.total,
      paymentMethod: r.paymentMethod as any,
      paymentStatus: r.paymentStatus as any,
      orderStatus: r.orderStatus as any,
      customer: r.customer as any,
      trackingNumber: r.trackingNumber,
      waveOrOmNumber: r.waveOrOmNumber ?? undefined,
    }));
  } catch (error) {
    console.error('Database getOrders failed:', error);
    throw new Error('Failed to retrieve orders.', { cause: error });
  }
}

export async function createOrder(order: Order): Promise<void> {
  try {
    await db.insert(orders).values({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      customer: order.customer,
      trackingNumber: order.trackingNumber,
      waveOrOmNumber: order.waveOrOmNumber ?? null,
    }).onConflictDoUpdate({
      target: orders.id,
      set: {
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        waveOrOmNumber: order.waveOrOmNumber ?? null,
      },
    });
  } catch (error) {
    console.error('Database createOrder failed:', error);
    throw new Error('Failed to save order.', { cause: error });
  }
}

export async function updateOrderStatus(id: string, status: Order['orderStatus']): Promise<void> {
  try {
    await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id));
  } catch (error) {
    console.error('Database updateOrderStatus failed:', error);
    throw new Error('Failed to update order status.', { cause: error });
  }
}

// =================== PROMO CODES ===================
export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const rows = await db.select().from(promoCodes);
    return rows.map((r) => ({
      code: r.code,
      discountPercent: r.discountPercent,
      description: r.description,
      isValidated: r.isValidated ?? true,
      isActive: r.isActive ?? true,
      createdAt: r.createdAt ?? undefined,
      validatedAt: r.validatedAt ?? undefined,
    }));
  } catch (error) {
    console.error('Database getPromoCodes failed:', error);
    throw new Error('Failed to retrieve promo codes.', { cause: error });
  }
}

export async function upsertPromoCode(promo: PromoCode): Promise<void> {
  try {
    await db.insert(promoCodes).values({
      code: promo.code.toUpperCase().trim(),
      discountPercent: promo.discountPercent,
      description: promo.description,
      isValidated: promo.isValidated ?? true,
      isActive: promo.isActive ?? true,
      createdAt: promo.createdAt || new Date().toISOString(),
      validatedAt: promo.validatedAt || new Date().toISOString(),
    }).onConflictDoUpdate({
      target: promoCodes.code,
      set: {
        discountPercent: promo.discountPercent,
        description: promo.description,
        isValidated: promo.isValidated ?? true,
        isActive: promo.isActive ?? true,
      },
    });
  } catch (error) {
    console.error('Database upsertPromoCode failed:', error);
    throw new Error('Failed to save promo code.', { cause: error });
  }
}

export async function deletePromoCodeByCode(code: string): Promise<void> {
  try {
    await db.delete(promoCodes).where(eq(promoCodes.code, code.toUpperCase().trim()));
  } catch (error) {
    console.error('Database deletePromoCode failed:', error);
    throw new Error('Failed to delete promo code.', { cause: error });
  }
}

export async function clearAllPromoCodes(): Promise<void> {
  try {
    await db.delete(promoCodes);
  } catch (error) {
    console.error('Database clearAllPromoCodes failed:', error);
    throw new Error('Failed to clear promo codes.', { cause: error });
  }
}

// =================== DELIVERY ZONES ===================
export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  try {
    const rows = await db.select().from(deliveryZones);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      estimatedTime: r.estimatedTime,
      description: r.description,
      regions: (r.regions as string[]) || [],
    }));
  } catch (error) {
    console.error('Database getDeliveryZones failed:', error);
    throw new Error('Failed to retrieve delivery zones.', { cause: error });
  }
}

export async function upsertDeliveryZone(zone: DeliveryZone): Promise<void> {
  try {
    await db.insert(deliveryZones).values({
      id: zone.id,
      name: zone.name,
      price: zone.price,
      estimatedTime: zone.estimatedTime,
      description: zone.description,
      regions: zone.regions,
    }).onConflictDoUpdate({
      target: deliveryZones.id,
      set: {
        name: zone.name,
        price: zone.price,
        estimatedTime: zone.estimatedTime,
        description: zone.description,
        regions: zone.regions,
      },
    });
  } catch (error) {
    console.error('Database upsertDeliveryZone failed:', error);
    throw new Error('Failed to save delivery zone.', { cause: error });
  }
}

// =================== REVIEWS ===================
export async function getReviews(): Promise<Review[]> {
  try {
    const rows = await db.select().from(reviews);
    return rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      authorName: r.authorName,
      city: r.city,
      rating: r.rating,
      date: r.date,
      comment: r.comment,
      verifiedPurchase: r.verifiedPurchase ?? true,
    }));
  } catch (error) {
    console.error('Database getReviews failed:', error);
    throw new Error('Failed to retrieve reviews.', { cause: error });
  }
}

export async function addReview(review: Review): Promise<void> {
  try {
    await db.insert(reviews).values({
      id: review.id,
      productId: review.productId,
      authorName: review.authorName,
      city: review.city,
      rating: review.rating,
      date: review.date,
      comment: review.comment,
      verifiedPurchase: review.verifiedPurchase ?? true,
    });
  } catch (error) {
    console.error('Database addReview failed:', error);
    throw new Error('Failed to save review.', { cause: error });
  }
}

// =================== STORE SETTINGS ===================
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const rows = await db.select().from(storeSettings).where(eq(storeSettings.id, 'general')).limit(1);
    if (rows.length > 0 && rows[0].settings) {
      return { ...INITIAL_STORE_SETTINGS, ...(rows[0].settings as Partial<StoreSettings>) };
    }
    return INITIAL_STORE_SETTINGS;
  } catch (error) {
    console.error('Database getStoreSettings failed:', error);
    return INITIAL_STORE_SETTINGS;
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    await db.insert(storeSettings).values({
      id: 'general',
      settings,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: storeSettings.id,
      set: {
        settings,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Database saveStoreSettings failed:', error);
    throw new Error('Failed to save store settings.', { cause: error });
  }
}
