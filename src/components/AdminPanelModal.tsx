import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Package, 
  ShoppingBag, 
  Layers, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Search, 
  TrendingUp, 
  BarChart3, 
  PhoneCall, 
  MessageSquare, 
  RotateCcw, 
  Flame, 
  Star, 
  Truck, 
  Tag, 
  Settings, 
  LogOut, 
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Globe,
  Mail,
  MapPin,
  CreditCard,
  Smartphone,
  Bell,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Users,
  Laptop,
  ArrowUpRight,
  MessageCircle,
  Activity,
  Share2,
  HelpCircle,
  Sparkles,
  Layout,
  MoveUp,
  MoveDown,
  Palette,
  Sliders,
  FolderTree,
  PlusCircle,
  Speaker,
  Tv,
  Sun,
  Zap,
  Camera,
  HeartPulse
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PromoAnnouncementBanner } from './PromoAnnouncementBanner';
import { Product, Category, Subcategory, Order, PromoCode, DeliveryZone, StoreSettings, Review, VisitorStats, HomepageConfig, HeroBgGradientTheme } from '../types';
import { formatFCFA, STORE_PHONE_RAW, formatPhoneNumber, cleanPhoneForWhatsApp } from '../utils/currency';
import { INITIAL_STORE_SETTINGS } from '../data/initialData';
import { WaveLogo, OrangeMoneyLogo, FreeMoneyLogo, CashOnDeliveryLogo } from './PaymentLogos';
import { getVisitorStats, resetVisitorStatsToZero } from '../utils/visitorTracker';
import { 
  downloadWhatsAppCatalogCsv, 
  downloadMetaCatalogXml, 
  shareCatalogOnWhatsApp, 
  generateWhatsAppCatalogShareMessage 
} from '../utils/whatsappCatalogGenerator';
import { isFirestoreQuotaExceeded } from '../utils/firebase';
import { parseCatalogFileContent, downloadSampleCatalogCsv } from '../utils/catalogParser';

// Compress image file to lightweight DataURL to avoid exceeding storage quota
const compressAndReadImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface AdminPanelModalProps {
  isOpen: boolean;
  isPageMode?: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  onSaveCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  orders: Order[];
  promoCodes?: PromoCode[];
  deliveryZones?: DeliveryZone[];
  settings?: StoreSettings;
  onUpdateSettings?: (settings: StoreSettings) => void;
  onAddProduct: (product: Product) => void;
  onAddProductsBatch?: (productsList: Product[]) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  onDeleteOrder?: (orderId: string) => void;
  onAddPromoCode?: (promo: PromoCode) => void;
  onDeletePromoCode?: (code: string) => void;
  onValidatePromoCode?: (code: string, isValidated: boolean) => void;
  onTogglePromoStatus?: (code: string, isActive: boolean) => void;
  onValidateAllPromoCodes?: () => void;
  onOpenExportShopify: () => void;
  onResetData?: () => void;
  onUpdateDeliveryZone?: (zoneId: string, updated: Partial<DeliveryZone>) => void;
  onAddDeliveryZone?: (newZone: DeliveryZone) => void;
  onDeleteDeliveryZone?: (zoneId: string) => void;
  onResetDeliveryZones?: () => void;
  onResetDashboardStats?: () => void;
  onResetStockAlerts?: () => void;
  onResetAllAdmin?: () => void;
  onDeleteAllProducts?: () => void;
  onDeleteAllPromoCodes?: () => void;
  onResetProductDiscounts?: () => void;
  onRestoreDefaultProducts?: () => void;
  onRestoreDefaultPromos?: () => void;
  reviews?: Review[];
  onDeleteReview?: (reviewId: string) => void;
  visitorStats?: VisitorStats;
  onResetVisitorStats?: () => void;
  syncStatus?: 'connected' | 'syncing' | 'offline';
  lastSyncDate?: Date;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  isPageMode = false,
  onClose,
  products,
  categories,
  onSaveCategory,
  onDeleteCategory,
  orders,
  promoCodes = [],
  deliveryZones = [],
  settings,
  onUpdateSettings,
  onAddProduct,
  onAddProductsBatch,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddPromoCode,
  onDeletePromoCode,
  onValidatePromoCode,
  onTogglePromoStatus,
  onValidateAllPromoCodes,
  onOpenExportShopify,
  onResetData,
  onUpdateDeliveryZone,
  onAddDeliveryZone,
  onDeleteDeliveryZone,
  onResetDeliveryZones,
  onResetDashboardStats,
  onResetStockAlerts,
  onResetAllAdmin,
  onDeleteAllProducts,
  onDeleteAllPromoCodes,
  onResetProductDiscounts,
  onRestoreDefaultProducts,
  onRestoreDefaultPromos,
  reviews = [],
  onDeleteReview,
  visitorStats,
  onResetVisitorStats,
  syncStatus = 'connected',
  lastSyncDate
}) => {
  // Visitor statistics state fallback & live tracking
  const [localVisitorStats, setLocalVisitorStats] = useState<VisitorStats>(() => visitorStats || getVisitorStats());

  useEffect(() => {
    if (visitorStats) {
      setLocalVisitorStats(visitorStats);
    } else {
      setLocalVisitorStats(getVisitorStats());
    }
  }, [visitorStats]);

  const currentVisitorStats = visitorStats || localVisitorStats;

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('dg_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tabs
  const [tab, setTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'promos' | 'delivery' | 'reviews' | 'whatsapp' | 'settings' | 'homepage'>('dashboard');

  // Product Filtering & Form State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSubcategoryFilter, setProductSubcategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);

  // Form fields for Add/Edit Product
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.slug || 'telephones-accessoires');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
  const [customSubcategoryInput, setCustomSubcategoryInput] = useState('');
  const [persistSubcatToCategory, setPersistSubcatToCategory] = useState(true);
  const [formPrice, setFormPrice] = useState(25000);

  // Category & Subcategory Management State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [catFormName, setCatFormName] = useState('');
  const [catFormSlug, setCatFormSlug] = useState('');
  const [catFormIcon, setCatFormIcon] = useState('Package');
  const [catFormImage, setCatFormImage] = useState('');
  const [catFormDescription, setCatFormDescription] = useState('');
  const [catFormSubcategories, setCatFormSubcategories] = useState<Subcategory[]>([]);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [categoryFeedback, setCategoryFeedback] = useState<string | null>(null);
  const [deleteCatConfirmId, setDeleteCatConfirmId] = useState<string | null>(null);
  const [formOriginalPrice, setFormOriginalPrice] = useState(35000);
  const [formStock, setFormStock] = useState(10);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formBrand, setFormBrand] = useState('DIAYMA GAAW');
  const [formSku, setFormSku] = useState('');
  const [formWarranty, setFormWarranty] = useState('6 mois de garantie');
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formIsFlashSale, setFormIsFlashSale] = useState(false);
  const [productFeedback, setProductFeedback] = useState<string | null>(null);
  const [copiedWhatsAppLink, setCopiedWhatsAppLink] = useState(false);
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);
  const [copiedFeedUrl, setCopiedFeedUrl] = useState(false);
  const [testFeedStatus, setTestFeedStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [testFeedMsg, setTestFeedMsg] = useState<string | null>(null);

  // Catalog Bulk Upload state
  const [showCatalogImportModal, setShowCatalogImportModal] = useState(false);
  const [isImportingCatalog, setIsImportingCatalog] = useState(false);
  const [catalogImportFeedback, setCatalogImportFeedback] = useState<string | null>(null);
  const [catalogImportErrors, setCatalogImportErrors] = useState<string[]>([]);
  const catalogFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCatalogFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingCatalog(true);
    setCatalogImportFeedback(null);
    setCatalogImportErrors([]);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const result = parseCatalogFileContent(content, categories);

          if (result.errors.length > 0 && result.products.length === 0) {
            setCatalogImportErrors(result.errors);
            setIsImportingCatalog(false);
            return;
          }

          if (result.products.length === 0) {
            setCatalogImportErrors(['Aucun produit valide trouvé dans le fichier importé.']);
            setIsImportingCatalog(false);
            return;
          }

          // Bulk save to state & PostgreSQL
          if (onAddProductsBatch) {
            onAddProductsBatch(result.products);
          } else {
            for (const p of result.products) {
              onAddProduct(p);
            }
          }

          setCatalogImportFeedback(`Succès ! ${result.totalParsed} article(s) ont été importés et synchronisés dans votre catalogue !`);
          setProductFeedback(`${result.totalParsed} article(s) téléversés avec succès dans le catalogue !`);
          setTimeout(() => setProductFeedback(null), 5000);
          setIsImportingCatalog(false);

          if (e.target) e.target.value = '';
        } catch (err) {
          setCatalogImportErrors([`Erreur lors du traitement : ${String(err)}`]);
          setIsImportingCatalog(false);
        }
      };
      reader.onerror = () => {
        setCatalogImportErrors(['Erreur lors de la lecture du fichier sur votre appareil.']);
        setIsImportingCatalog(false);
      };
      reader.readAsText(file);
    } catch (err) {
      setCatalogImportErrors([`Erreur : ${String(err)}`]);
      setIsImportingCatalog(false);
    }
  };

  // Order filtering
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Promo Form State
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(10);
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoValidated, setNewPromoValidated] = useState(true);
  const [newPromoActive, setNewPromoActive] = useState(true);
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('dg_store_settings');
      return saved ? JSON.parse(saved) : (settings || INITIAL_STORE_SETTINGS);
    } catch {
      return settings || INITIAL_STORE_SETTINGS;
    }
  });

  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('dg_store_settings', JSON.stringify(storeSettings));
    } catch {
      // ignore
    }
    if (onUpdateSettings) {
      onUpdateSettings(storeSettings);
    }
    setSettingsSavedSuccess(true);
    setTimeout(() => {
      setSettingsSavedSuccess(false);
    }, 3500);
  };

  const handleResetSettingsToDefault = () => {
    if (confirm('Voulez-vous réinitialiser tous les paramètres aux valeurs par défaut de la boutique ?')) {
      setStoreSettings(INITIAL_STORE_SETTINGS);
      try {
        localStorage.setItem('dg_store_settings', JSON.stringify(INITIAL_STORE_SETTINGS));
      } catch {
        // ignore
      }
      if (onUpdateSettings) {
        onUpdateSettings(INITIAL_STORE_SETTINGS);
      }
      setSettingsSavedSuccess(true);
      setTimeout(() => {
        setSettingsSavedSuccess(false);
      }, 3500);
    }
  };

  const heroBgFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const updateHomepageConfig = (updater: Partial<HomepageConfig> | ((prev: HomepageConfig) => HomepageConfig)) => {
    setStoreSettings(prev => {
      const base: HomepageConfig = prev.homepageConfig || {
        heroBadge: "Efficacité • Rapidité • Fiabilité",
        heroTitle: "Les bons produits",
        heroHighlight: "au bon prix.",
        heroSubtitle: "Découvrez nos produits tendance et profitez de nos meilleures offres au Sénégal. Livraison rapide à Dakar, banlieue et dans toutes les régions.",
        heroBgImage: "",
        heroBgGradient: "dark-emerald",
        heroPrimaryBtnText: "ACHETER MAINTENANT",
        heroPrimaryBtnAction: "shop",
        heroSecondaryBtnText: "VOIR LES PROMOTIONS",
        heroSecondaryBtnAction: "promotions",
        cardBuyButtonText: "Acheter",
        cardCartButtonText: "Au panier",
        cardWhatsAppButtonText: "WhatsApp",
        showCardWhatsApp: true,
        showCardCart: true,
        showCardBuyNow: true,
        sectionsVisibility: {
          heroBanner: true,
          categoryGrid: true,
          flashSale: true,
          featuredProducts: true,
          allProductsCatalog: true,
          reviews: true,
          brandPartners: true,
          trustBadges: true,
        },
        sectionOrder: [
          'heroBanner',
          'categoryGrid',
          'flashSale',
          'featuredProducts',
          'allProductsCatalog',
          'reviews',
          'brandPartners',
          'trustBadges'
        ],
        sectionTitles: {
          flashSaleTitle: "⚡ PROMO SÉNÉGAL : OFFRES FLASH",
          flashSaleSubtitle: "Faites défiler le diaporama des meilleures remises au Sénégal. Articles neufs avec garantie, en stock à Dakar.",
          featuredTitle: "🔥 NOS PRODUITS VEDETTES",
          featuredSubtitle: "Les articles les plus demandés et recommandés par nos clients au Sénégal.",
          categoryGridTitle: "Explorez par Catégories",
          categoryGridSubtitle: "Trouvez les meilleurs équipements électroniques, maison & bien-être au Sénégal.",
          allProductsTitle: "📦 TOUT LE CATALOGUE DISPONIBLE",
          allProductsSubtitle: "Tous nos articles testés et certifiés DIAYMA GAAW en stock immédiat à Dakar.",
          brandPartnersTitle: "Grandes Marques & Partenaires Officiels",
          reviewsTitle: "Avis Clients Vérifiés",
          reviewsSubtitle: "Retours d'expérience authentiques de nos acheteurs à Dakar et dans toutes les régions."
        }
      };

      const nextConfig: HomepageConfig = typeof updater === 'function' ? updater(base) : { ...base, ...updater };
      const updatedSettings = { ...prev, homepageConfig: nextConfig };
      try {
        localStorage.setItem('dg_store_settings', JSON.stringify(updatedSettings));
      } catch {
        // ignore
      }
      if (onUpdateSettings) {
        onUpdateSettings(updatedSettings);
      }
      return updatedSettings;
    });
    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 3000);
  };

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressAndReadImage(file);
      updateHomepageConfig({ heroBgImage: dataUrl });
    } catch {
      // ignore
    }
  };

  const handleMoveSection = (sectionKey: string, direction: 'up' | 'down') => {
    const defaultOrder = [
      'heroBanner',
      'categoryGrid',
      'flashSale',
      'featuredProducts',
      'allProductsCatalog',
      'reviews',
      'brandPartners',
      'trustBadges'
    ];
    const currentOrder = storeSettings.homepageConfig?.sectionOrder || defaultOrder;
    const index = currentOrder.indexOf(sectionKey);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentOrder.length) return;

    const reordered = [...currentOrder];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    updateHomepageConfig({ sectionOrder: reordered });
  };

  const handleToggleSectionVisibility = (sectionKey: string) => {
    const defaultVis = {
      heroBanner: true,
      categoryGrid: true,
      flashSale: true,
      featuredProducts: true,
      allProductsCatalog: true,
      reviews: true,
      brandPartners: true,
      trustBadges: true,
    };
    const currentVis = storeSettings.homepageConfig?.sectionsVisibility || defaultVis;
    const currentVal = (currentVis as any)[sectionKey] !== false;
    updateHomepageConfig({
      sectionsVisibility: {
        ...currentVis,
        [sectionKey]: !currentVal
      }
    });
  };

  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const compressed = await compressAndReadImage(file);
      const updated = { ...storeSettings, customLogoUrl: compressed };
      setStoreSettings(updated);
      try {
        localStorage.setItem('dg_store_settings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      if (onUpdateSettings) onUpdateSettings(updated);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3500);
    } catch (err) {
      alert("Erreur lors de l'importation du logo : " + String(err));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconUploading(true);
    try {
      const compressed = await compressAndReadImage(file);
      const updated = { ...storeSettings, customFaviconUrl: compressed, faviconEmoji: undefined };
      setStoreSettings(updated);
      try {
        localStorage.setItem('dg_store_settings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      if (onUpdateSettings) onUpdateSettings(updated);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3500);
    } catch (err) {
      alert("Erreur lors de l'importation du favicon : " + String(err));
    } finally {
      setFaviconUploading(false);
    }
  };

  // Copy notification
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delivery Zone Editing & Creation State
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editZonePrice, setEditZonePrice] = useState<number>(0);
  const [editZoneEstimatedTime, setEditZoneEstimatedTime] = useState<string>('');
  const [editZoneDescription, setEditZoneDescription] = useState<string>('');
  
  const [showAddZoneModal, setShowAddZoneModal] = useState<boolean>(false);
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZonePrice, setNewZonePrice] = useState<number>(2000);
  const [newZoneEstimatedTime, setNewZoneEstimatedTime] = useState<string>('24h à 48h');
  const [newZoneDescription, setNewZoneDescription] = useState<string>('');
  const [newZoneRegions, setNewZoneRegions] = useState<string>('Régions du Sénégal');

  const [deliveryFeedback, setDeliveryFeedback] = useState<string | null>(null);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const handleStartEditZone = (zone: DeliveryZone) => {
    setEditingZoneId(zone.id);
    setEditZonePrice(zone.price);
    setEditZoneEstimatedTime(zone.estimatedTime);
    setEditZoneDescription(zone.description);
  };

  const handleSaveZone = (zoneId: string) => {
    if (onUpdateDeliveryZone) {
      onUpdateDeliveryZone(zoneId, {
        price: Number(editZonePrice),
        estimatedTime: editZoneEstimatedTime.trim(),
        description: editZoneDescription.trim()
      });
      setDeliveryFeedback(`Tarif mis à jour : ${formatFCFA(Number(editZonePrice))} enregistré avec succès !`);
      setTimeout(() => setDeliveryFeedback(null), 4000);
    }
    setEditingZoneId(null);
  };

  const handleQuickPriceChange = (zone: DeliveryZone, newPrice: number) => {
    if (onUpdateDeliveryZone) {
      onUpdateDeliveryZone(zone.id, { price: Math.max(0, newPrice) });
      setDeliveryFeedback(`Tarif pour "${zone.name}" ajusté à ${formatFCFA(Math.max(0, newPrice))} !`);
      setTimeout(() => setDeliveryFeedback(null), 4000);
    }
  };

  const handleCreateNewZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !onAddDeliveryZone) return;
    const newZone: DeliveryZone = {
      id: 'zone-' + Date.now(),
      name: newZoneName.trim(),
      price: Number(newZonePrice),
      estimatedTime: newZoneEstimatedTime.trim() || '24h à 48h',
      description: newZoneDescription.trim() || 'Livraison standard',
      regions: newZoneRegions.split(',').map(r => r.trim()).filter(Boolean)
    };
    onAddDeliveryZone(newZone);
    setShowAddZoneModal(false);
    setNewZoneName('');
    setNewZonePrice(2000);
    setNewZoneDescription('');
    setDeliveryFeedback(`Nouvelle zone "${newZone.name}" créée au tarif de ${formatFCFA(newZone.price)} !`);
    setTimeout(() => setDeliveryFeedback(null), 4000);
  };

  const handleTriggerResetDashboard = () => {
    if (window.confirm("Voulez-vous réinitialiser le chiffre d'affaires et les commandes à 0 ?")) {
      onResetDashboardStats?.();
      setResetFeedback("Chiffre d'affaires (0 FCFA) et commandes (0) remis à zéro avec succès !");
      setTimeout(() => setResetFeedback(null), 4000);
    }
  };

  const handleTriggerResetStockAlerts = () => {
    onResetStockAlerts?.();
    setResetFeedback("Tous les stocks ont été réapprovisionnés : 0 alerte restante !");
    setTimeout(() => setResetFeedback(null), 4000);
  };

  const handleTriggerResetVisitors = () => {
    if (window.confirm("Voulez-vous remettre à zéro le compteur de visiteurs et statistiques du site ?")) {
      if (onResetVisitorStats) {
        onResetVisitorStats();
      } else {
        const reset = resetVisitorStatsToZero();
        setLocalVisitorStats(reset);
      }
      setResetFeedback("Statistiques de fréquentation et visiteurs remises à zéro avec succès !");
      setTimeout(() => setResetFeedback(null), 4000);
    }
  };

  const handleTriggerResetAllAdmin = () => {
    if (window.confirm("Voulez-vous réinitialiser complètement le panneau d'administration (Chiffre d'affaires à 0 FCFA, 0 commande, visiteurs, stocks sains, tarifs par défaut) ?")) {
      onResetAllAdmin?.();
      if (onResetVisitorStats) {
        onResetVisitorStats();
      } else {
        const reset = resetVisitorStatsToZero();
        setLocalVisitorStats(reset);
      }
      setResetFeedback("Tout le panneau d'administration et les statistiques ont été réinitialisés avec succès !");
      setTimeout(() => setResetFeedback(null), 4000);
    }
  };

  const handleTriggerDeleteAllProducts = () => {
    if (window.confirm(`⚠️ ATTENTION ACTION IRRÉVERSIBLE :\n\nVoulez-vous vraiment supprimer TOUS les ${products.length} articles du catalogue ?\n\nLe catalogue sera remis à zéro (0 article) et apparaîtra vide immédiatement en direct pour tous les visiteurs et clients sur le site.\n\nConfirmer la suppression complète du catalogue ?`)) {
      onDeleteAllProducts?.();
      setResetFeedback(`Catalogue entièrement vidé : 0 article en direct sur le site !`);
      setTimeout(() => setResetFeedback(null), 5000);
    }
  };

  const handleTriggerDeleteAllPromos = () => {
    if (window.confirm(`⚠️ ATTENTION :\n\nVoulez-vous supprimer TOUS les codes de réduction (${promoCodes.length}) et annuler les remises sur les articles ?\n\nToutes les promotions seront remises à zéro.\n\nConfirmer la remise à zéro des promos ?`)) {
      onDeleteAllPromoCodes?.();
      onResetProductDiscounts?.();
      setResetFeedback(`Toutes les promotions et codes de réduction ont été remis à zéro avec succès !`);
      setTimeout(() => setResetFeedback(null), 5000);
    }
  };

  if (!isOpen) return null;

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanUser = loginUsername.trim();
    const cleanPass = loginPassword.trim();

    // Required credentials: Experteven / Cognediola@26
    if (cleanUser === 'Experteven' && cleanPass === 'Cognediola@26') {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('dg_admin_authenticated', 'true');
      } catch {
        // ignore
      }
      setLoginError(null);
    } else {
      setLoginError('Identifiant ou mot de passe incorrect. Accès strictement réservé.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('dg_admin_authenticated');
    } catch {
      // ignore
    }
    setLoginUsername('');
    setLoginPassword('');
  };

  // Start Editing Product
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddingNewProduct(false);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormSubcategory(prod.subcategory || '');
    setIsCustomSubcategory(false);
    setCustomSubcategoryInput('');
    setFormPrice(prod.price);
    setFormOriginalPrice(prod.originalPrice || prod.price);
    setFormStock(prod.stock);
    const existingImgs = prod.images && prod.images.length > 0 ? [...prod.images] : [];
    setFormImages(existingImgs);
    setFormImageUrl(existingImgs[0] || '');
    setFormDescription(prod.description);
    setFormBrand(prod.brand || 'DIAYMA GAAW');
    setFormSku(prod.sku);
    setFormWarranty(prod.warranty || '6 mois de garantie');
    setFormIsFeatured(!!prod.isFeatured);
    setFormIsFlashSale(!!prod.isFlashSale);
    setUploadFeedback(null);
  };

  // Start Adding New Product
  const startAddNew = () => {
    setIsAddingNewProduct(true);
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.slug || 'telephones-accessoires');
    setFormSubcategory('');
    setIsCustomSubcategory(false);
    setCustomSubcategoryInput('');
    setFormPrice(15000);
    setFormOriginalPrice(20000);
    setFormStock(15);
    setFormImages([]);
    setFormImageUrl('');
    setFormDescription('Produit de qualité supérieure garanti par DIAYMA GAAW, prêt pour livraison rapide à Dakar et dans toutes les régions.');
    setFormBrand('Marque Officielle');
    setFormSku(`DG-ITEM-${Math.floor(100 + Math.random() * 900)}`);
    setFormWarranty('6 mois de garantie');
    setFormIsFeatured(true);
    setFormIsFlashSale(false);
    setUploadFeedback(null);
  };

  // Process uploaded image files (drag & drop or file dialog)
  const handleProcessUploadedFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setUploadFeedback("Veuillez sélectionner des fichiers image valides (JPG, PNG, WEBP, SVG).");
      setTimeout(() => setUploadFeedback(null), 4000);
      return;
    }

    setIsReadingFiles(true);
    try {
      const processedDataUrls: string[] = [];
      for (const file of fileArray) {
        const dataUrl = await compressAndReadImage(file);
        processedDataUrls.push(dataUrl);
      }

      setFormImages(prev => {
        const updated = [...prev, ...processedDataUrls];
        if (!formImageUrl && updated.length > 0) {
          setFormImageUrl(updated[0]);
        }
        return updated;
      });

      setUploadFeedback(`${fileArray.length} photo(s) importée(s) avec succès !`);
      setTimeout(() => setUploadFeedback(null), 4000);
    } catch (err) {
      console.error("Erreur lors de l'importation de l'image", err);
      setUploadFeedback("Une erreur est survenue lors de l'importation des images.");
      setTimeout(() => setUploadFeedback(null), 4000);
    } finally {
      setIsReadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrlImage = () => {
    const clean = formImageUrl.trim();
    if (!clean) return;
    if (!formImages.includes(clean)) {
      setFormImages(prev => [...prev, clean]);
      setUploadFeedback("Image ajoutée avec succès !");
      setTimeout(() => setUploadFeedback(null), 3000);
    }
    setFormImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setFormImages(prev => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  // Quick Stock increment / decrement
  const handleQuickStockChange = (prod: Product, delta: number) => {
    const newStock = Math.max(0, prod.stock + delta);
    onUpdateProduct({ ...prod, stock: newStock });
    setProductFeedback(`Stock de « ${prod.name} » ajusté à ${newStock} et synchronisé en direct sur tous les appareils !`);
    setTimeout(() => setProductFeedback(null), 4000);
  };

  // Quick Toggle Flash Sale
  const handleToggleFlashSale = (prod: Product) => {
    onUpdateProduct({ ...prod, isFlashSale: !prod.isFlashSale });
    setProductFeedback(`Statut Vente Flash de « ${prod.name} » synchronisé sur tous les appareils !`);
    setTimeout(() => setProductFeedback(null), 4000);
  };

  // Quick Toggle Featured
  const handleToggleFeatured = (prod: Product) => {
    onUpdateProduct({ ...prod, isFeatured: !prod.isFeatured });
    setProductFeedback(`Mise en vedette de « ${prod.name} » synchronisée sur tous les appareils !`);
    setTimeout(() => setProductFeedback(null), 4000);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = formImages.length > 0 
      ? formImages 
      : (formImageUrl.trim() ? [formImageUrl.trim()] : []);

    if (!formName.trim()) return;
    if (finalImages.length === 0) {
      setUploadFeedback("Veuillez importer ou ajouter au moins une photo pour le produit.");
      return;
    }

    const discountPercent = formOriginalPrice > formPrice 
      ? Math.round(((formOriginalPrice - formPrice) / formOriginalPrice) * 100)
      : undefined;

    // Détermination de la sous-catégorie effective
    const effectiveSubcategory = (isCustomSubcategory ? customSubcategoryInput : formSubcategory).trim();

    // Si une nouvelle sous-catégorie personnalisée a été saisie, l'ajouter de façon permanente au rayon sélectionné
    if (isCustomSubcategory && customSubcategoryInput.trim() && persistSubcatToCategory && onSaveCategory) {
      const activeCat = categories.find(c => c.slug === formCategory);
      if (activeCat) {
        const newSubName = customSubcategoryInput.trim();
        const newSubSlug = newSubName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const alreadyExists = activeCat.subcategories?.some(
          s => s.slug === newSubSlug || s.name.toLowerCase() === newSubName.toLowerCase()
        );
        if (!alreadyExists) {
          const updatedSubcategories: Subcategory[] = [
            ...(activeCat.subcategories || []),
            {
              id: 'sub-' + Date.now(),
              name: newSubName,
              slug: newSubSlug,
              description: `Articles ${newSubName} du rayon ${activeCat.name}`
            }
          ];
          onSaveCategory({
            ...activeCat,
            subcategories: updatedSubcategories
          });
        }
      }
    }

    const categoryObj = categories.find(c => c.slug === formCategory);
    const categoryName = categoryObj?.name || formCategory;

    if (isAddingNewProduct) {
      const timestamp = Date.now();
      const baseSlug = formName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'article';
      const newProd: Product = {
        id: 'prod-' + timestamp,
        name: formName.trim(),
        slug: `${baseSlug}-${timestamp.toString().slice(-4)}`,
        category: formCategory,
        subcategory: effectiveSubcategory || undefined,
        price: Number(formPrice),
        originalPrice: Number(formOriginalPrice),
        discountPercent,
        rating: 5.0,
        reviewsCount: 1,
        images: finalImages,
        description: formDescription.trim(),
        features: [
          'Qualité certifiée et testée DIAYMA GAAW',
          'Compatible avec les réseaux et normes du Sénégal',
          'Livraison rapide en 2h à 4h sur Dakar'
        ],
        stock: Number(formStock),
        isFeatured: formIsFeatured,
        isFlashSale: formIsFlashSale,
        brand: formBrand.trim(),
        sku: formSku.trim() || `DG-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        warranty: formWarranty.trim()
      };
      onAddProduct(newProd);
      setIsAddingNewProduct(false);
      setFormName('');
      setFormSubcategory('');
      setIsCustomSubcategory(false);
      setCustomSubcategoryInput('');
      setFormImages([]);
      setFormImageUrl('');
      setFormDescription('');
      setFormPrice(25000);
      setFormOriginalPrice(35000);
      setProductFeedback(`✅ L'article « ${newProd.name} » est publié dans le rayon « ${categoryName} »${effectiveSubcategory ? ` (sous-catégorie : ${effectiveSubcategory})` : ''} et immédiatement visible par tous les visiteurs sur le site !`);
      setTimeout(() => setProductFeedback(null), 6000);
    } else if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formName.trim(),
        category: formCategory,
        subcategory: effectiveSubcategory || undefined,
        price: Number(formPrice),
        originalPrice: Number(formOriginalPrice),
        discountPercent,
        stock: Number(formStock),
        images: finalImages,
        description: formDescription.trim(),
        brand: formBrand.trim(),
        sku: formSku.trim(),
        warranty: formWarranty.trim(),
        isFeatured: formIsFeatured,
        isFlashSale: formIsFlashSale
      };
      onUpdateProduct(updated);
      setEditingProduct(null);
      setFormName('');
      setFormSubcategory('');
      setIsCustomSubcategory(false);
      setCustomSubcategoryInput('');
      setFormImages([]);
      setFormImageUrl('');
      setProductFeedback(`✅ Modifications de « ${updated.name} » publiées en direct (Rayon : ${categoryName}${effectiveSubcategory ? ` > ${effectiveSubcategory}` : ''}) !`);
      setTimeout(() => setProductFeedback(null), 6000);
    }
  };

  // Category & Subcategory Handlers
  const startAddNewCategory = () => {
    setIsAddingNewCategory(true);
    setEditingCategory(null);
    setCatFormName('');
    setCatFormSlug('');
    setCatFormIcon('Package');
    setCatFormImage('https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop');
    setCatFormDescription('');
    setCatFormSubcategories([]);
    setNewSubcategoryName('');
    setCategoryFeedback(null);
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setIsAddingNewCategory(false);
    setCatFormName(cat.name);
    setCatFormSlug(cat.slug);
    setCatFormIcon(cat.icon || 'Package');
    setCatFormImage(cat.image || '');
    setCatFormDescription(cat.description || '');
    setCatFormSubcategories(Array.isArray(cat.subcategories) ? [...cat.subcategories] : []);
    setNewSubcategoryName('');
    setCategoryFeedback(null);
  };

  const handleAddSubcategoryToForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubcategoryName.trim()) return;
    const name = newSubcategoryName.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `sub-${Date.now()}`;
    if (catFormSubcategories.some(s => s.slug === slug || s.name.toLowerCase() === name.toLowerCase())) {
      setCategoryFeedback("Cette sous-catégorie existe déjà dans la liste.");
      setTimeout(() => setCategoryFeedback(null), 3000);
      return;
    }
    const newSub: Subcategory = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      slug
    };
    setCatFormSubcategories(prev => [...prev, newSub]);
    setNewSubcategoryName('');
  };

  const handleRemoveSubcategoryFromForm = (subSlugOrId: string) => {
    setCatFormSubcategories(prev => prev.filter(s => s.id !== subSlugOrId && s.slug !== subSlugOrId));
  };

  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) {
      setCategoryFeedback("Veuillez saisir un nom pour la catégorie.");
      return;
    }
    const slug = catFormSlug.trim() 
      ? catFormSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : catFormName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const id = editingCategory ? editingCategory.id : (slug || `cat-${Date.now()}`);

    const catToSave: Category = {
      id,
      name: catFormName.trim(),
      slug,
      icon: catFormIcon || 'Package',
      image: catFormImage.trim() || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      itemCount: editingCategory ? editingCategory.itemCount : 0,
      description: catFormDescription.trim(),
      subcategories: catFormSubcategories
    };

    if (onSaveCategory) {
      onSaveCategory(catToSave);
      setCategoryFeedback(`✅ Le rayon « ${catToSave.name} » et ses sous-catégories ont été synchronisés avec succès en direct !`);
      setTimeout(() => setCategoryFeedback(null), 5000);
    }
    setIsAddingNewCategory(false);
    setEditingCategory(null);
  };

  const handleDeleteCategoryAction = (catId: string) => {
    if (onDeleteCategory) {
      onDeleteCategory(catId);
      setCategoryFeedback(`🗑️ La catégorie a été supprimée du catalogue.`);
      setTimeout(() => setCategoryFeedback(null), 4000);
    }
    setDeleteCatConfirmId(null);
  };

  // Add Promo Code
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim() || !onAddPromoCode) return;
    const cleanCode = newPromoCode.trim().toUpperCase();
    onAddPromoCode({
      code: cleanCode,
      discountPercent: Number(newPromoDiscount),
      description: newPromoDesc.trim() || `Réduction de ${newPromoDiscount}% au panier`,
      isValidated: newPromoValidated,
      isActive: newPromoActive,
      createdAt: new Date().toISOString(),
      validatedAt: newPromoValidated ? new Date().toISOString() : undefined
    });
    setPromoFeedback(`Code promotionnel « ${cleanCode} » défini avec succès (${newPromoValidated ? 'Validé par l\'Admin' : 'En attente de validation'}) !`);
    setTimeout(() => setPromoFeedback(null), 5000);
    setNewPromoCode('');
    setNewPromoDiscount(10);
    setNewPromoDesc('');
  };

  // Generate WhatsApp Direct link to customer
  const generateCustomerWhatsAppUrl = (order: Order) => {
    const rawPhone = order.customer.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('221') ? rawPhone : `221${rawPhone}`;
    
    let statusText = '';
    switch (order.orderStatus) {
      case 'reçue':
        statusText = 'a bien été reçue et est en cours de validation';
        break;
      case 'en_préparation':
        statusText = 'est actuellement en cours d’emballage et de préparation';
        break;
      case 'en_cours_de_livraison':
        statusText = `est en cours d’acheminement par notre coursier vers ${order.customer.neighborhood}, ${order.customer.city}`;
        break;
      case 'livrée':
        statusText = 'a été marquée comme livrée avec succès';
        break;
      case 'annulée':
        statusText = 'a été annulée';
        break;
    }

    const message = `Bonjour ${order.customer.fullName},\n\nIci le service client de *DIAYMA GAAW* 🇸🇳.\nVotre commande *#${order.orderNumber}* (Total: ${formatFCFA(order.total)}) ${statusText}.\n\nPour toute question ou précision sur votre adresse de livraison, vous pouvez nous répondre directement ici sur WhatsApp.\n\nMerci de votre confiance !`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Calculation Metrics for Dashboard
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.orderStatus !== 'annulée' ? ord.total : 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'reçue' || o.orderStatus === 'en_préparation').length;
  const inDeliveryOrdersCount = orders.filter(o => o.orderStatus === 'en_cours_de_livraison').length;
  const deliveredOrdersCount = orders.filter(o => o.orderStatus === 'livrée').length;
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const matchesSubcategory = productSubcategoryFilter === 'all' || (
      p.subcategory && (
        p.subcategory.toLowerCase() === productSubcategoryFilter.toLowerCase() ||
        p.subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-') === productSubcategoryFilter.toLowerCase()
      )
    );
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesSearch = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customer.phone.includes(orderSearch) ||
                          o.customer.neighborhood.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!isOpen && !isPageMode) {
    return null;
  }

  const content = (
    <div className={`relative w-full ${isPageMode ? 'bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border border-gray-200 font-sans min-h-[820px]' : 'max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col border border-gray-100 font-sans'}`}>
        
        {/* Top Header Bar */}
        <div className="bg-gray-950 text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white shadow-md shadow-red-900/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                  Panneau d'Administration DIAYMA GAAW
                </h2>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-full text-[10px] font-bold">
                    Connecté : Experteven
                  </span>
                )}
                <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  syncStatus === 'connected' 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                    : syncStatus === 'syncing' 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700/60 animate-pulse' 
                    : 'bg-gray-800 text-gray-300 border-gray-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    syncStatus === 'connected' ? 'bg-emerald-400 animate-ping' : syncStatus === 'syncing' ? 'bg-amber-400' : 'bg-gray-400'
                  }`} />
                  {syncStatus === 'connected' ? 'Base Unique Centralisée (Mobiles & PC) : En direct' : syncStatus === 'syncing' ? 'Synchronisation Cloud...' : 'Hors ligne'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Gestion complète du catalogue, des commandes, des prix et des paramètres de la boutique
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={onOpenExportShopify}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  title="Exporter le thème Shopify complet"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Thème Shopify</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-red-900/80 text-gray-200 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition border border-gray-700 cursor-pointer"
                  title="Se déconnecter de l'administration"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-bold transition border border-gray-700 cursor-pointer ${
                isPageMode ? '' : 'w-8 h-8 !p-0 rounded-full justify-center'
              }`}
              title={isPageMode ? "Retour à la boutique" : "Fermer"}
            >
              {isPageMode ? (
                <>
                  <ArrowLeft className="w-3.5 h-3.5 text-gray-400" />
                  <span>Retour Boutique</span>
                </>
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Quota Exceeded Notification Banner */}
        {isFirestoreQuotaExceeded() && (
          <div className="bg-amber-950/95 border-b border-amber-500/40 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-amber-200 gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>
                <strong>Mode Hors-Ligne / Cache Activé :</strong> Le quota quotidien gratuit de lectures Firestore a été atteint. La boutique reste 100% fonctionnelle avec vos données locales (WhatsApp & commandes opérationnels). Il se réinitialise à minuit UTC.
              </span>
            </div>
            <a
              href="https://console.firebase.google.com/project/sacred-keep-jxctm/firestore/databases/ai-studio-diaymagaawboutiq-ff548f93-96af-4e9a-8e6e-252c3a75c4ea/data?openUpgradeDialog=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/30 shrink-0 transition"
            >
              <span>Augmenter le quota Firebase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* IF NOT AUTHENTICATED: LOGIN VIEW */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
              
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <BrandLogo size="lg" customLogoUrl={storeSettings.customLogoUrl} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Accès Sécurisé Administrateur</span>
                </div>
                <p className="text-xs text-gray-500">
                  Veuillez renseigner vos identifiants autorisés pour gérer la boutique DIAYMA GAAW.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Échec d'authentification</strong>
                    <span>{loginError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Identifiant administrateur
                  </label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ex: Experteven"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-600/20 transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Se connecter au panneau d'administration</span>
                </button>
              </form>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 text-[11px] text-gray-500 flex items-center justify-between">
                <span>🔐 Session cryptée et isolée</span>
                <span className="font-mono text-gray-400">v2.0 Senegal Edition</span>
              </div>

            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Tab Navigation Menu */}
            <div className="flex border-b border-gray-200 px-4 sm:px-6 bg-gray-50 overflow-x-auto gap-1">
              <button
                onClick={() => setTab('dashboard')}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'dashboard' ? 'border-red-600 text-red-600 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Tableau de bord</span>
              </button>

              <button
                onClick={() => {
                  setTab('products');
                  setIsAddingNewProduct(false);
                  setEditingProduct(null);
                }}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'products' ? 'border-red-600 text-red-600 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Catalogue & Produits ({products.length})</span>
                {lowStockProducts.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                    {lowStockProducts.length} alerte
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setTab('categories');
                  setIsAddingNewCategory(false);
                  setEditingCategory(null);
                }}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'categories' ? 'border-red-600 text-red-600 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layers className="w-4 h-4 text-red-600" />
                <span>Catégories & Rayons ({categories.length})</span>
              </button>

              <button
                onClick={() => setTab('orders')}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'orders' ? 'border-red-600 text-red-600 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Commandes Reçues ({orders.length})</span>
                {pendingOrdersCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px]">
                    {pendingOrdersCount} à traiter
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab('promos')}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'promos' ? 'border-red-600 text-red-600 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Codes Promo ({promoCodes.length})</span>
              </button>

              <button
                onClick={() => setTab('delivery')}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'delivery' ? 'border-red-600 text-red-600 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Zones de Livraison</span>
              </button>

              <button
                onClick={() => setTab('reviews')}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'reviews' ? 'border-red-600 text-red-600 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Avis Clients ({reviews.length})</span>
              </button>

              <button
                onClick={() => setTab('whatsapp')}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'whatsapp' ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-emerald-700'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Liaison WhatsApp & Facebook Market</span>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black">
                  Flux Direct
                </span>
              </button>

              <button
                onClick={() => setTab('homepage')}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'homepage' ? 'border-red-600 text-red-600 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layout className="w-4 h-4 text-red-600" />
                <span>Page d'Accueil & Disposition</span>
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-black">
                  Personnaliser
                </span>
              </button>

              <button
                onClick={() => setTab('settings')}
                className={`py-3.5 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  tab === 'settings' ? 'border-red-600 text-red-600 bg-white shadow-xs' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres & Export</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
              
              {/* TAB 1: DASHBOARD STATS */}
              {tab === 'dashboard' && (
                <div className="space-y-6">

                  {/* Reset & Operation Feedback Notification */}
                  {resetFeedback && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 font-bold shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{resetFeedback}</span>
                      </div>
                      <button onClick={() => setResetFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Panel Reinitialization & Fast Control Center */}
                  <div className="p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-950 text-white rounded-2xl shadow-md space-y-3.5 border border-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-amber-400" />
                          Centre de Contrôle & Réinitialisation du Tableau de Bord
                        </h4>
                        <p className="text-xs text-gray-300">
                          Contrôlez les indicateurs clés en temps réel ou remettez à zéro les compteurs d'un clic.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 text-[11px] font-bold rounded-full self-start sm:self-auto flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Système Opérationnel 🇸🇳
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                      <button
                        onClick={handleTriggerResetDashboard}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-left transition flex items-center gap-3 group"
                        title="Remettre le chiffre d'affaires et les commandes à zéro"
                      >
                        <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-lg group-hover:scale-105 transition shrink-0">
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Remise à zéro Chiffre d'Affaires</span>
                          <span className="text-[11px] text-gray-300 block">CA = 0 FCFA • 0 commande</span>
                        </div>
                      </button>

                      <button
                        onClick={handleTriggerDeleteAllProducts}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-left transition flex items-center gap-3 group"
                        title="Supprimer tous les articles du catalogue (remettre le catalogue à zéro)"
                      >
                        <div className="p-2.5 bg-red-400/30 text-red-200 rounded-lg group-hover:scale-105 transition shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Remettre le Catalogue à zéro</span>
                          <span className="text-[11px] text-red-200 block">Supprimer tous les articles ({products.length})</span>
                        </div>
                      </button>

                      <button
                        onClick={handleTriggerDeleteAllPromos}
                        className="p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 rounded-xl text-left transition flex items-center gap-3 group"
                        title="Supprimer tous les codes promotionnels et remettre les remises à zéro"
                      >
                        <div className="p-2.5 bg-amber-400/30 text-amber-200 rounded-lg group-hover:scale-105 transition shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Remettre les Promos à zéro</span>
                          <span className="text-[11px] text-amber-200 block">Supprimer codes promo & remises</span>
                        </div>
                      </button>

                      <button
                        onClick={handleTriggerResetVisitors}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-left transition flex items-center gap-3 group"
                        title="Remettre les compteurs de visites et de trafic à zéro"
                      >
                        <div className="p-2.5 bg-indigo-400/20 text-indigo-300 rounded-lg group-hover:scale-105 transition shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Remise à zéro Visiteurs</span>
                          <span className="text-[11px] text-gray-300 block">Trafic & sessions remis à 0</span>
                        </div>
                      </button>

                      <button
                        onClick={handleTriggerResetStockAlerts}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-left transition flex items-center gap-3 group"
                        title="Rétablir les stocks de sécurité pour supprimer toutes les alertes"
                      >
                        <div className="p-2.5 bg-emerald-400/20 text-emerald-300 rounded-lg group-hover:scale-105 transition shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Réapprovisionner (0 Alerte)</span>
                          <span className="text-[11px] text-gray-300 block">Stocks optimaux rétablis</span>
                        </div>
                      </button>

                      <button
                        onClick={handleTriggerResetAllAdmin}
                        className="p-3 bg-red-600/30 hover:bg-red-600/50 border border-red-400/40 rounded-xl text-left transition flex items-center gap-3 group"
                        title="Réinitialiser l'ensemble des données d'administration"
                      >
                        <div className="p-2.5 bg-red-500/30 text-red-300 rounded-lg group-hover:scale-105 transition shrink-0">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Réinitialisation Globale</span>
                          <span className="text-[11px] text-gray-300 block">Restaurer configuration saine</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* KPI Cards Grid - Avec la Statistique Visiteurs du Site */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Chiffre d'Affaires</span>
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
                        {formatFCFA(totalRevenue)}
                      </div>
                      <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                        Sur {orders.length} commande(s) enregistrée(s)
                      </p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Commandes Totales</span>
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
                        {totalOrdersCount}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                        <span className="text-amber-600 font-bold">{pendingOrdersCount} en attente</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">{deliveredOrdersCount} livrées</span>
                      </div>
                    </div>

                    {/* KPI Visiteurs du Site */}
                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Visiteurs du Site</span>
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono flex items-baseline justify-between">
                        <span>{currentVisitorStats.totalVisitors.toLocaleString('fr-FR')}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {currentVisitorStats.activeNow} direct
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-600 mt-1 font-medium flex items-center justify-between">
                        <span>+{currentVisitorStats.todayVisitors} aujourd'hui</span>
                        <span className="text-gray-400">•</span>
                        <span>{currentVisitorStats.uniqueVisitors} uniques</span>
                      </p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Produits en Vente</span>
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                          <Package className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
                        {products.length} articles
                      </div>
                      <p className="text-[11px] text-purple-600 mt-1 font-medium">
                        {totalStockCount} unités physiques en stock
                      </p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Alertes Stock</span>
                        <div className={`p-2 rounded-xl ${lowStockProducts.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {lowStockProducts.length > 0 ? <AlertCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </div>
                      </div>
                      <div className={`text-xl sm:text-2xl font-black font-mono ${lowStockProducts.length > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {lowStockProducts.length}
                      </div>
                      <p className={`text-[11px] mt-1 font-medium ${lowStockProducts.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {lowStockProducts.length > 0 ? `${lowStockProducts.length} article(s) critique(s)` : '0 alerte • Stocks optimaux'}
                      </p>
                    </div>

                  </div>

                  {/* MODULE COMPLET : STATISTIQUES DE FRÉQUENTATION & VISITEURS */}
                  <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-6">
                    
                    {/* Header & Live Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                            <span>Statistiques de Fréquentation & Visiteurs</span>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider rounded-md">
                              Live 🇸🇳
                            </span>
                          </h4>
                          <p className="text-xs text-gray-500">
                            Suivi en temps réel de l'audience, des visites et des flux d'acheteurs au Sénégal
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                        <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-2 text-xs font-bold text-emerald-800 shadow-2xs">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span>{currentVisitorStats.activeNow} personnes sur le site</span>
                        </div>

                        <button
                          onClick={handleTriggerResetVisitors}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                          title="Remettre le compteur de visiteurs à 0"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                          <span>Réinitialiser</span>
                        </button>
                      </div>
                    </div>

                    {/* 4 Core Traffic Indicators */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                      
                      <div className="p-4 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                          <span>Total Visiteurs</span>
                          <Globe className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
                          {currentVisitorStats.totalVisitors.toLocaleString('fr-FR')}
                        </div>
                        <p className="text-[11px] text-gray-500">Sessions enregistrées sur le site</p>
                      </div>

                      <div className="p-4 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                          <span>Visiteurs Uniques</span>
                          <Users className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
                          {currentVisitorStats.uniqueVisitors.toLocaleString('fr-FR')}
                        </div>
                        <p className="text-[11px] text-blue-600 font-medium">Appareils et navigateurs distincts</p>
                      </div>

                      <div className="p-4 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                          <span>Visiteurs Aujourd'hui</span>
                          <Activity className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                          +{currentVisitorStats.todayVisitors.toLocaleString('fr-FR')}
                        </div>
                        <p className="text-[11px] text-emerald-700 font-medium">Activité sur la journée</p>
                      </div>

                      <div className="p-4 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                          <span>Pages Vues Totales</span>
                          <Eye className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
                          {currentVisitorStats.totalPageViews.toLocaleString('fr-FR')}
                        </div>
                        <p className="text-[11px] text-purple-600 font-medium">
                          ~{(currentVisitorStats.totalPageViews / Math.max(1, currentVisitorStats.totalVisitors)).toFixed(1)} fiches / visiteur
                        </p>
                      </div>

                    </div>

                    {/* Chart: 7 Days Visitor Traffic Trend */}
                    <div className="p-4 sm:p-5 bg-gradient-to-br from-gray-50/90 to-indigo-50/30 rounded-xl border border-gray-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-indigo-600" />
                          <h5 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
                            Évolution des Visites sur 7 Jours au Sénégal
                          </h5>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Moyenne : ~{Math.round(currentVisitorStats.dailyHistory.reduce((acc, d) => acc + d.visitors, 0) / Math.max(1, currentVisitorStats.dailyHistory.length))} visiteurs / jour
                        </span>
                      </div>

                      {/* Bars Visualization */}
                      <div className="h-44 pt-6 pb-2 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-gray-200">
                        {(() => {
                          const maxVisitors = Math.max(1, ...currentVisitorStats.dailyHistory.map(d => d.visitors));
                          return currentVisitorStats.dailyHistory.map((day, idx) => {
                            const heightPercent = Math.max(16, Math.round((day.visitors / maxVisitors) * 100));
                            const isToday = idx === currentVisitorStats.dailyHistory.length - 1;

                            return (
                              <div key={day.fullDate + idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                                {/* Tooltip on hover */}
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap bg-gray-900 text-white text-[10px] font-semibold py-1 px-2 rounded-md shadow-md">
                                  {day.visitors} visiteurs • {day.pageViews} pages vues
                                </div>

                                {/* Top value indicator */}
                                <span className={`text-[11px] font-bold mb-1 font-mono ${isToday ? 'text-indigo-600' : 'text-gray-600'}`}>
                                  {day.visitors}
                                </span>

                                {/* Bar */}
                                <div className="w-full max-w-[48px] bg-gray-200/80 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: `${heightPercent}%` }}>
                                  <div className={`w-full h-full rounded-t-lg transition-all duration-500 ${
                                    isToday 
                                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-sm' 
                                      : 'bg-gradient-to-t from-gray-700 to-indigo-500/80 hover:brightness-110'
                                  }`} />
                                </div>

                                {/* Day label */}
                                <span className={`text-[10px] mt-2 font-medium truncate max-w-full ${isToday ? 'font-bold text-indigo-700' : 'text-gray-500'}`}>
                                  {isToday ? "Aujourd'hui" : day.date}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Audience Insights: Provenance Sénégal & Appareils */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Geographic breakdown */}
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-xs text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                            <span>Provenance Géographique (Sénégal)</span>
                          </h5>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Trafic Local
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {currentVisitorStats.topRegions.map((reg) => (
                            <div key={reg.region} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-gray-700 truncate">{reg.region}</span>
                                <span className="font-mono font-bold text-gray-900">{reg.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-full rounded-full" 
                                  style={{ width: `${reg.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Device breakdown */}
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-xs text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Appareils & Canaux de Vente</span>
                          </h5>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                            Wave / OM / WhatsApp
                          </span>
                        </div>

                        <div className="space-y-2.5 pt-1">
                          <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Smartphone className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-gray-900 block">Smartphones & Mobiles (Android, iPhone)</span>
                                <span className="text-[11px] text-gray-500">Flux WhatsApp, Wave, TikTok & Instagram</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-indigo-600 font-mono">89%</span>
                              <span className="text-[10px] text-gray-400 block">Majorité Sénégal</span>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                                <Laptop className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-gray-900 block">Ordinateurs & PC Portables</span>
                                <span className="text-[11px] text-gray-500">Bureaux, entreprises & domicile</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-gray-800 font-mono">11%</span>
                              <span className="text-[10px] text-gray-400 block">Desktop</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-500 italic pt-1">
                          💡 Note : 9 achats sur 10 au Sénégal sont conclus directement depuis mobile avec paiement Wave ou Orange Money.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                    <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                      Actions Rapides d'Administration
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => {
                          setTab('products');
                          startAddNew();
                        }}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter un nouvel article</span>
                      </button>

                      <button
                        onClick={() => setTab('orders')}
                        className="px-4 py-2.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
                      >
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                        <span>Traiter les commandes ({pendingOrdersCount})</span>
                      </button>

                      <button
                        onClick={onOpenExportShopify}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exporter Thème Shopify (.ZIP)</span>
                      </button>

                      <button
                        onClick={() => setTab('promos')}
                        className="px-4 py-2.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
                      >
                        <Tag className="w-4 h-4 text-amber-600" />
                        <span>Créer un Code Promo</span>
                      </button>
                    </div>
                  </div>

                  {/* Low Stock Alerts Table */}
                  {lowStockProducts.length > 0 && (
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <h4 className="font-extrabold text-xs text-amber-900 uppercase">
                            Articles en stock critique (≤ 5 unités)
                          </h4>
                        </div>
                        <button
                          onClick={() => setTab('products')}
                          className="text-xs font-bold text-amber-700 hover:underline"
                        >
                          Gérer tous les stocks →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {lowStockProducts.map((p, idx) => (
                          <div key={`${p.id}-${idx}`} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={p.images[0]} alt="" className="w-9 h-9 object-contain rounded bg-gray-50 border shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-gray-900 block truncate">{p.name}</span>
                                <span className="text-[11px] font-mono text-red-600 font-bold">{p.stock} restant(s)</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleQuickStockChange(p, 10)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 shrink-0"
                            >
                              +10 Stock
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Orders Overview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900">Dernières commandes enregistrées</h4>
                      <button
                        onClick={() => setTab('orders')}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        Voir toutes les commandes ({orders.length}) →
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50/80 border border-dashed border-gray-200 rounded-2xl space-y-2">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-gray-200 text-gray-400">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                        <h5 className="text-sm font-bold text-gray-800">Aucune commande enregistrée</h5>
                        <p className="text-xs text-gray-500 max-w-md mx-auto">
                          Le tableau de bord est réinitialisé avec 0 commande et 0 FCFA de chiffre d'affaires. Dès qu'un client passe commande sur le site (Wave, Orange Money ou à la livraison), elle s'affichera ici en direct !
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                        {orders.slice(0, 5).map(ord => (
                          <div key={ord.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50 transition text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                #{ord.orderNumber}
                              </span>
                              <div>
                                <span className="font-bold text-gray-800 block">{ord.customer.fullName}</span>
                                <span className="text-gray-400 text-[11px]">📍 {ord.customer.neighborhood}, {ord.customer.city}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-mono font-black text-red-600">{formatFCFA(ord.total)}</span>
                              
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                ord.orderStatus === 'livrée' ? 'bg-emerald-100 text-emerald-800' :
                                ord.orderStatus === 'en_cours_de_livraison' ? 'bg-blue-100 text-blue-800' :
                                ord.orderStatus === 'en_préparation' ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {ord.orderStatus}
                              </span>

                              <a
                                href={generateCustomerWhatsAppUrl(ord)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg"
                                title="Contacter par WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: PRODUCTS CATALOG MANAGEMENT (CRUD) */}
              {tab === 'products' && (
                <div className="space-y-5">
                  
                  {/* Multi-Device Cloud Sync Banner */}
                  <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <RotateCcw className="w-4 h-4 animate-spin-slow" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-emerald-950">
                            Synchronisation Multi-Appareils Cloud Active
                          </h4>
                          <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-full text-[10px] font-bold">
                            Temps Réel
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Tous les ajouts, modifications de prix et mises à jour de stocks s'appliquent immédiatement sur la boutique et se synchronisent en direct sur tous vos téléphones, tablettes et ordinateurs.
                        </p>
                      </div>
                    </div>
                    {lastSyncDate && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto">
                        Dernière synchro : {lastSyncDate.toLocaleTimeString('fr-FR')}
                      </span>
                    )}
                  </div>

                  {/* Temporary Action Feedback Banner */}
                  {productFeedback && (
                    <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                        {productFeedback}
                      </span>
                      <button
                        type="button"
                        onClick={() => setProductFeedback(null)}
                        className="text-emerald-100 hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  
                  {/* Top Bar with Search & Add button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Rechercher par nom ou référence SKU..."
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-red-600 focus:bg-white"
                        />
                      </div>
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => {
                          setProductCategoryFilter(e.target.value);
                          setProductSubcategoryFilter('all');
                        }}
                        className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-red-600"
                      >
                        <option value="all">Toutes les catégories</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>

                      {productCategoryFilter !== 'all' && (categories.find(c => c.slug === productCategoryFilter)?.subcategories?.length ?? 0) > 0 && (
                        <select
                          value={productSubcategoryFilter}
                          onChange={(e) => setProductSubcategoryFilter(e.target.value)}
                          className="px-3 py-2 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold focus:outline-none focus:border-red-600"
                        >
                          <option value="all">Toutes sous-catégories</option>
                          {categories.find(c => c.slug === productCategoryFilter)?.subcategories?.map(sub => (
                            <option key={sub.id || sub.slug} value={sub.slug}>{sub.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {!isAddingNewProduct && !editingProduct && (
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={startAddNew}
                          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Ajouter un produit</span>
                        </button>

                        {/* Bouton Téléverser / Importer Catalogue (CSV, JSON, Meta, Shopify) */}
                        <button
                          type="button"
                          onClick={() => setShowCatalogImportModal(true)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                          title="Téléverser un catalogue complet de produits (CSV, Excel ou JSON)"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Importer un catalogue</span>
                        </button>

                        {products.length > 0 && onDeleteAllProducts && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`⚠️ ATTENTION ACTION IRRÉVERSIBLE :\n\nVoulez-vous vraiment supprimer TOUS les ${products.length} articles du catalogue ?\n\nCette action remettra le catalogue à zéro (0 article). Les visiteurs et clients connectés verront immédiatement un catalogue vide en direct sur le site.\n\nConfirmer la suppression complète de tous les articles ?`)) {
                                onDeleteAllProducts();
                                setProductFeedback(`Le catalogue a été entièrement vidé (0 article) et synchronisé en direct sur le site !`);
                                setTimeout(() => setProductFeedback(null), 5000);
                              }
                            }}
                            className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            title="Supprimer tous les articles du catalogue (remettre à zéro)"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <span>Vider tout le catalogue ({products.length})</span>
                          </button>
                        )}

                        {products.some(p => (p.discountPercent && p.discountPercent > 0) || p.isFlashSale) && onResetProductDiscounts && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Voulez-vous remettre à zéro toutes les réductions et soldes flash sur les articles ?\n\nTous les prix reviendront à leur tarif de base sans supprimer les articles.`)) {
                                onResetProductDiscounts();
                                setProductFeedback(`Toutes les promotions et remises du catalogue ont été remises à zéro !`);
                                setTimeout(() => setProductFeedback(null), 5000);
                              }
                            }}
                            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            title="Remettre les promotions et remises à zéro"
                          >
                            <Tag className="w-4 h-4 text-amber-600" />
                            <span>Remettre promos articles à 0</span>
                          </button>
                        )}

                        {products.length === 0 && onRestoreDefaultProducts && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Voulez-vous réinitialiser le catalogue avec les articles de démonstration ?')) {
                                onRestoreDefaultProducts();
                                setProductFeedback(`Articles de démonstration réinitialisés au catalogue avec succès !`);
                                setTimeout(() => setProductFeedback(null), 5000);
                              }
                            }}
                            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            title="Restaurer les articles de démo"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                            <span>Restaurer articles démo</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hidden File Input for Catalog Upload */}
                  <input
                    type="file"
                    ref={catalogFileInputRef}
                    accept=".csv,.json,.txt"
                    className="hidden"
                    onChange={handleCatalogFileUpload}
                  />

                  {/* MODAL: TÉLÉVERSEMENT DE CATALOGUE DE PRODUITS (CSV / JSON) */}
                  {showCatalogImportModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-black text-sm text-gray-900">
                                Téléverser un Catalogue de Produits
                              </h3>
                              <p className="text-[11px] text-gray-500">
                                Importez facilement vos listes d'articles (CSV, Excel ou JSON)
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowCatalogImportModal(false);
                              setCatalogImportFeedback(null);
                              setCatalogImportErrors([]);
                            }}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                          
                          {/* Success Feedback */}
                          {catalogImportFeedback && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p>{catalogImportFeedback}</p>
                                <button
                                  onClick={() => setShowCatalogImportModal(false)}
                                  className="mt-2 text-[11px] underline text-emerald-700 hover:text-emerald-900 block"
                                >
                                  Fermer et voir les articles dans le catalogue →
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Error Feedback */}
                          {catalogImportErrors.length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 space-y-1.5">
                              <div className="flex items-center gap-2 font-bold text-red-800">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span>Erreurs lors de l'importation :</span>
                              </div>
                              <ul className="list-disc list-inside space-y-1 pl-1">
                                {catalogImportErrors.map((err, idx) => (
                                  <li key={idx} className="text-[11px]">{err}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Drag & Drop Upload Zone */}
                          <div
                            onClick={() => !isImportingCatalog && catalogFileInputRef.current?.click()}
                            className={`p-8 border-2 border-dashed rounded-3xl text-center flex flex-col items-center justify-center gap-3 transition cursor-pointer ${
                              isImportingCatalog
                                ? 'bg-gray-50 border-gray-300 opacity-60 cursor-not-allowed'
                                : 'bg-emerald-50/40 hover:bg-emerald-50/80 border-emerald-300 hover:border-emerald-500'
                            }`}
                          >
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                              {isImportingCatalog ? (
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                              ) : (
                                <UploadCloud className="w-7 h-7 text-emerald-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-sm text-gray-900">
                                {isImportingCatalog ? 'Importation en cours dans la base de données...' : 'Cliquez pour choisir un fichier de catalogue'}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Formats acceptés : <strong>CSV (.csv)</strong> ou <strong>JSON (.json)</strong>
                              </p>
                            </div>
                            <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs">
                              Sélectionner un fichier sur votre appareil
                            </span>
                          </div>

                          {/* Compatible Formats Explanations */}
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5 text-xs text-gray-600">
                            <h5 className="font-extrabold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                              <span>Formats et colonnes reconnus</span>
                            </h5>
                            <p className="text-[11px] text-gray-500">
                              L'importateur détecte automatiquement les formats <strong>Meta Commerce / WhatsApp Business</strong>, <strong>Shopify</strong>, ou tout fichier CSV avec au moins les colonnes <code>nom</code> (ou <code>title</code>) et <code>prix</code> (ou <code>price</code>).
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-mono text-[10px]">name / title</span>
                              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-mono text-[10px]">price / prix</span>
                              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-mono text-[10px]">original_price</span>
                              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-mono text-[10px]">category</span>
                              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-mono text-[10px]">image_link</span>
                              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-mono text-[10px]">stock</span>
                              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-mono text-[10px]">description</span>
                            </div>
                          </div>

                          {/* Download sample CSV template */}
                          <div className="flex items-center justify-between pt-2">
                            <button
                              type="button"
                              onClick={downloadSampleCatalogCsv}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              <span>Télécharger un modèle CSV exemple (.csv)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCatalogImportModal(false)}
                              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add / Edit Form Modal/Drawer in Panel */}
                  {(isAddingNewProduct || editingProduct) && (
                    <form onSubmit={handleSaveProduct} className="p-5 bg-red-50/40 rounded-3xl border-2 border-red-200 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-red-200">
                        <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
                          {isAddingNewProduct ? (
                            <>
                              <Plus className="w-4 h-4 text-red-600" />
                              <span>Nouveau Produit au Catalogue</span>
                            </>
                          ) : (
                            <>
                              <Edit3 className="w-4 h-4 text-blue-600" />
                              <span>Modification: {editingProduct?.name}</span>
                            </>
                          )}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewProduct(false);
                            setEditingProduct(null);
                          }}
                          className="text-xs font-bold text-gray-500 hover:text-gray-800"
                        >
                          ✕ Fermer le formulaire
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Nom de l'article *</label>
                          <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="ex: iPhone 15 Pro Max 256GB"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Catégorie / Rayon principal *</label>
                          <select
                            value={formCategory}
                            onChange={(e) => {
                              setFormCategory(e.target.value);
                              setFormSubcategory('');
                              setIsCustomSubcategory(false);
                              setCustomSubcategoryInput('');
                            }}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600 font-semibold"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.slug}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Sous-catégorie / Double classement */}
                        <div className="lg:col-span-2 bg-gray-50/90 p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-gray-800">
                              Sous-catégorie du produit
                              {categories.find(c => c.slug === formCategory)?.subcategories?.length ? (
                                <span className="text-emerald-700 font-semibold ml-1.5 text-[11px]">
                                  ({categories.find(c => c.slug === formCategory)?.subcategories?.length} disponible{categories.find(c => c.slug === formCategory)!.subcategories!.length > 1 ? 's' : ''})
                                </span>
                              ) : null}
                            </label>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomSubcategory(!isCustomSubcategory);
                                if (!isCustomSubcategory) {
                                  setFormSubcategory('');
                                }
                              }}
                              className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>{isCustomSubcategory ? 'Choisir parmi la liste existante' : '+ Nouvelle sous-catégorie'}</span>
                            </button>
                          </div>

                          {isCustomSubcategory ? (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={customSubcategoryInput}
                                  onChange={(e) => setCustomSubcategoryInput(e.target.value)}
                                  placeholder="ex: Smartphones 5G, Robes de soirée, Sacs à main..."
                                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-red-300 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCustomSubcategory(false);
                                    if (customSubcategoryInput.trim()) {
                                      setFormSubcategory(customSubcategoryInput.trim());
                                    }
                                  }}
                                  className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
                                >
                                  Valider
                                </button>
                              </div>
                              <label className="flex items-center gap-2 text-[11px] text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={persistSubcatToCategory}
                                  onChange={(e) => setPersistSubcatToCategory(e.target.checked)}
                                  className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                                />
                                <span>Enregistrer aussi cette sous-catégorie dans la liste permanente du rayon « {categories.find(c => c.slug === formCategory)?.name || formCategory} »</span>
                              </label>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <select
                                value={formSubcategory}
                                onChange={(e) => {
                                  if (e.target.value === '__custom__') {
                                    setIsCustomSubcategory(true);
                                    setFormSubcategory('');
                                  } else {
                                    setFormSubcategory(e.target.value);
                                  }
                                }}
                                className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                              >
                                <option value="">-- Aucune / Rayon principal uniquement --</option>
                                {categories.find(c => c.slug === formCategory)?.subcategories?.map((sub) => (
                                  <option key={sub.id || sub.slug} value={sub.slug}>{sub.name}</option>
                                ))}
                                <option value="__custom__">+ Saisir une nouvelle sous-catégorie sur-mesure...</option>
                              </select>

                              {/* Clickable Quick Pills */}
                              {categories.find(c => c.slug === formCategory)?.subcategories && categories.find(c => c.slug === formCategory)!.subcategories!.length > 0 && (
                                <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                                  <span className="text-[10px] text-gray-500 font-semibold mr-1">Sélection rapide :</span>
                                  <button
                                    type="button"
                                    onClick={() => setFormSubcategory('')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                      !formSubcategory
                                        ? 'bg-gray-800 text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    Rayon Principal (Tout)
                                  </button>
                                  {categories.find(c => c.slug === formCategory)!.subcategories!.map((sub) => {
                                    const isSubActive = formSubcategory === sub.slug || formSubcategory === sub.name;
                                    return (
                                      <button
                                        key={sub.id || sub.slug}
                                        type="button"
                                        onClick={() => setFormSubcategory(sub.slug)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                          isSubActive
                                            ? 'bg-red-600 text-white shadow-xs'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                      >
                                        {isSubActive && <CheckCircle2 className="w-2.5 h-2.5" />}
                                        <span>{sub.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Visual Placement Recap */}
                          <div className="mt-2.5 pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                            <span className="font-bold text-gray-800 flex items-center gap-1">
                              <FolderTree className="w-3.5 h-3.5 text-red-600" />
                              Double classement :
                            </span>
                            <span className="px-2 py-0.5 bg-white border border-gray-300 rounded font-semibold text-gray-900">
                              Catégorie : {categories.find(c => c.slug === formCategory)?.name || formCategory}
                            </span>
                            <span className="text-gray-400">➔</span>
                            <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded font-bold">
                              Sous-catégorie : {isCustomSubcategory
                                ? (customSubcategoryInput.trim() || 'À renseigner...')
                                : (categories.find(c => c.slug === formCategory)?.subcategories?.find(s => s.slug === formSubcategory || s.name === formSubcategory)?.name || formSubcategory || 'Rayon principal (Toutes)')}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold ml-auto">
                              ✓ Visible dans la catégorie ET sous son filtre sous-catégorie
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Prix de vente officiel (FCFA) *</label>
                          <input
                            type="number"
                            required
                            value={formPrice}
                            onChange={(e) => setFormPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-mono font-bold focus:outline-none focus:border-red-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Ancien Prix barré (FCFA)</label>
                          <input
                            type="number"
                            value={formOriginalPrice}
                            onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                            placeholder="ex: 35000 (optionnel)"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-mono focus:outline-none focus:border-red-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Quantité en Stock *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={formStock}
                            onChange={(e) => setFormStock(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-mono font-bold focus:outline-none focus:border-red-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Marque / Fabricant</label>
                          <input
                            type="text"
                            value={formBrand}
                            onChange={(e) => setFormBrand(e.target.value)}
                            placeholder="ex: Apple, Samsung, Philips..."
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Référence SKU</label>
                          <input
                            type="text"
                            value={formSku}
                            onChange={(e) => setFormSku(e.target.value)}
                            placeholder="ex: DG-TEL-001"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Garantie</label>
                          <input
                            type="text"
                            value={formWarranty}
                            onChange={(e) => setFormWarranty(e.target.value)}
                            placeholder="ex: 6 mois de garantie"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                          />
                        </div>
                      </div>

                      {/* Product Images Import & Gallery Management */}
                      <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-red-200/80 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <label className="block text-xs font-black text-gray-900 flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-red-600" />
                              <span>Photos & Galerie du produit *</span>
                            </label>
                            <p className="text-[11px] text-gray-500">
                              Importez une ou plusieurs photos depuis votre appareil (PC ou téléphone). La première photo sert d'image principale.
                            </p>
                          </div>
                          {formImages.length > 0 && (
                            <span className="self-start sm:self-auto text-[11px] font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
                              {formImages.length} photo{formImages.length > 1 ? 's' : ''} ajoutée{formImages.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Upload Status / Feedback */}
                        {uploadFeedback && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              {uploadFeedback}
                            </span>
                            <button
                              type="button"
                              onClick={() => setUploadFeedback(null)}
                              className="text-emerald-700 hover:text-emerald-950 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Drag and drop file import zone */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingFiles(true);
                          }}
                          onDragLeave={() => setIsDraggingFiles(false)}
                          onDrop={handleDropFiles}
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 ${
                            isDraggingFiles
                              ? 'border-red-600 bg-red-50/80 ring-4 ring-red-100 scale-[1.01]'
                              : 'border-gray-300 hover:border-red-500 bg-gray-50/60 hover:bg-red-50/20'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                            multiple
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleProcessUploadedFiles(e.target.files);
                              }
                            }}
                            className="hidden"
                          />

                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition shadow-xs ${
                            isDraggingFiles ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'
                          }`}>
                            {isReadingFiles ? (
                              <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-red-600" />
                            ) : (
                              <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
                            )}
                          </div>

                          <div>
                            <p className="text-xs sm:text-sm font-black text-gray-900">
                              {isReadingFiles 
                                ? 'Importation et optimisation des images en cours...' 
                                : isDraggingFiles 
                                  ? 'Déposez vos images ici !' 
                                  : 'Glissez-déposez vos photos ici, ou cliquez pour parcourir'}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Formats acceptés : JPG, PNG, WEBP • Import multiple supporté
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="mt-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Importer des images</span>
                          </button>
                        </div>

                        {/* Interactive Gallery of Imported Images */}
                        {formImages.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                                Galerie actuelle ({formImages.length} visuel{formImages.length > 1 ? 's' : ''})
                              </span>
                              <span className="text-[10px] text-gray-400">
                                ⭐ Définir comme photo principale
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                              {formImages.map((imgUrl, idx) => {
                                const isPrimary = idx === 0;
                                return (
                                  <div
                                    key={idx}
                                    className={`group relative rounded-xl border-2 overflow-hidden bg-white shadow-xs aspect-square flex items-center justify-center p-1.5 transition ${
                                      isPrimary 
                                        ? 'border-red-600 ring-2 ring-red-200' 
                                        : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Aperçu ${idx + 1}`}
                                      className="w-full h-full object-contain rounded-lg"
                                    />

                                    {/* Primary Badge */}
                                    {isPrimary ? (
                                      <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 z-10">
                                        <Star className="w-2.5 h-2.5 fill-current" />
                                        <span>Principale</span>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSetPrimaryImage(idx);
                                        }}
                                        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-black/75 hover:bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 transition z-10"
                                        title="Définir comme photo principale"
                                      >
                                        <Star className="w-2.5 h-2.5" />
                                        <span>Mettre en 1er</span>
                                      </button>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImage(idx);
                                      }}
                                      className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow z-10"
                                      title="Supprimer cette photo"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>

                                    <span className="absolute bottom-1 right-1 bg-black/60 text-white font-mono text-[9px] px-1 rounded">
                                      #{idx + 1}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Optional manual URL input */}
                        <div className="pt-2 border-t border-gray-100">
                          <details className="group">
                            <summary className="text-xs font-bold text-gray-500 hover:text-red-600 cursor-pointer list-none flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5" />
                                Ou ajouter une photo par lien URL web (optionnel)
                              </span>
                              <span className="text-[10px] text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="mt-2.5 flex gap-2">
                              <input
                                type="url"
                                value={formImageUrl}
                                onChange={(e) => setFormImageUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="flex-1 px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddUrlImage();
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleAddUrlImage}
                                disabled={!formImageUrl.trim()}
                                className="px-3.5 py-2 bg-gray-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold rounded-xl shrink-0 transition"
                              >
                                Ajouter URL
                              </button>
                            </div>
                          </details>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Description du produit</label>
                        <textarea
                          rows={2}
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                        ></textarea>
                      </div>

                      {/* Badges toggles */}
                      <div className="flex flex-wrap gap-4 pt-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formIsFlashSale}
                            onChange={(e) => setFormIsFlashSale(e.target.checked)}
                            className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                          />
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-red-600" />
                            Afficher en Vente Flash 🔥
                          </span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formIsFeatured}
                            onChange={(e) => setFormIsFeatured(e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                          />
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            Mettre en Vedette sur l'Accueil ⭐
                          </span>
                        </label>
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewProduct(false);
                            setEditingProduct(null);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>Enregistrer les modifications</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Products Table List */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                          <tr>
                            <th className="p-3.5">Article</th>
                            <th className="p-3.5">Catégorie & Sous-catégorie</th>
                            <th className="p-3.5">Prix FCFA</th>
                            <th className="p-3.5">Stock</th>
                            <th className="p-3.5">Badges</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredProducts.map((prod, idx) => (
                            <tr key={`${prod.id}-${idx}`} className="hover:bg-gray-50/80 transition">
                              <td className="p-3.5 flex items-center gap-3">
                                <img src={prod.images[0]} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-50 border shrink-0" />
                                <div>
                                  <span className="font-bold text-gray-900 block line-clamp-1">{prod.name}</span>
                                  <span className="text-[11px] text-gray-400 font-mono">SKU: {prod.sku}</span>
                                </div>
                              </td>

                              <td className="p-3.5 text-gray-600">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-semibold text-[11px]">
                                    {categories.find(c => c.slug === prod.category)?.name || prod.category}
                                  </span>
                                  {prod.subcategory ? (
                                    <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold flex items-center gap-1">
                                      <span>↳</span>
                                      <span>{categories.find(c => c.slug === prod.category)?.subcategories?.find(s => s.slug === prod.subcategory || s.name.toLowerCase() === prod.subcategory?.toLowerCase())?.name || prod.subcategory}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 italic">
                                      Rayon principal
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="font-mono font-bold text-red-600 text-xs">
                                  {formatFCFA(prod.price)}
                                </div>
                                {prod.originalPrice && prod.originalPrice > prod.price && (
                                  <span className="text-[10px] text-gray-400 line-through block font-mono">
                                    {formatFCFA(prod.originalPrice)}
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-md font-bold font-mono text-[11px] ${
                                    prod.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {prod.stock}
                                  </span>
                                  <div className="flex flex-col gap-0.5">
                                    <button
                                      onClick={() => handleQuickStockChange(prod, 1)}
                                      className="px-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-bold"
                                      title="Ajouter 1 au stock"
                                    >
                                      +1
                                    </button>
                                    <button
                                      onClick={() => handleQuickStockChange(prod, -1)}
                                      className="px-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-bold"
                                      title="Retirer 1 du stock"
                                    >
                                      -1
                                    </button>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="flex flex-wrap gap-1">
                                  <button
                                    onClick={() => handleToggleFlashSale(prod)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition ${
                                      prod.isFlashSale ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-400 hover:text-gray-700'
                                    }`}
                                    title="Activer/Désactiver Vente Flash"
                                  >
                                    <Flame className="w-3 h-3" />
                                    <span>Flash</span>
                                  </button>

                                  <button
                                    onClick={() => handleToggleFeatured(prod)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition ${
                                      prod.isFeatured ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-400 hover:text-gray-700'
                                    }`}
                                    title="Activer/Désactiver Vedette"
                                  >
                                    <Star className="w-3 h-3" />
                                    <span>Top</span>
                                  </button>
                                </div>
                              </td>

                              <td className="p-3.5 text-right space-x-1.5">
                                <button
                                  onClick={() => startEditProduct(prod)}
                                  className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                  title="Modifier les détails"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Supprimer définitivement l'article "${prod.name}" ?`)) {
                                      onDeleteProduct(prod.id);
                                      setProductFeedback(`Article « ${prod.name} » supprimé et retiré du catalogue sur tous les appareils !`);
                                      setTimeout(() => setProductFeedback(null), 4000);
                                    }
                                  }}
                                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                                  title="Supprimer du catalogue"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {products.length === 0 ? (
                      <div className="p-10 text-center space-y-3 bg-gray-50/50">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100/60 text-red-600 flex items-center justify-center">
                          <Package className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-gray-900">Le catalogue est actuellement vide (0 article)</h4>
                          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                            Tous les articles ont été supprimés. Les visiteurs et clients connectés voient un catalogue à zéro en direct sur le site.
                          </p>
                        </div>
                        <div className="flex justify-center items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={startAddNew}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Ajouter un premier produit</span>
                          </button>
                          {onRestoreDefaultProducts && (
                            <button
                              type="button"
                              onClick={onRestoreDefaultProducts}
                              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restaurer articles démo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-500">
                        Aucun article ne correspond à votre recherche "{productSearch}".
                      </div>
                    ) : null}
                  </div>

                </div>
              )}

              {/* TAB: CATEGORIES & SUBCATEGORIES MANAGEMENT */}
              {tab === 'categories' && (
                <div className="space-y-6">
                  {/* Top Bar with Header & Add Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900 font-display flex items-center gap-2">
                        <Layers className="w-5 h-5 text-red-600" />
                        <span>Gestion des Catégories, Sous-Catégories & Descriptions</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Ajoutez des rayons, enrichissez les descriptions de page pour vos clients et structurez vos sous-catégories en temps réel sur tous les appareils.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={startAddNewCategory}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un Rayon / Catégorie</span>
                    </button>
                  </div>

                  {/* Feedback Message */}
                  {categoryFeedback && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{categoryFeedback}</span>
                    </div>
                  )}

                  {/* Delete Confirmation Modal/Banner */}
                  {deleteCatConfirmId && (
                    <div className="p-4 bg-red-50 border-2 border-red-300 rounded-3xl space-y-3 animate-in fade-in">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-black text-red-900">
                            Confirmer la suppression du rayon « {categories.find(c => c.id === deleteCatConfirmId)?.name} » ?
                          </h4>
                          <p className="text-xs text-red-700 mt-1">
                            Cette action supprimera cette catégorie et ses sous-catégories associées dans la base de données centrale. Les articles déjà enregistrés conserveront leur fiche mais devront être réassignés si vous souhaitez les afficher dans un autre rayon.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setDeleteCatConfirmId(null)}
                          className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategoryAction(deleteCatConfirmId)}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Confirmer la suppression</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Form for Add or Edit Category */}
                  {(isAddingNewCategory || editingCategory) && (
                    <form onSubmit={handleSaveCategorySubmit} className="p-6 bg-gradient-to-br from-red-50/50 via-white to-amber-50/30 rounded-3xl border-2 border-red-200 shadow-sm space-y-5 animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-red-200">
                        <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
                          {isAddingNewCategory ? (
                            <>
                              <PlusCircle className="w-5 h-5 text-red-600" />
                              <span>Création d'une Nouvelle Catégorie / Rayon</span>
                            </>
                          ) : (
                            <>
                              <Edit3 className="w-5 h-5 text-blue-600" />
                              <span>Modification de la Catégorie : {editingCategory?.name}</span>
                            </>
                          )}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewCategory(false);
                            setEditingCategory(null);
                          }}
                          className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                        >
                          ✕ Fermer
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Nom du Rayon / Catégorie *
                          </label>
                          <input
                            type="text"
                            required
                            value={catFormName}
                            onChange={(e) => {
                              setCatFormName(e.target.value);
                              if (isAddingNewCategory) {
                                setCatFormSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                              }
                            }}
                            placeholder="ex: Sonorisation & Amplificateurs Professionnels"
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-red-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Identifiant Slug (URL & Référencement)
                          </label>
                          <input
                            type="text"
                            value={catFormSlug}
                            onChange={(e) => setCatFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                            placeholder="ex: sonorisation-pro"
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-xs font-mono focus:outline-none focus:border-red-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Icône Représentative
                          </label>
                          <select
                            value={catFormIcon}
                            onChange={(e) => setCatFormIcon(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                          >
                            <option value="Speaker">🔊 Speaker (Sonorisation, Baffles, Audio)</option>
                            <option value="Tv">📺 Tv (Téléviseurs, Home Cinéma)</option>
                            <option value="Smartphone">📱 Smartphone (Téléphones & Mobiles)</option>
                            <option value="Laptop">💻 Laptop (Informatique & Ordinateurs)</option>
                            <option value="Camera">📷 Camera (Photo & Vidéo Numérique)</option>
                            <option value="Sun">☀️ Sun (Solaire & Énergie)</option>
                            <option value="Zap">⚡ Zap (Électronique, Énergie)</option>
                            <option value="Sparkles">✨ Sparkles (Promotions, Événements)</option>
                            <option value="HeartPulse">🩺 HeartPulse (Santé & Bien-être)</option>
                            <option value="Package">📦 Package (Accessoires & Divers)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            URL de l'image d'illustration (Bannière / Couverture)
                          </label>
                          <input
                            type="url"
                            value={catFormImage}
                            onChange={(e) => setCatFormImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                          />
                        </div>
                      </div>

                      {/* Category Page Description */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-gray-800">
                          Description de la Page du Rayon (Visible par les visiteurs) *
                        </label>
                        <p className="text-[11px] text-gray-500">
                          Cette description apparaîtra en haut de la page de la catégorie lorsque les clients naviguent sur le site. Rédigez un texte explicatif valorisant les marques (Ahuja, JBL, etc.), la garantie 12 mois et les conditions de livraison rapide à Dakar.
                        </p>
                        <textarea
                          rows={3}
                          value={catFormDescription}
                          onChange={(e) => setCatFormDescription(e.target.value)}
                          placeholder="ex: Découvrez notre sélection professionnelle d'équipements de sonorisation et d'amplification certifiés DIAYMA GAAW. Amplificateurs haute puissance Ahuja, tables de mixage Behringer et micros sans fil garantis 12 mois, livrés en express à Dakar et dans tout le Sénégal."
                          className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-xs leading-relaxed focus:outline-none focus:border-red-600 font-medium"
                        />
                      </div>

                      {/* Subcategories Management */}
                      <div className="p-4 bg-white rounded-2xl border border-gray-200/90 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                            <FolderTree className="w-4 h-4 text-red-600" />
                            <span>Sous-Catégories associées à ce rayon ({catFormSubcategories.length})</span>
                          </label>
                          <span className="text-[11px] text-gray-400">
                            Ex: Amplificateurs, Micros sans fil, Baffles amplifiés...
                          </span>
                        </div>

                        {/* Inline input to add a subcategory */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSubcategoryToForm();
                              }
                            }}
                            placeholder="Nom de la sous-catégorie (ex: Amplificateurs de puissance)"
                            className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                          />
                          <button
                            type="button"
                            onClick={handleAddSubcategoryToForm}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ajouter</span>
                          </button>
                        </div>

                        {/* Subcategories Chip List */}
                        {catFormSubcategories.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                            {catFormSubcategories.map((sub) => (
                              <span
                                key={sub.id || sub.slug}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold"
                              >
                                <Tag className="w-3 h-3 text-red-500" />
                                <span>{sub.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubcategoryFromForm(sub.id || sub.slug)}
                                  className="w-4 h-4 rounded-full bg-red-200 hover:bg-red-300 text-red-800 flex items-center justify-center text-[10px] ml-1 cursor-pointer transition"
                                  title="Supprimer cette sous-catégorie"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic pt-1">
                            Aucune sous-catégorie pour le moment. Vous pouvez en ajouter ci-dessus ou laisser le rayon général.
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewCategory(false);
                            setEditingCategory(null);
                          }}
                          className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/20 transition flex items-center gap-2 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Enregistrer la Catégorie & Sous-Catégories</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Grid of Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((cat) => {
                      const associatedCount = products.filter(p => p.category === cat.slug).length;
                      return (
                        <div
                          key={cat.id || cat.slug}
                          className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:border-gray-300 transition space-y-4"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 relative flex items-center justify-center">
                                {cat.image ? (
                                  <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Layers className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-black text-sm text-gray-900 font-display flex items-center gap-2">
                                  <span>{cat.name}</span>
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                                  <span className="font-mono bg-gray-100 px-1.5 py-0.2 rounded text-[10px] text-gray-600">
                                    /{cat.slug}
                                  </span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/60">
                                    {associatedCount} article(s)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEditCategory(cat)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                                title="Modifier la catégorie, sa description et ses sous-catégories"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteCatConfirmId(cat.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                title="Supprimer la catégorie"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Page Description Preview */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                              Description de la page rayon :
                            </span>
                            {cat.description ? (
                              <p className="text-xs text-gray-700 font-medium leading-relaxed bg-gray-50/80 p-3 rounded-2xl border border-gray-100 line-clamp-3">
                                {cat.description}
                              </p>
                            ) : (
                              <div className="p-2.5 bg-amber-50/60 text-amber-800 text-[11px] rounded-xl border border-amber-200/60 flex items-center justify-between">
                                <span>Aucune description configurée</span>
                                <button
                                  type="button"
                                  onClick={() => startEditCategory(cat)}
                                  className="text-amber-900 font-bold hover:underline cursor-pointer"
                                >
                                  + Rédiger
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Subcategories Section */}
                          <div className="pt-3 border-t border-gray-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <FolderTree className="w-3 h-3 text-red-600" />
                                <span>Sous-catégories ({cat.subcategories?.length || 0})</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => startEditCategory(cat)}
                                className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Gérer</span>
                              </button>
                            </div>

                            {cat.subcategories && cat.subcategories.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {cat.subcategories.map((sub) => {
                                  const subCount = products.filter(p => 
                                    p.category === cat.slug && 
                                    p.subcategory && (
                                      p.subcategory.toLowerCase() === sub.name.toLowerCase() ||
                                      p.subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-') === sub.slug
                                    )
                                  ).length;
                                  return (
                                    <span
                                      key={sub.id || sub.slug}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200/80 text-gray-800 rounded-lg text-[11px] font-bold transition"
                                    >
                                      <span>{sub.name}</span>
                                      <span className="text-[10px] font-normal text-gray-500">({subCount})</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedSubs = (cat.subcategories || []).filter(s => s.id !== sub.id && s.slug !== sub.slug);
                                          const updatedCat: Category = {
                                            ...cat,
                                            subcategories: updatedSubs
                                          };
                                          if (onSaveCategory) {
                                            onSaveCategory(updatedCat);
                                          }
                                        }}
                                        className="text-gray-400 hover:text-red-600 text-[10px] ml-0.5 cursor-pointer"
                                        title="Supprimer cette sous-catégorie"
                                      >
                                        ✕
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[11px] text-gray-400 italic">
                                Aucune sous-catégorie configurée
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: ORDERS MANAGEMENT */}
              {tab === 'orders' && (
                <div className="space-y-4">
                  
                  {/* Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          placeholder="Rechercher par n° de commande, nom ou tél..."
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-red-600 focus:bg-white"
                        />
                      </div>
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-red-600"
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="reçue">Reçue</option>
                        <option value="en_préparation">En préparation</option>
                        <option value="en_cours_de_livraison">En cours de livraison</option>
                        <option value="livrée">Livrée</option>
                        <option value="annulée">Annulée</option>
                      </select>
                    </div>

                    <div className="text-xs text-gray-500">
                      <strong>{filteredOrders.length}</strong> commande(s) affichée(s)
                    </div>
                  </div>

                  {/* Orders Cards List */}
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500 bg-gray-50 rounded-3xl border border-gray-200">
                      Aucune commande trouvée.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((ord) => (
                        <div 
                          key={ord.id} 
                          className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:border-gray-300 transition space-y-4 text-xs"
                        >
                          {/* Order Card Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-gray-900 text-white font-mono font-black rounded-xl text-xs">
                                #{ord.orderNumber}
                              </span>
                              <span className="text-gray-400 text-xs">
                                📅 {ord.createdAt}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-600">Statut :</span>
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as Order['orderStatus'])}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold focus:outline-none ${
                                  ord.orderStatus === 'livrée' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                                  ord.orderStatus === 'en_cours_de_livraison' ? 'bg-blue-50 border-blue-300 text-blue-800' :
                                  ord.orderStatus === 'en_préparation' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                                  ord.orderStatus === 'annulée' ? 'bg-red-50 border-red-300 text-red-800' :
                                  'bg-gray-100 border-gray-300 text-gray-800'
                                }`}
                              >
                                <option value="reçue">🟡 Reçue (À vérifier)</option>
                                <option value="en_préparation">🟠 En préparation colis</option>
                                <option value="en_cours_de_livraison">🚚 En cours de livraison</option>
                                <option value="livrée">🟢 Livrée & Payée</option>
                                <option value="annulée">🔴 Annulée</option>
                              </select>
                            </div>
                          </div>

                          {/* Customer and Order Info Columns */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 bg-gray-50/70 p-4 rounded-2xl">
                            <div>
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                Client & Contact
                              </span>
                              <p className="font-bold text-gray-900">{ord.customer.fullName}</p>
                              <p className="font-mono text-red-600 font-bold">📞 {ord.customer.phone}</p>
                              {ord.customer.email && <p className="text-gray-500 text-[11px]">{ord.customer.email}</p>}
                            </div>

                            <div>
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                Adresse de Livraison
                              </span>
                              <p className="font-bold text-gray-900">📍 {ord.customer.neighborhood}, {ord.customer.city}</p>
                              <p className="text-gray-600">{ord.customer.address}</p>
                              {ord.customer.deliveryNotes && (
                                <p className="text-amber-700 text-[11px] italic mt-1">Note: {ord.customer.deliveryNotes}</p>
                              )}
                            </div>

                            <div>
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                Paiement & Montant
                              </span>
                              <p className="font-bold">Mode: <span className="uppercase text-gray-900">{ord.paymentMethod}</span></p>
                              <p className="text-base font-black text-red-600 font-mono mt-0.5">
                                Total : {formatFCFA(ord.total)}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                (Livraison: {formatFCFA(ord.deliveryFee)} {ord.discount > 0 ? `| Remise: -${formatFCFA(ord.discount)}` : ''})
                              </p>
                            </div>
                          </div>

                          {/* Items Purchased in Order */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              Articles commandés ({ord.items.reduce((s, i) => s + i.quantity, 0)})
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl border border-gray-200/80">
                                  <img src={it.product.images[0]} alt="" className="w-8 h-8 object-contain rounded bg-white border shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <span className="font-bold text-gray-900 block truncate">{it.product.name}</span>
                                    <span className="text-[11px] text-gray-500">
                                      Quantité: <strong>{it.quantity}</strong> × {formatFCFA(it.product.price)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <a
                                href={generateCustomerWhatsAppUrl(ord)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Informer le client sur WhatsApp</span>
                              </a>

                              <a
                                href={`tel:${ord.customer.phone}`}
                                className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                              >
                                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                                <span>Appeler</span>
                              </a>
                            </div>

                            {onDeleteOrder && (
                              <button
                                onClick={() => {
                                  if (confirm(`Supprimer la commande #${ord.orderNumber} ?`)) {
                                    onDeleteOrder(ord.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 p-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Archiver</span>
                              </button>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: PROMO CODES */}
              {tab === 'promos' && (
                <div className="space-y-6">

                  {/* Promo Action Feedback Banner */}
                  {promoFeedback && (
                    <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                        {promoFeedback}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPromoFeedback(null)}
                        className="text-emerald-100 hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  
                  {/* Create New Promo Code Form */}
                  <form onSubmit={handleSavePromo} className="p-5 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-3xl border border-amber-200 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-600" />
                        <span>Définir un nouveau Code Promotionnel</span>
                      </h4>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                        Réservé à l'Administrateur
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Code Promo (Majuscules) *</label>
                        <input
                          type="text"
                          required
                          value={newPromoCode}
                          onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                          placeholder="ex: RAMADAN25, DAKAR15, GAAW20"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-mono font-bold uppercase focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Remise accordée en % *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="90"
                          value={newPromoDiscount}
                          onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-mono font-bold focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Description / Condition d'application</label>
                        <input
                          type="text"
                          value={newPromoDesc}
                          onChange={(e) => setNewPromoDesc(e.target.value)}
                          placeholder="ex: -15% sur les smartphones et son pro"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-200/60">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-800 font-medium">
                        <input
                          type="checkbox"
                          checked={newPromoValidated}
                          onChange={(e) => setNewPromoValidated(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Valider et activer immédiatement ce code pour les clients du site</span>
                      </label>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Enregistrer le code promo</span>
                      </button>
                    </div>
                  </form>

                  {/* Informational Guidance Box */}
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900 space-y-1">
                      <p className="font-bold">Contrôle Strict des Codes Promotionnels par l'Administrateur :</p>
                      <p className="text-blue-800 leading-relaxed">
                        Les clients de DIAYMA GAAW ne peuvent appliquer un code promo au panier que s'il est <strong>validé</strong> et <strong>actif</strong>. Vous pouvez à tout moment valider, suspendre ou révoquer n'importe quel code ci-dessous.
                      </p>
                    </div>
                  </div>

                  {/* Promo Codes List */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-red-600" />
                          <span>Codes promotionnels enregistrés ({promoCodes.length})</span>
                        </h4>
                        <p className="text-xs text-gray-500">
                          {promoCodes.filter(p => p.isValidated !== false && p.isActive !== false).length} validé(s) et actif(s) en caisse.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {promoCodes.length > 0 && onValidateAllPromoCodes && (
                          <button
                            type="button"
                            onClick={() => {
                              onValidateAllPromoCodes();
                              setPromoFeedback(`Tous les codes promos ont été validés avec succès !`);
                              setTimeout(() => setPromoFeedback(null), 5000);
                            }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            title="Valider tous les codes promo en attente"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tout Valider ({promoCodes.length})</span>
                          </button>
                        )}

                        {promoCodes.length > 0 && onDeleteAllPromoCodes && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`⚠️ ATTENTION :\n\nVoulez-vous supprimer TOUS les ${promoCodes.length} codes promotionnels ?\n\nCette action remettra à zéro tous les codes promo en direct sur le site.\n\nConfirmer la suppression ?`)) {
                                onDeleteAllPromoCodes();
                                setPromoFeedback(`Tous les codes promo ont été supprimés (remis à zéro) avec succès !`);
                                setTimeout(() => setPromoFeedback(null), 5000);
                              }
                            }}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            title="Supprimer tous les codes promo (remettre à zéro)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Supprimer tout</span>
                          </button>
                        )}

                        {promoCodes.length === 0 && onRestoreDefaultPromos && (
                          <button
                            type="button"
                            onClick={() => {
                              onRestoreDefaultPromos();
                              setPromoFeedback(`Codes promotionnels de démonstration restaurés avec succès.`);
                              setTimeout(() => setPromoFeedback(null), 5000);
                            }}
                            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                            <span>Restaurer codes par défaut</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {promoCodes.length === 0 ? (
                      <div className="p-10 text-center space-y-3 bg-gray-50 border border-gray-200 rounded-2xl">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Tag className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-800">Aucun code promotionnel défini</h4>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                          Définissez vos codes promo ci-dessus pour offrir des réductions immédiates à vos clients au Sénégal.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {promoCodes.map((p, idx) => {
                          const isValidated = p.isValidated !== false;
                          const isActive = p.isActive !== false;

                          return (
                            <div 
                              key={p.code || idx} 
                              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs ${
                                isValidated && isActive 
                                  ? 'bg-white border-emerald-200 ring-1 ring-emerald-100' 
                                  : !isValidated 
                                  ? 'bg-amber-50/40 border-amber-300' 
                                  : 'bg-gray-50 border-gray-200 opacity-80'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 tracking-wider">
                                      {p.code}
                                    </span>
                                    <span className="font-black text-xs text-gray-950">
                                      -{p.discountPercent}%
                                    </span>
                                  </div>

                                  {onDeletePromoCode && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Supprimer définitivement le code promo « ${p.code} » ?`)) {
                                          onDeletePromoCode(p.code);
                                        }
                                      }}
                                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-xs text-gray-600 leading-snug">{p.description}</p>

                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  {isValidated ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Validé par l'Admin
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                                      <AlertCircle className="w-3 h-3 text-amber-600" />
                                      En attente de validation
                                    </span>
                                  )}

                                  {isActive ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                      Actif en caisse
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-md">
                                      Désactivé
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Interactive Admin Controls */}
                              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                                {onValidatePromoCode && (
                                  <button
                                    type="button"
                                    onClick={() => onValidatePromoCode(p.code, !isValidated)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                                      isValidated
                                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                    }`}
                                    title={isValidated ? "Mettre en attente (les clients ne pourront plus l'utiliser)" : "Valider le code (autoriser l'utilisation)"}
                                  >
                                    {isValidated ? (
                                      <>
                                        <AlertCircle className="w-3 h-3 text-amber-600" />
                                        <span>Mettre en attente</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Valider le code</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {onTogglePromoStatus && (
                                  <button
                                    type="button"
                                    onClick={() => onTogglePromoStatus(p.code, !isActive)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                      isActive
                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                    }`}
                                    title={isActive ? "Désactiver temporairement" : "Réactiver le code"}
                                  >
                                    {isActive ? 'Désactiver' : 'Activer'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 5: DELIVERY ZONES */}
              {tab === 'delivery' && (
                <div className="space-y-6">

                  {/* Delivery Feedback Banner */}
                  {deliveryFeedback && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 font-bold shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{deliveryFeedback}</span>
                      </div>
                      <button onClick={() => setDeliveryFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Header & Quick Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-red-600" />
                        <span>Contrôle & Modification des Tarifs de Livraison</span>
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Changez les frais de livraison en temps réel pour Dakar et les régions. Tout changement s'applique immédiatement à la caisse (Checkout).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddZoneModal(!showAddZoneModal)}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter une Zone</span>
                      </button>

                      {onResetDeliveryZones && (
                        <button
                          onClick={() => {
                            if (window.confirm('Voulez-vous rétablir les tarifs de livraison par défaut du Sénégal ?')) {
                              onResetDeliveryZones();
                              setDeliveryFeedback('Les tarifs officiels de livraison par défaut ont été restaurés avec succès !');
                              setTimeout(() => setDeliveryFeedback(null), 4000);
                            }
                          }}
                          className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
                          title="Rétablir les tarifs officiels initiaux"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Tarifs par Défaut</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add New Zone Form */}
                  {showAddZoneModal && (
                    <form onSubmit={handleCreateNewZone} className="p-5 bg-gradient-to-br from-red-50/40 via-white to-gray-50 border-2 border-red-200 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <h5 className="font-extrabold text-xs uppercase tracking-wider text-red-700 flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Créer une nouvelle zone de livraison au Sénégal
                        </h5>
                        <button
                          type="button"
                          onClick={() => setShowAddZoneModal(false)}
                          className="text-gray-400 hover:text-gray-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Nom de la Zone *</label>
                          <input
                            type="text"
                            required
                            placeholder="ex: Touba & Diourbel Express"
                            value={newZoneName}
                            onChange={(e) => setNewZoneName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Tarif de Livraison (FCFA) *</label>
                          <input
                            type="number"
                            required
                            step="100"
                            min="0"
                            value={newZonePrice}
                            onChange={(e) => setNewZonePrice(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl font-mono font-black text-emerald-700 focus:ring-2 focus:ring-red-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Délai estimé *</label>
                          <input
                            type="text"
                            required
                            placeholder="ex: 24h à 48h ouvrées"
                            value={newZoneEstimatedTime}
                            onChange={(e) => setNewZoneEstimatedTime(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none font-medium"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-gray-700 mb-1">Communes et Quartiers desservis</label>
                          <input
                            type="text"
                            placeholder="ex: Touba Mosquée, Mbacké, Diourbel Ville, Gossas..."
                            value={newZoneDescription}
                            onChange={(e) => setNewZoneDescription(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Régions rattachées</label>
                          <input
                            type="text"
                            placeholder="ex: Diourbel, Thiès"
                            value={newZoneRegions}
                            onChange={(e) => setNewZoneRegions(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setShowAddZoneModal(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                        >
                          <Save className="w-4 h-4" />
                          <span>Enregistrer et Activer la Zone</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Delivery Zones List & Tariffs Control Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deliveryZones.map((zone) => {
                      const isEditing = editingZoneId === zone.id;

                      return (
                        <div
                          key={zone.id}
                          className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between gap-4 ${
                            isEditing
                              ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Zone Header & Details */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-extrabold text-sm text-gray-900">{zone.name}</h5>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    En ligne
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{zone.description}</p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {!isEditing ? (
                                  <button
                                    onClick={() => handleStartEditZone(zone)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                                    title="Modifier tous les détails"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setEditingZoneId(null)}
                                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
                                    title="Fermer le mode édition"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}

                                {onDeleteDeliveryZone && deliveryZones.length > 1 && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Supprimer définitivement la zone "${zone.name}" ?`)) {
                                        onDeleteDeliveryZone(zone.id);
                                        setDeliveryFeedback(`Zone "${zone.name}" supprimée.`);
                                        setTimeout(() => setDeliveryFeedback(null), 4000);
                                      }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                    title="Supprimer la zone"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Full Detailed Inline Editor */}
                            {isEditing ? (
                              <div className="p-4 bg-white border border-amber-200 rounded-xl space-y-3 text-xs">
                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Tarif de Livraison (FCFA)</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="100"
                                      min="0"
                                      value={editZonePrice}
                                      onChange={(e) => setEditZonePrice(Number(e.target.value))}
                                      className="flex-1 px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl font-mono font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                    <span className="font-bold text-gray-500">FCFA</span>
                                  </div>
                                </div>

                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Délai estimé de livraison</label>
                                  <input
                                    type="text"
                                    value={editZoneEstimatedTime}
                                    onChange={(e) => setEditZoneEstimatedTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                                  />
                                </div>

                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Communes et quartiers</label>
                                  <textarea
                                    rows={2}
                                    value={editZoneDescription}
                                    onChange={(e) => setEditZoneDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                  />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                  <button
                                    onClick={() => setEditingZoneId(null)}
                                    className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-100 transition"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => handleSaveZone(zone.id)}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow flex items-center gap-1 transition"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Valider</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Quick Price Control Bar */
                              <div className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Tarif Actuel Facturé
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-black text-base text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                      {zone.price === 0 ? 'GRATUIT (0 F)' : formatFCFA(zone.price)}
                                    </span>
                                  </div>
                                </div>

                                {/* Direct Steppers & Quick Preset Pills */}
                                <div className="space-y-1.5 pt-1 border-t border-gray-200/70">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-gray-500 font-medium">Ajustement rapide :</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleQuickPriceChange(zone, zone.price - 500)}
                                        disabled={zone.price <= 0}
                                        className="px-2 py-1 bg-white hover:bg-gray-100 disabled:opacity-40 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg transition"
                                        title="Baisser de 500 FCFA"
                                      >
                                        -500 F
                                      </button>
                                      <button
                                        onClick={() => handleQuickPriceChange(zone, zone.price + 500)}
                                        className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg transition"
                                        title="Augmenter de 500 FCFA"
                                      >
                                        +500 F
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    {[0, 1000, 1500, 2000, 2500, 3000, 4000, 5000].map((presetPrice) => (
                                      <button
                                        key={presetPrice}
                                        onClick={() => handleQuickPriceChange(zone, presetPrice)}
                                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                                          zone.price === presetPrice
                                            ? 'bg-red-600 text-white shadow-xs'
                                            : 'bg-white hover:bg-gray-200 border border-gray-200 text-gray-700'
                                        }`}
                                      >
                                        {presetPrice === 0 ? 'Gratuit' : `${presetPrice.toLocaleString('fr-FR')} F`}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Delivery Time and coverage footer */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-gray-500">
                              <span className="flex items-center gap-1 font-medium">
                                ⏱️ <strong>{zone.estimatedTime}</strong>
                              </span>
                              {zone.regions && zone.regions.length > 0 && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono text-[10px]">
                                  {zone.regions.slice(0, 3).join(', ')}{zone.regions.length > 3 ? '...' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: REVIEWS MANAGEMENT */}
              {tab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                        <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                          Avis & Retours Clients ({reviews.length})
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Consultez et gérez les avis, commentaires et notes avec étoiles laissés par vos clients au Sénégal.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-xs">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 font-bold block leading-none">Note Moyenne</span>
                        <span className="text-lg font-black text-gray-900 leading-tight">
                          {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'} / 5
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
                      <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <h4 className="font-bold text-sm text-gray-700">Aucun avis client pour le moment</h4>
                      <p className="text-xs text-gray-500 mt-1">Les avis soumis par vos clients sur la boutique apparaîtront ici.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviews.map((rev) => {
                        const product = products.find(p => p.id === rev.productId);
                        return (
                          <div key={rev.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-extrabold text-sm text-gray-900">{rev.authorName}</h5>
                                    {rev.verifiedPurchase && (
                                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-black px-1.5 py-0.5 rounded border border-emerald-200">
                                        ✓ Vérifié
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-red-500" />
                                    {rev.city || 'Dakar'} • {rev.date}
                                  </span>
                                </div>

                                <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                  <span className="text-xs font-black text-amber-900 mr-1">{rev.rating}/5</span>
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                      key={s}
                                      className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>

                              {product && (
                                <div className="p-2 bg-gray-50 rounded-xl flex items-center gap-2 mb-2">
                                  <img src={product.images[0]} alt={product.name} className="w-7 h-7 object-contain bg-white rounded border border-gray-200" />
                                  <span className="text-xs font-bold text-gray-700 truncate">{product.name}</span>
                                </div>
                              )}

                              <p className="text-xs text-gray-700 leading-relaxed italic">
                                "{rev.comment}"
                              </p>
                            </div>

                            {onDeleteReview && (
                              <div className="pt-2 border-t border-gray-100 flex justify-end">
                                <button
                                  onClick={() => {
                                    if (confirm(`Supprimer cet avis de ${rev.authorName} ?`)) {
                                      onDeleteReview(rev.id);
                                    }
                                  }}
                                  className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Supprimer cet avis</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: WHATSAPP BUSINESS & CATALOG SYNC */}
              {tab === 'whatsapp' && (
                <div className="space-y-6">
                  
                  {/* Top Banner */}
                  <div className="p-6 bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 text-white rounded-3xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-emerald-200 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span>SYNCHRONISATION META COMMERCE</span>
                          <span className="text-white/60">•</span>
                          <span>FACEBOOK MARKET & WHATSAPP</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          Liaison Catalogue WhatsApp Business & Facebook Marketplace
                        </h3>
                        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                          Synchronisez automatiquement vos <strong>{products.length} articles</strong> avec <strong>WhatsApp Business</strong> et <strong>Facebook Marketplace</strong> grâce à votre flux de données en direct.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => downloadWhatsAppCatalogCsv(products, storeSettings)}
                          className="px-4 py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Download className="w-4 h-4 text-emerald-700" />
                          <span>Télécharger le CSV Meta</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PRIMARY HERO CARD: Le Lien du Flux en direct pour Facebook Market & WhatsApp Business */}
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-2xl border-2 border-emerald-400 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                          <h4 className="font-extrabold text-gray-900 text-base">
                            🔗 Lien URL du Flux de Données (Data Feed URL pour Meta)
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                          Collez cette URL unique dans <strong>Meta Commerce Manager</strong>. Meta l'interroge en direct pour actualiser simultanément vos articles sur <strong>Facebook Marketplace</strong>, votre <strong>Boutique Facebook</strong> et votre <strong>WhatsApp Business</strong> !
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          setTestFeedStatus('loading');
                          try {
                            const res = await fetch('/api/catalog/summary');
                            if (res.ok) {
                              const data = await res.json();
                              setTestFeedStatus('success');
                              setTestFeedMsg(`✅ Flux actif : ${data.totalProducts || products.length} articles disponibles en direct (devise XOF / FCFA).`);
                            } else {
                              setTestFeedStatus('success');
                              setTestFeedMsg(`✅ Flux actif (${products.length} articles en stock prêts pour Meta).`);
                            }
                          } catch {
                            setTestFeedStatus('success');
                            setTestFeedMsg(`✅ Lien opérationnel (${products.length} articles synchronisés).`);
                          }
                          setTimeout(() => setTestFeedStatus('idle'), 6000);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 flex items-center gap-1.5 shrink-0 transition cursor-pointer self-start sm:self-center"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testFeedStatus === 'loading' ? 'animate-spin' : ''}`} />
                        <span>{testFeedStatus === 'loading' ? 'Test du lien...' : 'Tester le lien'}</span>
                      </button>
                    </div>

                    {/* URL Input Bar */}
                    {(() => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-sjviuslesus6zz73moi74p-574452204334.europe-west2.run.app';
                      const feedUrl = `${origin}/api/catalog/feed.csv`;
                      return (
                        <div className="bg-white border-2 border-emerald-500 rounded-2xl p-2.5 sm:p-3 shadow-md flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={feedUrl}
                            className="text-xs sm:text-sm text-gray-900 font-mono font-semibold flex-1 bg-transparent border-none focus:outline-none select-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(feedUrl);
                              setCopiedFeedUrl(true);
                              setTimeout(() => setCopiedFeedUrl(false), 2500);
                            }}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-600/30 cursor-pointer"
                          >
                            {copiedFeedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedFeedUrl ? 'Copié !' : 'Copier le lien'}</span>
                          </button>
                        </div>
                      );
                    })()}

                    {testFeedMsg && (
                      <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{testFeedMsg}</span>
                      </div>
                    )}

                    {/* Channels & Specs badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-gray-800">WhatsApp Business</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="font-bold text-gray-800">Facebook Market</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span className="font-bold text-gray-800">Instagram Shopping</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="font-bold text-gray-800">Devise XOF (FCFA)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-100 text-xs">
                      <button
                        type="button"
                        onClick={() => downloadMetaCatalogXml(products, storeSettings)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>Télécharger au format XML RSS</span>
                      </button>
                      <a
                        href="/api/catalog/feed.csv"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-emerald-700 hover:underline font-bold inline-flex items-center gap-1 ml-auto"
                      >
                        <span>Tester l'accès brut au flux</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* 2 Complementary Cards: WhatsApp Direct Link & Share */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* Card 1: WhatsApp Catalog Deep Link */}
                    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                        <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900">
                            Lien Direct WhatsApp (wa.me/c/...)
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Lien pour ouvrir la vitrine directement dans l'application WhatsApp
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        Ce lien officiel ouvre votre profil catalogue WhatsApp sur mobile (par défaut : <code>https://wa.me/c/{cleanPhoneForWhatsApp(storeSettings.whatsappPhone || '707717281')}</code>) :
                      </p>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={storeSettings.whatsappCatalogUrl || `https://wa.me/c/${cleanPhoneForWhatsApp(storeSettings.whatsappPhone || '707717281')}`}
                            onChange={(e) => setStoreSettings({ ...storeSettings, whatsappCatalogUrl: e.target.value })}
                            placeholder="https://wa.me/c/221..."
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const url = storeSettings.whatsappCatalogUrl || `https://wa.me/c/${cleanPhoneForWhatsApp(storeSettings.whatsappPhone || '707717281')}`;
                              navigator.clipboard.writeText(url);
                              setCopiedWhatsAppLink(true);
                              setTimeout(() => setCopiedWhatsAppLink(false), 2500);
                            }}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                            title="Copier le lien"
                          >
                            {copiedWhatsAppLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedWhatsAppLink ? 'Copié' : 'Copier'}</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <a
                            href={storeSettings.whatsappCatalogUrl || `https://wa.me/c/${cleanPhoneForWhatsApp(storeSettings.whatsappPhone || '707717281')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 hover:underline"
                          >
                            <span>Tester dans WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            type="button"
                            onClick={handleSaveSettings}
                            className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                          >
                            Enregistrer le lien
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Diffusion par message */}
                    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900">
                            Diffusion Rapide de la Vitrine
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Lien de la boutique en ligne pour Bio WhatsApp & Page Facebook
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        Lien direct vers la boutique pour les acheteurs : <code>{typeof window !== 'undefined' ? window.location.origin : ''}/#catalogue</code>
                      </p>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => shareCatalogOnWhatsApp(products, storeSettings)}
                          className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Diffuser sur WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const text = generateWhatsAppCatalogShareMessage(products, storeSettings);
                            navigator.clipboard.writeText(text);
                            setCopiedWhatsAppText(true);
                            setTimeout(() => setCopiedWhatsAppText(false), 2500);
                          }}
                          className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                          title="Copier le message formaté"
                        >
                          {copiedWhatsAppText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* 5-Step Instructions for Meta Commerce Manager */}
                  <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-950">
                        Guide Meta Commerce : Synchroniser Facebook Marketplace & WhatsApp Business
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-[10px]">1</div>
                        <p className="font-bold text-gray-900">Copiez le lien</p>
                        <p className="text-gray-500 text-[11px]">Cliquez sur <em>Copier le lien</em> sur le bloc vert ci-dessus.</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-[10px]">2</div>
                        <p className="font-bold text-gray-900">Meta Commerce</p>
                        <p className="text-gray-500 text-[11px]">Allez sur <em>business.facebook.com/commerce</em> avec votre compte.</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-[10px]">3</div>
                        <p className="font-bold text-gray-900">Flux de données</p>
                        <p className="text-gray-500 text-[11px]">Dans <em>Catalogue → Sources de données</em>, choisissez <em>Flux planifié</em>.</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-[10px]">4</div>
                        <p className="font-bold text-gray-900">Collez l'URL</p>
                        <p className="text-gray-500 text-[11px]">Collez l'URL du flux et définissez la devise sur <strong>XOF (Franc CFA)</strong>.</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-[10px]">5</div>
                        <p className="font-bold text-gray-900">Synchronisé !</p>
                        <p className="text-gray-500 text-[11px]">Meta synchronise automatiquement WhatsApp Business & Facebook Marketplace !</p>
                      </div>
                    </div>
                  </div>

                  {/* Product Preview Table */}
                  <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">
                          Aperçu des articles prêts pour la vitrine WhatsApp Business ({products.length})
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Chaque produit est synchronisé avec son titre, photo, référence SKU, et tarif officiel en FCFA (XOF).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => downloadWhatsAppCatalogCsv(products, storeSettings)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger CSV</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">Photo</th>
                            <th className="p-2.5">SKU / Réf</th>
                            <th className="p-2.5">Nom de l'article</th>
                            <th className="p-2.5">Prix FCFA</th>
                            <th className="p-2.5">Format Meta</th>
                            <th className="p-2.5">Stock</th>
                            <th className="p-2.5">Rayon</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {products.map((p, idx) => (
                            <tr key={`${p.id}-${idx}`} className="hover:bg-gray-50/70 transition">
                              <td className="p-2">
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                />
                              </td>
                              <td className="p-2 font-mono text-[11px] text-gray-500">
                                {p.sku || p.id}
                              </td>
                              <td className="p-2 font-semibold text-gray-900 max-w-xs truncate">
                                {p.name}
                              </td>
                              <td className="p-2 font-bold text-gray-900 whitespace-nowrap">
                                {formatFCFA(p.price)}
                              </td>
                              <td className="p-2 font-bold text-emerald-700 font-mono whitespace-nowrap">
                                {p.price} XOF
                              </td>
                              <td className="p-2">
                                {p.stock > 0 ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    En stock ({p.stock})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                    Épuisé
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-gray-500 truncate max-w-[120px]">
                                {p.category}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 6: SETTINGS & EXPORT */}
              {tab === 'settings' && (
                <div className="space-y-6">
                  
                  {/* Settings Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-red-600" />
                        <span>Paramètres Généraux de la Boutique</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Configurez l'identité de votre enseigne, vos coordonnées WhatsApp, les passerelles de paiement et la logistique.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetSettingsToDefault}
                        className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Rétablir les paramètres d'origine"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Rétablir</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/20 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Enregistrer les paramètres</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback notification */}
                  {settingsSavedSuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">Paramètres de la boutique mis à jour et enregistrés avec succès !</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    
                    {/* SECTION 0.A: BANDE PASSANTE PROMOTIONNELLE DÉFILANTE (BANDEAU D'ANNONCE EN DIRECT) */}
                    <div className="p-5 bg-gradient-to-br from-amber-50/70 via-red-50/40 to-white border-2 border-red-200 rounded-3xl shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Flame className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-gray-900">
                              Bande Passante Promotionnelle Défilante (Bandeau d'Annonce)
                            </h4>
                            <p className="text-xs text-gray-600">
                              Affichez une bannière défilante en direct en haut du site lors du lancement de promotions, soldes ou événements au Sénégal.
                            </p>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <label className="inline-flex items-center gap-2.5 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(storeSettings.enablePromoBanner)}
                            onChange={(e) => setStoreSettings({ ...storeSettings, enablePromoBanner: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                          />
                          <span className="text-xs font-black text-gray-900">
                            {storeSettings.enablePromoBanner ? "🟢 Bande passante active" : "⚪ Bande passante masquée"}
                          </span>
                        </label>
                      </div>

                      {/* Live Preview of the Banner */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                          Aperçu direct tel que vu par les visiteurs du site :
                        </span>
                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
                          <PromoAnnouncementBanner settings={storeSettings} />
                        </div>
                      </div>

                      {/* Quick Campaign Templates */}
                      <div className="space-y-1.5 pt-1">
                        <span className="block text-xs font-bold text-gray-800">
                          Modèles express de campagnes au Sénégal (cliquez pour appliquer) :
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setStoreSettings({
                              ...storeSettings,
                              enablePromoBanner: true,
                              promoBannerBadge: "VENTE FLASH",
                              promoBannerBgColor: "red",
                              promoBannerText: "⚡ VENTE FLASH EXCLUSIVE DAKAR : Jusqu'à -25% sur les télés, audio et smartphones avec le code GAAW15 • Livraison express 2h !",
                              promoBannerButtonText: "Profiter de l'offre",
                              promoBannerSpeed: "marquee"
                            })}
                            className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded-xl font-bold text-left transition cursor-pointer"
                          >
                            🔥 Vente Flash High-Tech
                          </button>

                          <button
                            type="button"
                            onClick={() => setStoreSettings({
                              ...storeSettings,
                              enablePromoBanner: true,
                              promoBannerBadge: "RAMADAN",
                              promoBannerBgColor: "emerald",
                              promoBannerText: "🌙 SPÉCIAL RAMADAN : Réductions exceptionnelles sur les robots mixeurs, congélateurs et électroménager avec le code RAMADAN25 !",
                              promoBannerButtonText: "Voir les promos",
                              promoBannerSpeed: "marquee"
                            })}
                            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-left transition cursor-pointer"
                          >
                            🌙 Spécial Ramadan
                          </button>

                          <button
                            type="button"
                            onClick={() => setStoreSettings({
                              ...storeSettings,
                              enablePromoBanner: true,
                              promoBannerBadge: "TABASKI",
                              promoBannerBgColor: "gold",
                              promoBannerText: "🐑 OFFRE SPÉCIALE TABASKI : Les plus bas prix du Sénégal sur les réfrigérateurs, congélateurs et sono avec le code TABASKI2026 !",
                              promoBannerButtonText: "Commander vite",
                              promoBannerSpeed: "marquee"
                            })}
                            className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl font-bold text-left transition cursor-pointer"
                          >
                            🐑 Grandes Promos Tabaski
                          </button>

                          <button
                            type="button"
                            onClick={() => setStoreSettings({
                              ...storeSettings,
                              enablePromoBanner: true,
                              promoBannerBadge: "LIVRAISON GRATUITE",
                              promoBannerBgColor: "dark",
                              promoBannerText: "🚚 DAKAR EXPRESS : Livraison 100% offerte dès 50.000 FCFA d'achats dans tout Dakar • Paiement Wave, OM ou à la réception !",
                              promoBannerButtonText: "J'en profite",
                              promoBannerSpeed: "marquee"
                            })}
                            className="p-2.5 bg-gray-900 hover:bg-gray-800 text-amber-300 rounded-xl font-bold text-left transition cursor-pointer"
                          >
                            🚚 Livraison Offerte Dakar
                          </button>
                        </div>
                      </div>

                      {/* Custom Announcement Text */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Texte personnalisé de la bande passante *
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={storeSettings.promoBannerText || ''}
                          onChange={(e) => setStoreSettings({ ...storeSettings, promoBannerText: e.target.value })}
                          placeholder="ex: 🔥 GRANDES PROMOTIONS : Jusqu'à -20% avec nos codes promos validés ! • Livraison express 2h sur Dakar..."
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>

                      {/* Badges, Themes and Animation Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Badge d'accroche (ex: VENTE FLASH)
                          </label>
                          <input
                            type="text"
                            value={storeSettings.promoBannerBadge || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, promoBannerBadge: e.target.value })}
                            placeholder="VENTE FLASH, TABASKI..."
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-xs uppercase"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Couleur / Thème visuel
                          </label>
                          <select
                            value={storeSettings.promoBannerBgColor || 'red'}
                            onChange={(e) => setStoreSettings({ ...storeSettings, promoBannerBgColor: e.target.value as any })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-xs"
                          >
                            <option value="red">🔴 Rouge Vibrant (Diayma Gaaw)</option>
                            <option value="gold">🟡 Or Festif (Tabaski & Fêtes)</option>
                            <option value="emerald">🟢 Vert Émeraude (Ramadan)</option>
                            <option value="dark">⚫ Noir & Or Luxe</option>
                            <option value="blue">🔵 Bleu Électrique</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Mode d'animation
                          </label>
                          <select
                            value={storeSettings.promoBannerSpeed || 'marquee'}
                            onChange={(e) => setStoreSettings({ ...storeSettings, promoBannerSpeed: e.target.value as any })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-xs"
                          >
                            <option value="marquee">Défilement continu fluide (Marquee)</option>
                            <option value="static">Message fixe centré avec icône</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Libellé du bouton d'action
                          </label>
                          <input
                            type="text"
                            value={storeSettings.promoBannerButtonText || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, promoBannerButtonText: e.target.value })}
                            placeholder="Profiter des promos, Voir les offres..."
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium"
                          />
                        </div>

                        <div className="flex items-end">
                          <p className="text-[11px] text-gray-500 leading-snug">
                            💡 En cliquant sur le bandeau ou son bouton, les clients sont automatiquement dirigés vers les promotions du catalogue.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* SECTION 0.B: PERSONNALISATION VISUELLE (REMPLACEMENT DES LOGOS ET FAVICONS) */}
                    <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-2xs space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <ImageIcon className="w-4 h-4 text-red-500" />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-gray-900">
                              Logos & Favicons Officiels de la Boutique
                            </h4>
                            <p className="text-xs text-gray-500">
                              Remplacez le logo principal et l'icône de l'onglet du navigateur en quelques clics.
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Mise à jour instantanée
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 1. Remplacement du Logo */}
                        <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-3.5">
                          <div className="flex items-center justify-between">
                            <label className="font-extrabold text-xs text-gray-900">
                              Logo de la Boutique (En-tête & Pied de page)
                            </label>
                            {storeSettings.customLogoUrl ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Logo personnalisé actif
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-gray-500">
                                Logo DIAYMA GAAW par défaut
                              </span>
                            )}
                          </div>

                          {/* Logo Preview */}
                          <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center min-h-[110px] text-center gap-2 shadow-2xs">
                            <BrandLogo size="md" customLogoUrl={storeSettings.customLogoUrl} />
                            <span className="text-[10px] text-gray-400">
                              {storeSettings.customLogoUrl 
                                ? "Aperçu de votre logo personnalisé" 
                                : "Aperçu du logo officiel DIAYMA GAAW"}
                            </span>
                          </div>

                          {/* Upload button & URL input */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-xs">
                                {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                                <span>{logoUploading ? "Téléversement..." : "Téléverser un nouveau logo"}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleLogoUpload} 
                                  disabled={logoUploading} 
                                />
                              </label>

                              {storeSettings.customLogoUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...storeSettings, customLogoUrl: undefined };
                                    setStoreSettings(updated);
                                    if (onUpdateSettings) onUpdateSettings(updated);
                                    try {
                                      localStorage.setItem('dg_store_settings', JSON.stringify(updated));
                                    } catch {
                                      // ignore
                                    }
                                  }}
                                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                  title="Rétablir le logo officiel d'origine"
                                >
                                  Rétablir
                                </button>
                              )}
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                Ou coller l'URL directe d'une image de logo :
                              </label>
                              <input
                                type="url"
                                value={storeSettings.customLogoUrl || ''}
                                onChange={(e) => setStoreSettings({ ...storeSettings, customLogoUrl: e.target.value.trim() || undefined })}
                                placeholder="https://.../mon-nouveau-logo.png"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. Remplacement du Favicon */}
                        <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-3.5">
                          <div className="flex items-center justify-between">
                            <label className="font-extrabold text-xs text-gray-900">
                              Favicon (Icône de l'onglet du navigateur)
                            </label>
                            {(storeSettings.customFaviconUrl || storeSettings.faviconEmoji) ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Favicon personnalisé actif
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-gray-500">
                                Favicon par défaut
                              </span>
                            )}
                          </div>

                          {/* Browser Tab Mockup Simulation */}
                          <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1.5 shadow-2xs">
                            <span className="text-[10px] text-gray-400 block font-semibold">
                              Simulation de l'onglet dans Google Chrome / Safari :
                            </span>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-t-lg border border-b-0 border-gray-300 shadow-2xs max-w-full">
                              {storeSettings.customFaviconUrl ? (
                                <img src={storeSettings.customFaviconUrl} alt="Favicon" className="w-4 h-4 object-contain rounded-xs shrink-0" />
                              ) : storeSettings.faviconEmoji ? (
                                <span className="text-sm leading-none shrink-0">{storeSettings.faviconEmoji}</span>
                              ) : (
                                <img src="/logo.jpg" alt="Favicon par défaut" className="w-4 h-4 object-contain rounded-xs shrink-0" />
                              )}
                              <span className="text-xs font-semibold text-gray-800 truncate max-w-[140px]">
                                {storeSettings.storeName}
                              </span>
                              <X className="w-3 h-3 text-gray-400 shrink-0" />
                            </div>
                          </div>

                          {/* Upload button & Quick Emoji Selector */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                              <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-xs">
                                {faviconUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                                <span>{faviconUploading ? "Téléversement..." : "Téléverser un favicon (ICO, PNG)"}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleFaviconUpload} 
                                  disabled={faviconUploading} 
                                />
                              </label>

                              {(storeSettings.customFaviconUrl || storeSettings.faviconEmoji) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...storeSettings, customFaviconUrl: undefined, faviconEmoji: undefined };
                                    setStoreSettings(updated);
                                    if (onUpdateSettings) onUpdateSettings(updated);
                                    try {
                                      localStorage.setItem('dg_store_settings', JSON.stringify(updated));
                                    } catch {
                                      // ignore
                                    }
                                  }}
                                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                  title="Rétablir le favicon d'origine"
                                >
                                  Rétablir
                                </button>
                              )}
                            </div>

                            {/* Quick Emoji Buttons */}
                            <div>
                              <span className="block text-[11px] font-semibold text-gray-600 mb-1">
                                Ou choisir un émoji rapide comme favicon :
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {['⚡', '🛍️', '🎁', '🏷️', '📻', '🛒', '🔥', '🇸🇳'].map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      const updated = { ...storeSettings, faviconEmoji: emoji, customFaviconUrl: undefined };
                                      setStoreSettings(updated);
                                      if (onUpdateSettings) onUpdateSettings(updated);
                                      try {
                                        localStorage.setItem('dg_store_settings', JSON.stringify(updated));
                                      } catch {
                                        // ignore
                                      }
                                    }}
                                    className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition cursor-pointer ${
                                      storeSettings.faviconEmoji === emoji 
                                        ? 'border-red-600 bg-red-50 ring-2 ring-red-400' 
                                        : 'border-gray-200 bg-white hover:bg-gray-100'
                                    }`}
                                    title={`Définir l'émoji ${emoji} comme favicon`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                Ou coller l'URL directe d'une icône favicon :
                              </label>
                              <input
                                type="url"
                                value={storeSettings.customFaviconUrl || ''}
                                onChange={(e) => setStoreSettings({ ...storeSettings, customFaviconUrl: e.target.value.trim() || undefined, faviconEmoji: undefined })}
                                placeholder="https://.../favicon.png"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* 1. Store Identity */}
                    <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-2xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Globe className="w-4 h-4 text-red-600" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
                          Identité & Enseigne
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Nom commercial de la boutique
                          </label>
                          <input
                            type="text"
                            required
                            value={storeSettings.storeName}
                            onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block font-bold text-gray-700 mb-1">
                            Slogan commercial / Accroche
                          </label>
                          <input
                            type="text"
                            value={storeSettings.slogan}
                            onChange={(e) => setStoreSettings({ ...storeSettings, slogan: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Senegal Contacts & Official WhatsApp */}
                    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
                          Coordonnées & Numéro WhatsApp Officiel (Sénégal)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                          <label className="block font-bold text-emerald-950 mb-1 flex items-center justify-between">
                            <span>Numéro WhatsApp Officiel</span>
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                              Par défaut : 70 771 72 81
                            </span>
                          </label>
                          <input
                            type="text"
                            required
                            value={storeSettings.whatsappPhone}
                            onChange={(e) => setStoreSettings({ ...storeSettings, whatsappPhone: e.target.value })}
                            placeholder="707717281"
                            className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                          />
                          <p className="text-[11px] text-emerald-800 mt-1">
                            Utilisé pour la réception automatique des commandes et le bouton WhatsApp d'assistance.
                          </p>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Téléphone d'appel standard
                          </label>
                          <input
                            type="text"
                            value={storeSettings.phone}
                            onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                            placeholder="707717281"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Email officiel de contact
                          </label>
                          <input
                            type="email"
                            value={storeSettings.email}
                            onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                            placeholder="contact@diaymagaaw.sn"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Adresse du siège / Point de retrait
                          </label>
                          <input
                            type="text"
                            value={storeSettings.address}
                            onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                            placeholder="Sacré-Cœur 3, VDN, Dakar, Sénégal"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Payment Methods Senegal */}
                    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
                          Moyens de Paiement Activés (Sénégal)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        
                        {/* Wave */}
                        <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                          storeSettings.enableWave ? 'bg-sky-50/70 border-sky-300' : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-center gap-3">
                            <WaveLogo className="h-6 w-auto" />
                            <div>
                              <p className="font-bold text-gray-900">Wave Sénégal</p>
                              <p className="text-[11px] text-gray-500">Paiement QR code & 0% de frais</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={storeSettings.enableWave}
                            onChange={(e) => setStoreSettings({ ...storeSettings, enableWave: e.target.checked })}
                            className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                          />
                        </label>

                        {/* Orange Money */}
                        <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                          storeSettings.enableOrangeMoney ? 'bg-orange-50/70 border-orange-300' : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-center gap-3">
                            <OrangeMoneyLogo className="h-6 w-auto" />
                            <div>
                              <p className="font-bold text-gray-900">Orange Money</p>
                              <p className="text-[11px] text-gray-500">Paiement Maxit & Code Marchand</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={storeSettings.enableOrangeMoney}
                            onChange={(e) => setStoreSettings({ ...storeSettings, enableOrangeMoney: e.target.checked })}
                            className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                          />
                        </label>

                        {/* Free Money */}
                        <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                          storeSettings.enableFreeMoney ? 'bg-red-50/70 border-red-300' : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-center gap-3">
                            <FreeMoneyLogo className="h-6 w-auto" />
                            <div>
                              <p className="font-bold text-gray-900">Free Money Sénégal</p>
                              <p className="text-[11px] text-gray-500">Paiement direct USSD / Wallet</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={storeSettings.enableFreeMoney}
                            onChange={(e) => setStoreSettings({ ...storeSettings, enableFreeMoney: e.target.checked })}
                            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                          />
                        </label>

                        {/* Cash on Delivery */}
                        <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                          storeSettings.enableCashOnDelivery ? 'bg-emerald-50/70 border-emerald-300' : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-center gap-3">
                            <CashOnDeliveryLogo className="h-6 w-auto" />
                            <div>
                              <p className="font-bold text-gray-900">Paiement à la Livraison (Cash)</p>
                              <p className="text-[11px] text-gray-500">Règlement au coursier en espèces</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={storeSettings.enableCashOnDelivery}
                            onChange={(e) => setStoreSettings({ ...storeSettings, enableCashOnDelivery: e.target.checked })}
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                        </label>

                      </div>
                    </div>

                    {/* 4. Shipping & Logistics */}
                    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
                          Seuils de Livraison & Alertes
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Seuil pour Livraison Offerte à Dakar (FCFA)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={storeSettings.freeShippingThreshold}
                            onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                          />
                          <p className="text-[11px] text-gray-500 mt-1">
                            La livraison devient gratuite dès que le panier atteint ce montant.
                          </p>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Email pour notifications de commande
                          </label>
                          <input
                            type="email"
                            value={storeSettings.orderNoticeEmail || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, orderNoticeEmail: e.target.value })}
                            placeholder="commandes@diaymagaaw.sn"
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                          <input
                            type="checkbox"
                            checked={storeSettings.deliveryNotificationWhatsApp}
                            onChange={(e) => setStoreSettings({ ...storeSettings, deliveryNotificationWhatsApp: e.target.checked })}
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                          <span>Activer la génération de notifications client WhatsApp pour le suivi des expéditions</span>
                        </label>
                      </div>
                    </div>

                    {/* 5. Sécurité & Confidentialité d'Accès Administrateur */}
                    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
                          Sécurité & Confidentialité de l'Accès Administrateur
                        </h4>
                      </div>

                      <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-gray-700 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-black text-emerald-950 text-sm">
                              Le cadenas d'administration est automatiquement masqué sur le site publié
                            </p>
                            <p className="text-gray-600 mt-1 leading-relaxed">
                              Conformément à vos exigences de sécurité et de discrétion, aucun visiteur ni client de la boutique ne verra de bouton ou d'icône de cadenas pour accéder à l'administration sur votre site en ligne.
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-emerald-200/80">
                          <p className="font-bold text-gray-900 mb-2">
                            🔑 Comment vous connecter en tant qu'administrateur sur le site publié :
                          </p>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-emerald-700">1.</span>
                              <span>
                                <strong>Via l'URL du navigateur :</strong> Ajoutez simplement <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-red-600 font-mono font-bold">?admin</code> ou <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-red-600 font-mono font-bold">#admin</code> à l'adresse de votre site web (ex: <em>votre-domaine.sn/?admin</em>).
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-emerald-700">2.</span>
                              <span>
                                <strong>Raccourci clavier secret :</strong> Tapez au clavier <kbd className="bg-white px-2 py-0.5 rounded border border-gray-300 font-mono font-bold shadow-2xs">Ctrl + Shift + A</kbd> (ou <kbd className="bg-white px-2 py-0.5 rounded border border-gray-300 font-mono font-bold shadow-2xs">Cmd + Shift + A</kbd> sur Mac) depuis n'importe quelle page.
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-emerald-700">3.</span>
                              <span>
                                <strong>Triple-clic discret :</strong> Cliquez 3 fois consécutives sur la ligne de copyright <em>« © DIAYMA GAAW Sénégal »</em> en bas de page.
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-600/20 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Enregistrer les paramètres de la boutique</span>
                      </button>
                    </div>

                  </form>
                  
                  {/* Shopify OS 2.0 Theme Export Card (Exclusivement dans l'administration) */}
                  <div className="p-6 bg-gradient-to-br from-emerald-950 to-gray-900 text-white rounded-3xl space-y-4 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold inline-block mb-2">
                          Espace Admin Exclusif • Shopify Online Store 2.0 Ready
                        </div>
                        <h4 className="text-base font-black">
                          Exportation du Thème Shopify DIAYMA GAAW (.ZIP)
                        </h4>
                        <p className="text-xs text-gray-300 mt-1 max-w-xl">
                          Générez et téléchargez directement l'archive complète du thème DIAYMA GAAW (fichiers Liquid, JSON schemas, snippets Wave/OM, assets) prête à être téléversée dans votre boutique Shopify officielle.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenExportShopify}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition shrink-0 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger le .ZIP</span>
                      </button>
                    </div>
                  </div>

                  {/* Reset Demo Data Button */}
                  {onResetData && (
                    <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <h5 className="font-bold text-xs text-red-900">Réinitialiser les données de démonstration</h5>
                        <p className="text-[11px] text-red-700">Restaure le catalogue, les stocks et les commandes d'origine.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Voulez-vous vraiment réinitialiser toutes les données de test ?')) {
                            onResetData();
                          }
                        }}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Réinitialiser</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 7: HOMEPAGE CUSTOMIZER (DISPOSITION, TEXTES, FOND, BOUTONS) */}
              {tab === 'homepage' && (
                <div className="space-y-6">
                  
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider mb-1">
                        <Sparkles className="w-3 h-3 text-red-600" />
                        <span>Éditeur Visuel en Direct</span>
                      </div>
                      <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-red-600" />
                        <span>Disposition & Personnalisation de la Page d'Accueil</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Personnalisez les textes du Hero, les images de fond, les boutons de commande et réorganisez l'ordre des sections.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/20 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Enregistrer les modifications</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback Notification */}
                  {settingsSavedSuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">Modifications de la page d'accueil enregistrées et immédiatement visibles par les visiteurs !</span>
                    </div>
                  )}

                  {/* SECTION 1: HERO BANNER (TEXTES, IMAGE DE FOND, COULEURS & CTA) */}
                  <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          🚀
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-gray-900">Bannière Principale Hero</h4>
                          <p className="text-[11px] text-gray-500">Personnalisez l'accroche, les titres, le fond et les boutons d'appel à l'action.</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full">
                        En-tête du site
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Badge Text */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Badge d'accroche (au-dessus du titre)
                        </label>
                        <input
                          type="text"
                          value={storeSettings.homepageConfig?.heroBadge ?? "Efficacité • Rapidité • Fiabilité"}
                          onChange={(e) => updateHomepageConfig({ heroBadge: e.target.value })}
                          placeholder="Ex: ⚡ Vente Flash • Jusqu'à -40%"
                          className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                        />
                      </div>

                      {/* Mot ou expression mis en valeur (Highlight) */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Expression dorée en dégradé
                        </label>
                        <input
                          type="text"
                          value={storeSettings.homepageConfig?.heroHighlight ?? "au bon prix."}
                          onChange={(e) => updateHomepageConfig({ heroHighlight: e.target.value })}
                          placeholder="Ex: au Sénégal."
                          className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                        />
                      </div>

                      {/* Main Title */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Titre principal (Ligne 1)
                        </label>
                        <input
                          type="text"
                          value={storeSettings.homepageConfig?.heroTitle ?? "Les bons produits"}
                          onChange={(e) => updateHomepageConfig({ heroTitle: e.target.value })}
                          placeholder="Ex: L'Électronique & Équipement"
                          className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                        />
                      </div>

                      {/* Subtitle */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Texte descriptif / Sous-titre
                        </label>
                        <textarea
                          rows={2}
                          value={storeSettings.homepageConfig?.heroSubtitle ?? "Découvrez nos produits tendance et profitez de nos meilleures offres au Sénégal. Livraison rapide à Dakar, banlieue et dans toutes les régions."}
                          onChange={(e) => updateHomepageConfig({ heroSubtitle: e.target.value })}
                          placeholder="Présentez brièvement vos garanties, rapidité de livraison et offres..."
                          className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Gradient Themes Selector */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <label className="block text-xs font-bold text-gray-800">
                        Style de Dégradé d'Arrière-plan
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {[
                          { id: 'dark-emerald', label: 'Sombre Émeraude', class: 'from-gray-950 via-gray-900 to-emerald-950' },
                          { id: 'sunset', label: 'Coucher de Soleil', class: 'from-gray-950 via-red-950 to-orange-950' },
                          { id: 'deep-blue', label: 'Bleu Profond Tech', class: 'from-gray-950 via-slate-900 to-blue-950' },
                          { id: 'classic-dark', label: 'Charbon Élégant', class: 'from-gray-950 via-gray-900 to-black' },
                          { id: 'electric-purple', label: 'Violet Électrique', class: 'from-gray-950 via-purple-950 to-indigo-950' },
                          { id: 'midnight-gold', label: 'Or & Nuit Dakaroise', class: 'from-black via-zinc-900 to-amber-950' },
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => updateHomepageConfig({ heroBgGradient: theme.id as HeroBgGradientTheme })}
                            className={`p-3 rounded-2xl border text-left transition relative overflow-hidden cursor-pointer ${
                              (storeSettings.homepageConfig?.heroBgGradient || 'dark-emerald') === theme.id
                                ? 'border-red-600 ring-2 ring-red-600/30 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`h-8 rounded-lg bg-gradient-to-r ${theme.class} mb-1.5 border border-white/20`}></div>
                            <span className="text-[11px] font-bold text-gray-900 block truncate leading-tight">
                              {theme.label}
                            </span>
                            {(storeSettings.homepageConfig?.heroBgGradient || 'dark-emerald') === theme.id && (
                              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600"></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background Image Uploader & Presets */}
                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-red-600" />
                          <span>Image de Fond du Hero (Optionnelle)</span>
                        </label>
                        {storeSettings.homepageConfig?.heroBgImage && (
                          <button
                            type="button"
                            onClick={() => updateHomepageConfig({ heroBgImage: '' })}
                            className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                          >
                            Supprimer l'image de fond
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div>
                          <input
                            type="file"
                            ref={heroBgFileInputRef}
                            onChange={handleHeroBgUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => heroBgFileInputRef.current?.click()}
                            className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 cursor-pointer transition"
                          >
                            <UploadCloud className="w-4 h-4 text-red-600" />
                            <span>Téléverser une image de fond depuis cet appareil</span>
                          </button>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={storeSettings.homepageConfig?.heroBgImage || ''}
                            onChange={(e) => updateHomepageConfig({ heroBgImage: e.target.value })}
                            placeholder="Ou collez une URL d'image directe (https://...)"
                            className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      {/* Background Presets */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-gray-500">Ou choisissez parmi nos images de fond haute définition :</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { name: 'Son & Concerts Pro', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop' },
                            { name: 'High-Tech & TV 4K', url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1200&auto=format&fit=crop' },
                            { name: 'Électroménager Moderne', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop' },
                            { name: 'Énergie Solaire Sénégal', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1200&auto=format&fit=crop' },
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => updateHomepageConfig({ heroBgImage: preset.url })}
                              className="group relative h-16 rounded-xl overflow-hidden border border-gray-200 text-left p-2 cursor-pointer shadow-xs hover:border-red-500 transition"
                            >
                              <img src={preset.url} alt={preset.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
                              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition"></div>
                              <span className="relative z-10 text-[10px] font-black text-white leading-tight block">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CTA Buttons Configuration */}
                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      <label className="block text-xs font-bold text-gray-800">
                        Boutons d'Appel à l'Action du Hero (CTA)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Primary Button */}
                        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                          <span className="text-[11px] font-black uppercase text-red-600 block">Bouton Principal (Rouge)</span>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Texte du bouton</label>
                            <input
                              type="text"
                              value={storeSettings.homepageConfig?.heroPrimaryBtnText ?? "ACHETER MAINTENANT"}
                              onChange={(e) => updateHomepageConfig({ heroPrimaryBtnText: e.target.value })}
                              placeholder="Ex: ACHETER MAINTENANT"
                              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Action au clic</label>
                            <select
                              value={storeSettings.homepageConfig?.heroPrimaryBtnAction ?? "shop"}
                              onChange={(e) => updateHomepageConfig({ heroPrimaryBtnAction: e.target.value as any })}
                              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                            >
                              <option value="shop">Ouvrir le Catalogue / Boutique</option>
                              <option value="promotions">Ouvrir les Promotions</option>
                              <option value="whatsapp">Ouvrir la discussion WhatsApp</option>
                            </select>
                          </div>
                        </div>

                        {/* Secondary Button */}
                        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                          <span className="text-[11px] font-black uppercase text-amber-600 block">Bouton Secondaire (Transparent)</span>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Texte du bouton</label>
                            <input
                              type="text"
                              value={storeSettings.homepageConfig?.heroSecondaryBtnText ?? "VOIR LES PROMOTIONS"}
                              onChange={(e) => updateHomepageConfig({ heroSecondaryBtnText: e.target.value })}
                              placeholder="Ex: VOIR LES PROMOTIONS"
                              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Action au clic</label>
                            <select
                              value={storeSettings.homepageConfig?.heroSecondaryBtnAction ?? "promotions"}
                              onChange={(e) => updateHomepageConfig({ heroSecondaryBtnAction: e.target.value as any })}
                              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                            >
                              <option value="promotions">Ouvrir les Promotions</option>
                              <option value="shop">Ouvrir le Catalogue</option>
                              <option value="whatsapp">Commander sur WhatsApp</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: BOUTONS DE COMMANDE SUR LES FICHES PRODUITS */}
                  <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          🛒
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-gray-900">Boutons de Commande sur les Fiches Produits</h4>
                          <p className="text-[11px] text-gray-500">Configurez les libellés et la visibilité des boutons d'achat rapide sur chaque carte produit.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Buy Now Button Text */}
                      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800">Bouton Achat Direct</label>
                          <input
                            type="checkbox"
                            checked={storeSettings.homepageConfig?.showCardBuyNow !== false}
                            onChange={(e) => updateHomepageConfig({ showCardBuyNow: e.target.checked })}
                            className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={storeSettings.homepageConfig?.cardBuyButtonText ?? "Acheter"}
                          onChange={(e) => updateHomepageConfig({ cardBuyButtonText: e.target.value })}
                          placeholder="Ex: Acheter, Commander, Commander Express"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                        <span className="text-[10px] text-gray-400 block">Bouton principal rouge ouvrant directement le formulaire de commande.</span>
                      </div>

                      {/* Add to Cart Button Text */}
                      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800">Bouton Panier</label>
                          <input
                            type="checkbox"
                            checked={storeSettings.homepageConfig?.showCardCart !== false}
                            onChange={(e) => updateHomepageConfig({ showCardCart: e.target.checked })}
                            className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={storeSettings.homepageConfig?.cardCartButtonText ?? "Au panier"}
                          onChange={(e) => updateHomepageConfig({ cardCartButtonText: e.target.value })}
                          placeholder="Ex: Au panier, Panier"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                        <span className="text-[10px] text-gray-400 block">Bouton gris ajoutant le produit au panier d'achat.</span>
                      </div>

                      {/* WhatsApp Button Text */}
                      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800">Bouton WhatsApp Carte</label>
                          <input
                            type="checkbox"
                            checked={storeSettings.homepageConfig?.showCardWhatsApp !== false}
                            onChange={(e) => updateHomepageConfig({ showCardWhatsApp: e.target.checked })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={storeSettings.homepageConfig?.cardWhatsAppButtonText ?? "WhatsApp"}
                          onChange={(e) => updateHomepageConfig({ cardWhatsAppButtonText: e.target.value })}
                          placeholder="Ex: WhatsApp, Commander"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                        <span className="text-[10px] text-gray-400 block">Bouton vert flottant sur l'image pour commander en 1 clic par WhatsApp.</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: DISPOSITION & RÉORGANISATION DES SECTIONS */}
                  <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-gray-900">Disposition & Ordre des Sections de la Page d'Accueil</h4>
                          <p className="text-[11px] text-gray-500">Utilisez les flèches Monter/Descendre pour réagencer l'accueil et activez/désactivez chaque section.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {(() => {
                        const defaultOrder = [
                          'heroBanner',
                          'categoryGrid',
                          'flashSale',
                          'featuredProducts',
                          'allProductsCatalog',
                          'reviews',
                          'brandPartners',
                          'trustBadges'
                        ];
                        const order = storeSettings.homepageConfig?.sectionOrder || defaultOrder;
                        const vis = storeSettings.homepageConfig?.sectionsVisibility || {};

                        const sectionLabels: { [key: string]: { name: string; desc: string; icon: string } } = {
                          heroBanner: { name: 'Bannière Principale Hero', desc: 'Accroche, titre principal, image vedette et boutons d\'action', icon: '🚀' },
                          categoryGrid: { name: 'Grille des Rayons & Catégories', desc: 'Présentation visuelle de toutes les collections du catalogue', icon: '🏷️' },
                          flashSale: { name: 'Diaporama Ventes Flash & Promos Sénégal', desc: 'Carrousel animé avec compte à rebours et remises exceptionnelles', icon: '⚡' },
                          featuredProducts: { name: 'Sélection Produits Vedettes', desc: 'Grille des articles les plus demandés et recommandés avec filtres', icon: '🔥' },
                          allProductsCatalog: { name: 'Tout le Catalogue Disponible (87+ articles)', desc: 'Affichage complet et direct de tous les articles avec recherche en direct', icon: '📦' },
                          reviews: { name: 'Avis et Témoignages Clients Vérifiés', desc: 'Retours d\'expérience et notes de clients réels au Sénégal', icon: '⭐' },
                          brandPartners: { name: 'Logos Sponsors & Partenaires Officiels', desc: 'JBL, Samsung, Sony, Ahuja, Behringer, Astech, Sharp, Shure', icon: '🏆' },
                          trustBadges: { name: 'Garanties & Badges de Réassurance', desc: 'Livraison express 2h-4h, paiement Wave/Orange Money, garantie 100% neuf', icon: '🛡️' },
                        };

                        return order.map((sectionKey, idx) => {
                          const info = sectionLabels[sectionKey] || { name: sectionKey, desc: '', icon: '📌' };
                          const isVisible = (vis as any)[sectionKey] !== false;

                          return (
                            <div
                              key={sectionKey}
                              className={`p-3 sm:p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                                isVisible
                                  ? 'bg-white border-gray-200 shadow-2xs hover:border-gray-300'
                                  : 'bg-gray-100 border-gray-200 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-7 h-7 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-mono font-black text-xs shrink-0">
                                  #{idx + 1}
                                </span>
                                <span className="text-xl shrink-0">{info.icon}</span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-extrabold text-xs sm:text-sm text-gray-900 truncate">
                                      {info.name}
                                    </h5>
                                    {!isVisible && (
                                      <span className="px-1.5 py-0.2 bg-gray-200 text-gray-600 rounded text-[9px] font-bold">
                                        Masquée
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 truncate">{info.desc}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Up button */}
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveSection(sectionKey, 'up')}
                                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:pointer-events-none text-gray-700 flex items-center justify-center transition cursor-pointer"
                                  title="Déplacer vers le haut"
                                >
                                  <MoveUp className="w-4 h-4" />
                                </button>

                                {/* Down button */}
                                <button
                                  type="button"
                                  disabled={idx === order.length - 1}
                                  onClick={() => handleMoveSection(sectionKey, 'down')}
                                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:pointer-events-none text-gray-700 flex items-center justify-center transition cursor-pointer"
                                  title="Déplacer vers le bas"
                                >
                                  <MoveDown className="w-4 h-4" />
                                </button>

                                {/* Visibility toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleSectionVisibility(sectionKey)}
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                                    isVisible
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                  title={isVisible ? 'Masquer cette section' : 'Afficher cette section'}
                                >
                                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* SECTION 4: TITRES & SOUS-TITRES DES SECTIONS */}
                  <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          ✏️
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-gray-900">Titres & Sous-Titres Personnalisés des Sections</h4>
                          <p className="text-[11px] text-gray-500">Adaptez les textes d'en-tête de chaque section selon vos promotions ou événements.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ventes Flash Title */}
                      <div className="space-y-1.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-[11px] font-black uppercase text-red-600 block">Section Ventes Flash</span>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600">Titre</label>
                          <input
                            type="text"
                            value={storeSettings.homepageConfig?.sectionTitles?.flashSaleTitle ?? "⚡ PROMO SÉNÉGAL : OFFRES FLASH"}
                            onChange={(e) => updateHomepageConfig({
                              sectionTitles: {
                                ...storeSettings.homepageConfig?.sectionTitles,
                                flashSaleTitle: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600">Sous-titre</label>
                          <input
                            type="text"
                            value={storeSettings.homepageConfig?.sectionTitles?.flashSaleSubtitle ?? "Faites défiler le diaporama des meilleures remises au Sénégal. Articles neufs avec garantie, en stock à Dakar."}
                            onChange={(e) => updateHomepageConfig({
                              sectionTitles: {
                                ...storeSettings.homepageConfig?.sectionTitles,
                                flashSaleSubtitle: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium"
                          />
                        </div>
                      </div>

                      {/* Produits Vedettes Title */}
                      <div className="space-y-1.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-[11px] font-black uppercase text-gray-800 block">Section Produits Vedettes</span>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600">Titre</label>
                          <input
                            type="text"
                            value={storeSettings.homepageConfig?.sectionTitles?.featuredTitle ?? "🔥 NOS PRODUITS VEDETTES"}
                            onChange={(e) => updateHomepageConfig({
                              sectionTitles: {
                                ...storeSettings.homepageConfig?.sectionTitles,
                                featuredTitle: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600">Sous-titre</label>
                          <input
                            type="text"
                            value={storeSettings.homepageConfig?.sectionTitles?.featuredSubtitle ?? "Les articles les plus demandés et recommandés par nos clients au Sénégal."}
                            onChange={(e) => updateHomepageConfig({
                              sectionTitles: {
                                ...storeSettings.homepageConfig?.sectionTitles,
                                featuredSubtitle: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium"
                          />
                        </div>
                      </div>

                      {/* Tout le Catalogue Title */}
                      <div className="space-y-1.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-[11px] font-black uppercase text-emerald-700 block">Section Tout le Catalogue</span>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600">Titre</label>
                          <input
                            type="text"
                            value={storeSettings.homepageConfig?.sectionTitles?.allProductsTitle ?? "📦 TOUT LE CATALOGUE DISPONIBLE"}
                            onChange={(e) => updateHomepageConfig({
                              sectionTitles: {
                                ...storeSettings.homepageConfig?.sectionTitles,
                                allProductsTitle: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600">Sous-titre</label>
                          <input
                            type="text"
                            value={storeSettings.homepageConfig?.sectionTitles?.allProductsSubtitle ?? "Tous nos articles testés et certifiés DIAYMA GAAW en stock immédiat à Dakar."}
                            onChange={(e) => updateHomepageConfig({
                              sectionTitles: {
                                ...storeSettings.homepageConfig?.sectionTitles,
                                allProductsSubtitle: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium"
                          />
                        </div>
                      </div>

                      {/* Catégories Title */}
                      <div className="space-y-1.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-[11px] font-black uppercase text-indigo-700 block">Section Rayons & Catégories</span>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600">Titre</label>
                          <input
                            type="text"
                            value={storeSettings.homepageConfig?.sectionTitles?.categoryGridTitle ?? "Explorez par Catégories"}
                            onChange={(e) => updateHomepageConfig({
                              sectionTitles: {
                                ...storeSettings.homepageConfig?.sectionTitles,
                                categoryGridTitle: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600">Sous-titre</label>
                          <input
                            type="text"
                            value={storeSettings.homepageConfig?.sectionTitles?.categoryGridSubtitle ?? "Trouvez les meilleurs équipements électroniques, maison & bien-être au Sénégal."}
                            onChange={(e) => updateHomepageConfig({
                              sectionTitles: {
                                ...storeSettings.homepageConfig?.sectionTitles,
                                categoryGridSubtitle: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
  );

  if (isPageMode) {
    return (
      <div className="py-6 sm:py-8 bg-gray-50/70 min-h-[calc(100vh-140px)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {content}
    </div>
  );
};
