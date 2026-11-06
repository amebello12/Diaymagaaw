import { pgTable, text, integer, boolean, timestamp, jsonb, real } from 'drizzle-orm/pg-core';

// Products Table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  originalPrice: integer('original_price'),
  discountPercent: integer('discount_percent'),
  rating: real('rating').default(5),
  reviewsCount: integer('reviews_count').default(0),
  images: jsonb('images').$type<string[]>().notNull(),
  description: text('description').notNull(),
  features: jsonb('features').$type<string[]>().notNull(),
  stock: integer('stock').notNull().default(0),
  isFeatured: boolean('is_featured').default(false),
  isFlashSale: boolean('is_flash_sale').default(false),
  isNew: boolean('is_new').default(false),
  brand: text('brand').default('DIAYMA GAAW'),
  sku: text('sku').notNull(),
  warranty: text('warranty'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Categories Table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(),
  image: text('image').notNull(),
  itemCount: integer('item_count').default(0),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders Table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  createdAt: text('created_at').notNull(),
  items: jsonb('items').notNull(),
  subtotal: integer('subtotal').notNull(),
  deliveryFee: integer('delivery_fee').notNull().default(0),
  discount: integer('discount').notNull().default(0),
  total: integer('total').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull(),
  orderStatus: text('order_status').notNull().default('reçue'),
  customer: jsonb('customer').notNull(),
  trackingNumber: text('tracking_number').notNull(),
  waveOrOmNumber: text('wave_or_om_number'),
  submittedAt: timestamp('submitted_at').defaultNow(),
});

// Promo Codes Table
export const promoCodes = pgTable('promo_codes', {
  code: text('code').primaryKey(),
  discountPercent: integer('discount_percent').notNull(),
  description: text('description').notNull(),
  isValidated: boolean('is_validated').default(true),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at'),
  validatedAt: text('validated_at'),
});

// Delivery Zones Table
export const deliveryZones = pgTable('delivery_zones', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  estimatedTime: text('estimated_time').notNull(),
  description: text('description').notNull(),
  regions: jsonb('regions').$type<string[]>().notNull(),
});

// Reviews Table
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  authorName: text('author_name').notNull(),
  city: text('city').notNull(),
  rating: integer('rating').notNull(),
  date: text('date').notNull(),
  comment: text('comment').notNull(),
  verifiedPurchase: boolean('verified_purchase').default(true),
});

// Store Settings Table
export const storeSettings = pgTable('store_settings', {
  id: text('id').primaryKey(), // Single row with id 'general'
  settings: jsonb('settings').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
