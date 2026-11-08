export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  features: string[];
  stock: number;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  isNew?: boolean;
  brand?: string;
  sku: string;
  warranty?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  itemCount: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type PaymentMethod = 'wave' | 'orange_money' | 'free_money' | 'cod';

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
  description: string;
  regions: string[];
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email?: string;
  region: string;
  city: string;
  neighborhood: string;
  address: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'verified' | 'paid' | 'cash_on_delivery';
  orderStatus: 'reçue' | 'en_préparation' | 'en_cours_de_livraison' | 'livrée' | 'annulée';
  customer: OrderCustomer;
  trackingNumber: string;
  waveOrOmNumber?: string;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  savedAddresses: {
    region: string;
    city: string;
    neighborhood: string;
    address: string;
  }[];
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  description: string;
  isValidated?: boolean; // Validé par l'administrateur
  isActive?: boolean; // Actif / Suspendu
  createdAt?: string;
  validatedAt?: string;
}

export type ActiveView = 
  | 'home'
  | 'shop'
  | 'category'
  | 'product_detail'
  | 'delivery'
  | 'reviews'
  | 'about'
  | 'contact'
  | 'faq'
  | 'admin';

export interface StoreSettings {
  storeName: string;
  slogan: string;
  phone: string;
  whatsappPhone: string;
  email: string;
  address: string;
  currency: string;
  freeShippingThreshold: number;
  enableWave: boolean;
  enableOrangeMoney: boolean;
  enableFreeMoney: boolean;
  enableCashOnDelivery: boolean;
  orderNoticeEmail?: string;
  deliveryNotificationWhatsApp: boolean;
  showAdminLockInFooter?: boolean;
  whatsappCatalogUrl?: string;
  enableWhatsAppCatalogButton?: boolean;
  whatsappOrderTemplate?: string;
  // Custom Logos & Favicons
  customLogoUrl?: string;
  customFaviconUrl?: string;
  faviconEmoji?: string;
  // Bande Passante Promotionnelle (Ticker / Marquee Banner)
  enablePromoBanner?: boolean;
  promoBannerText?: string;
  promoBannerBadge?: string;
  promoBannerBgColor?: 'red' | 'gold' | 'emerald' | 'dark' | 'blue';
  promoBannerButtonText?: string;
  promoBannerSpeed?: 'marquee' | 'static';
  // Configuration Personnalisée de la Page d'Accueil (Textes, Fond, Boutons, Disposition)
  homepageConfig?: HomepageConfig;
}

export type HeroBgGradientTheme = 'dark-emerald' | 'sunset' | 'deep-blue' | 'classic-dark' | 'electric-purple' | 'midnight-gold';

export interface HomepageConfig {
  heroBadge?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroSubtitle?: string;
  heroBgImage?: string;
  heroBgGradient?: HeroBgGradientTheme;
  heroPrimaryBtnText?: string;
  heroPrimaryBtnAction?: 'shop' | 'promotions' | 'whatsapp' | 'catalog';
  heroSecondaryBtnText?: string;
  heroSecondaryBtnAction?: 'promotions' | 'shop' | 'whatsapp' | 'contact';
  
  // Product Card Order Buttons
  cardBuyButtonText?: string;
  cardCartButtonText?: string;
  cardWhatsAppButtonText?: string;
  showCardWhatsApp?: boolean;
  showCardCart?: boolean;
  showCardBuyNow?: boolean;

  // Sections Visibility
  sectionsVisibility?: {
    heroBanner?: boolean;
    categoryGrid?: boolean;
    flashSale?: boolean;
    featuredProducts?: boolean;
    allProductsCatalog?: boolean;
    brandPartners?: boolean;
    reviews?: boolean;
    trustBadges?: boolean;
  };

  // Section Order (Keys of sections to reorder)
  sectionOrder?: string[];

  // Custom Titles & Subtitles for sections
  sectionTitles?: {
    categoryGridTitle?: string;
    categoryGridSubtitle?: string;
    flashSaleTitle?: string;
    flashSaleSubtitle?: string;
    featuredTitle?: string;
    featuredSubtitle?: string;
    allProductsTitle?: string;
    allProductsSubtitle?: string;
    brandPartnersTitle?: string;
    reviewsTitle?: string;
    reviewsSubtitle?: string;
  };
}

export interface VisitorDayStats {
  date: string; // Ex: '15 Sept'
  fullDate: string; // YYYY-MM-DD
  visitors: number;
  pageViews: number;
}

export interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  uniqueVisitors: number;
  activeNow: number;
  totalPageViews: number;
  lastUpdated: string;
  dailyHistory: VisitorDayStats[];
  topRegions: { region: string; visitors: number; percentage: number }[];
  deviceBreakdown: { device: string; percentage: number; count: number }[];
}
