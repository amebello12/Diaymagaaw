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
}

export type ActiveView = 
  | 'home'
  | 'shop'
  | 'category'
  | 'product_detail'
  | 'delivery'
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
}
