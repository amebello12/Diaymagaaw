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
  Loader2
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Product, Category, Order, PromoCode, DeliveryZone, StoreSettings } from '../types';
import { formatFCFA, STORE_PHONE_RAW } from '../utils/currency';
import { INITIAL_STORE_SETTINGS } from '../data/initialData';
import { WaveLogo, OrangeMoneyLogo, FreeMoneyLogo, CashOnDeliveryLogo } from './PaymentLogos';

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
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
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
  orders: Order[];
  promoCodes?: PromoCode[];
  deliveryZones?: DeliveryZone[];
  settings?: StoreSettings;
  onUpdateSettings?: (settings: StoreSettings) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  onDeleteOrder?: (orderId: string) => void;
  onAddPromoCode?: (promo: PromoCode) => void;
  onDeletePromoCode?: (code: string) => void;
  onOpenExportShopify: () => void;
  onResetData?: () => void;
  onUpdateDeliveryZone?: (zoneId: string, updated: Partial<DeliveryZone>) => void;
  onAddDeliveryZone?: (newZone: DeliveryZone) => void;
  onDeleteDeliveryZone?: (zoneId: string) => void;
  onResetDeliveryZones?: () => void;
  onResetDashboardStats?: () => void;
  onResetStockAlerts?: () => void;
  onResetAllAdmin?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  isPageMode = false,
  onClose,
  products,
  categories,
  orders,
  promoCodes = [],
  deliveryZones = [],
  settings,
  onUpdateSettings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddPromoCode,
  onDeletePromoCode,
  onOpenExportShopify,
  onResetData,
  onUpdateDeliveryZone,
  onAddDeliveryZone,
  onDeleteDeliveryZone,
  onResetDeliveryZones,
  onResetDashboardStats,
  onResetStockAlerts,
  onResetAllAdmin
}) => {
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
  const [tab, setTab] = useState<'dashboard' | 'products' | 'orders' | 'promos' | 'delivery' | 'settings'>('dashboard');

  // Product Filtering & Form State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);

  // Form fields for Add/Edit Product
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.slug || 'telephones-accessoires');
  const [formPrice, setFormPrice] = useState(25000);
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

  // Order filtering
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Promo Form State
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(10);
  const [newPromoDesc, setNewPromoDesc] = useState('');

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

  const handleTriggerResetAllAdmin = () => {
    if (window.confirm("Voulez-vous réinitialiser complètement le panneau d'administration (Chiffre d'affaires à 0 FCFA, 0 commande, stocks sains, tarifs par défaut) ?")) {
      onResetAllAdmin?.();
      setResetFeedback("Tout le panneau d'administration a été réinitialisé avec succès !");
      setTimeout(() => setResetFeedback(null), 4000);
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
  };

  // Quick Toggle Flash Sale
  const handleToggleFlashSale = (prod: Product) => {
    onUpdateProduct({ ...prod, isFlashSale: !prod.isFlashSale });
  };

  // Quick Toggle Featured
  const handleToggleFeatured = (prod: Product) => {
    onUpdateProduct({ ...prod, isFeatured: !prod.isFeatured });
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

    if (isAddingNewProduct) {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name: formName.trim(),
        slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: formCategory,
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
    } else if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formName.trim(),
        category: formCategory,
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
    }
  };

  // Add Promo Code
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim() || !onAddPromoCode) return;
    onAddPromoCode({
      code: newPromoCode.trim().toUpperCase(),
      discountPercent: Number(newPromoDiscount),
      description: newPromoDesc.trim() || `Réduction de ${newPromoDiscount}% au panier`
    });
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
    return matchesSearch && matchesCategory;
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

        {/* IF NOT AUTHENTICATED: LOGIN VIEW */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
              
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <BrandLogo size="lg" />
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
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
                          <span className="text-xs font-bold text-white block">Réinitialisation Complète</span>
                          <span className="text-[11px] text-gray-300 block">Dashboard, stocks et tarifs</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
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
                        {lowStockProducts.length > 0 ? `${lowStockProducts.length} article(s) à réapprovisionner` : '0 alerte • Tous les stocks sont suffisants'}
                      </p>
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
                        {lowStockProducts.map(p => (
                          <div key={p.id} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
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
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-red-600"
                      >
                        <option value="all">Toutes les catégories</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {!isAddingNewProduct && !editingProduct && (
                      <button
                        onClick={startAddNew}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter un produit</span>
                      </button>
                    )}
                  </div>

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
                          <label className="block text-xs font-bold text-gray-700 mb-1">Catégorie / Rayon *</label>
                          <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.slug}>{c.name}</option>
                            ))}
                          </select>
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
                            <th className="p-3.5">Catégorie</th>
                            <th className="p-3.5">Prix FCFA</th>
                            <th className="p-3.5">Stock</th>
                            <th className="p-3.5">Badges</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-gray-50/80 transition">
                              <td className="p-3.5 flex items-center gap-3">
                                <img src={prod.images[0]} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-50 border shrink-0" />
                                <div>
                                  <span className="font-bold text-gray-900 block line-clamp-1">{prod.name}</span>
                                  <span className="text-[11px] text-gray-400 font-mono">SKU: {prod.sku}</span>
                                </div>
                              </td>

                              <td className="p-3.5 text-gray-600">
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                                  {prod.category}
                                </span>
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

                    {filteredProducts.length === 0 && (
                      <div className="p-8 text-center text-xs text-gray-500">
                        Aucun article ne correspond à votre recherche "{productSearch}".
                      </div>
                    )}
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
                  
                  {/* Create New Promo Code Form */}
                  <form onSubmit={handleSavePromo} className="p-5 bg-amber-50/50 rounded-3xl border border-amber-200 space-y-4">
                    <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span>Créer un nouveau Code Promotionnel</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Code Promo *</label>
                        <input
                          type="text"
                          required
                          value={newPromoCode}
                          onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                          placeholder="ex: TABASKI2026, GAAW20"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-mono font-bold uppercase focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Remise en % *</label>
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Description / Condition</label>
                        <input
                          type="text"
                          value={newPromoDesc}
                          onChange={(e) => setNewPromoDesc(e.target.value)}
                          placeholder="ex: -10% sur tout le panier"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter le code promo</span>
                      </button>
                    </div>
                  </form>

                  {/* Active Promo Codes List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-gray-900">Codes promotionnels actifs au Sénégal</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {promoCodes.map((p, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                {p.code}
                              </span>
                              <span className="font-extrabold text-xs text-gray-900">
                                -{p.discountPercent}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">{p.description}</p>
                          </div>

                          {onDeletePromoCode && (
                            <button
                              onClick={() => onDeletePromoCode(p.code)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
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
                    
                    {/* 1. Store Identity */}
                    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-4">
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
