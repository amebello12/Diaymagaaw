import { Product, Category, DeliveryZone, Review, StoreSettings, Order, PromoCode } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'telephones-accessoires',
    name: 'Téléphones & Accessoires',
    slug: 'telephones-accessoires',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
    itemCount: 24,
    description: 'Smartphones récents, écouteurs, coques et chargeurs rapides'
  },
  {
    id: 'informatique',
    name: 'Informatique',
    slug: 'informatique',
    icon: 'Laptop',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
    itemCount: 18,
    description: 'Ordinateurs portables, claviers, souris, écrans et stockage'
  },
  {
    id: 'tv-audio',
    name: 'TV & Audio',
    slug: 'tv-audio',
    icon: 'Tv',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
    itemCount: 15,
    description: 'Smart TV 4K, barres de son, enceintes Bluetooth puissantes'
  },
  {
    id: 'electromenager',
    name: 'Électroménager',
    slug: 'electromenager',
    icon: 'Refrigerator',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800&auto=format&fit=crop',
    itemCount: 32,
    description: 'Réfrigérateurs, micro-ondes, mixeurs haute puissance et climatiseurs'
  },
  {
    id: 'maison',
    name: 'Maison',
    slug: 'maison',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    itemCount: 20,
    description: 'Décoration, literie, rangements et luminaires modernes'
  },
  {
    id: 'sante-bien-etre',
    name: 'Santé & Bien-être',
    slug: 'sante-bien-etre',
    icon: 'HeartPulse',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
    itemCount: 28,
    description: 'Pistolets de massage, tensiomètres, soins de la peau et diffuseurs'
  },
  {
    id: 'accessoires',
    name: 'Accessoires',
    slug: 'accessoires',
    icon: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    itemCount: 40,
    description: 'Montres connectées, Powerbanks haute capacité et câbles renforcés'
  },
  {
    id: 'promotions',
    name: 'Promotions Flash',
    slug: 'promotions',
    icon: 'Flame',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
    itemCount: 16,
    description: 'Réductions exclusives jusqu’à -50% pour un temps limité'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Smartphone Galaxy S24 Ultra 256Go 5G - Noir Titane',
    slug: 'smartphone-galaxy-s24-ultra-256go-5g',
    category: 'telephones-accessoires',
    price: 645000,
    originalPrice: 720000,
    discountPercent: 10,
    rating: 4.9,
    reviewsCount: 38,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Le summum de la technologie mobile. Doté de l’intelligence artificielle Galaxy AI, d’un écran Dynamic AMOLED 2X 120Hz et d’un capteur photo 200 MP ultra précis. Coque en titane résistant et autonomie record de 2 jours.',
    features: [
      'Écran 6.8 pouces QHD+ AMOLED 120Hz',
      'Processeur Snapdragon 8 Gen 3',
      'Capteur 200 MP avec zoom optique 5x et 100x Space Zoom',
      'Batterie 5000 mAh avec charge ultra-rapide 45W',
      'S-Pen intégré pour la prise de note et la retouche'
    ],
    stock: 15,
    isFeatured: true,
    isFlashSale: true,
    isNew: true,
    brand: 'Samsung',
    sku: 'DG-SAM-S24U',
    warranty: '12 mois de garantie officielle'
  },
  {
    id: 'prod-2',
    name: 'Robot Mixeur Blender Professionnel 4500W Haute Vitesse 2L',
    slug: 'robot-mixeur-blender-professionnel-4500w',
    category: 'electromenager',
    price: 27500,
    originalPrice: 42000,
    discountPercent: 35,
    rating: 4.8,
    reviewsCount: 84,
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Le blender ultra puissant indispensable pour vos jus de bissap, bouye, smoothies, soupes et broyage de céréales dures ou glace pilée en quelques secondes. Bol incassable de 2 litres sans BPA.',
    features: [
      'Moteur en cuivre pur 4500 Watts ultra robuste',
      'Lames en acier inoxydable japonais 6 couteaux',
      'Bol haute capacité 2.0 Litres incassable',
      'Variateur de vitesse + fonction Pulse / Glace',
      'Idéal pour usage domestique et restauration rapide'
    ],
    stock: 20,
    isFeatured: true,
    isFlashSale: true,
    brand: 'SilverCrest Pro',
    sku: 'DG-ELM-BLD45',
    warranty: '6 mois de garantie pièces'
  },
  {
    id: 'prod-3',
    name: 'Smart TV 55 pouces 4K UHD Frameless avec Netflix & YouTube',
    slug: 'smart-tv-55-pouces-4k-uhd-frameless',
    category: 'tv-audio',
    price: 215000,
    originalPrice: 260000,
    discountPercent: 17,
    rating: 4.7,
    reviewsCount: 29,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552975084-6e027cd345c2?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Profitez d’une immersion cinématographique totale avec cette Smart TV sans bordure. Résolution 4K HDR10, connectivité Wi-Fi rapide, compatible TNT sénégalaise, récepteur satellite intégré et son Dolby Audio.',
    features: [
      'Écran 55 pouces 4K Ultra HD (3840 x 2160 pixels)',
      'Design ultra-fin sans bordure métallique',
      'Applications préinstallées : Netflix, YouTube, Prime Video',
      '3 ports HDMI, 2 ports USB, Wi-Fi 5G & Bluetooth 5.0',
      'Décodeur TNT et Satellite intégré'
    ],
    stock: 15,
    isFeatured: true,
    brand: 'Hisense',
    sku: 'DG-TVA-55UHD',
    warranty: '12 mois de garantie avec SAV local'
  },
  {
    id: 'prod-4',
    name: 'Pistolet de Massage Musculaire Thérapeutique 30 Vitesses + 6 Têtes',
    slug: 'pistolet-massage-musculaire-therapeutique',
    category: 'sante-bien-etre',
    price: 18500,
    originalPrice: 28000,
    discountPercent: 34,
    rating: 4.9,
    reviewsCount: 52,
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Soulagez immédiatement les tensions du dos, des épaules et des jambes après une longue journée ou une séance de sport. Moteur silencieux haute percussion et batterie rechargeable longue durée.',
    features: [
      '30 niveaux d’intensité réglables avec écran tactile LCD',
      '6 embouts interchangeables adaptés à chaque groupe musculaire',
      'Batterie Lithium 2500mAh offrant 6 heures d’autonomie',
      'Technologie silencieuse QuietGlide <45dB',
      'Mallette de transport de luxe incluse'
    ],
    stock: 22,
    isFeatured: true,
    isFlashSale: true,
    brand: 'TheraPro',
    sku: 'DG-SBE-PSTM30',
    warranty: '3 mois de remplacement'
  },
  {
    id: 'prod-5',
    name: 'Power Bank Solaire 30 000 mAh Charge Rapide 22.5W avec Torche LED',
    slug: 'power-bank-solaire-30000-mah-charge-rapide',
    category: 'accessoires',
    price: 14500,
    originalPrice: 22000,
    discountPercent: 34,
    rating: 4.8,
    reviewsCount: 97,
    images: [
      'https://images.unsplash.com/photo-1609592424376-7975d9e50e93?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Ne soyez plus jamais à court de batterie lors de vos déplacements ou coupures de courant. Batterie externe haute capacité équipée de 4 câbles intégrés (Type-C, Lightning, Micro-USB, USB-A) et d’un panneau de recharge solaire d’appoint.',
    features: [
      'Capacité réelle 30 000 mAh (recharge 6 à 8 fois un smartphone)',
      '4 câbles de charge intégrés, plus besoin d’apporter de câble',
      'Panneau solaire intégré pour les urgences',
      'Double torche LED puissante pour les coupures de courant',
      'Affichage numérique précis du pourcentage de batterie'
    ],
    stock: 35,
    isFeatured: true,
    brand: 'Orico Fast',
    sku: 'DG-ACC-PB30K',
    warranty: '6 mois de garantie'
  },
  {
    id: 'prod-6',
    name: 'Écouteurs Sans Fil Bluetooth 5.3 avec Réduction de Bruit Active ANC',
    slug: 'ecouteurs-sans-fil-bluetooth-anc',
    category: 'accessoires',
    price: 12500,
    originalPrice: 19000,
    discountPercent: 34,
    rating: 4.6,
    reviewsCount: 63,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Une qualité audio cristalline avec basses profondes. Réduction active des bruits environnants pour vos appels téléphoniques et musiques dans les transports ou au bureau. Boîtier de charge compact avec indicateur LED.',
    features: [
      'Bluetooth 5.3 avec connexion instantanée dès ouverture',
      'Autonomie de 32 heures avec le boîtier de charge',
      'Microphones HD avec réduction intelligente du vent et des bruits',
      'Commandes tactiles intuitives et résistance à la sueur IPX5',
      'Compatible iPhone, Android, PC et Mac'
    ],
    stock: 19,
    isFeatured: false,
    brand: 'SoundCore',
    sku: 'DG-ACC-TWS90',
    warranty: '3 mois de garantie'
  },
  {
    id: 'prod-7',
    name: 'Ordinateur Portable Ultra-Slim 15.6" Full HD - Intel Core i5 16Go RAM / 512Go SSD',
    slug: 'ordinateur-portable-ultra-slim-i5-16go-512go',
    category: 'informatique',
    price: 295000,
    originalPrice: 350000,
    discountPercent: 16,
    rating: 4.9,
    reviewsCount: 19,
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'L’outil parfait pour le travail de bureau, les études universitaires, le graphisme et la gestion commerciale. Finition aluminium brossé, clavier rétroéclairé avec pavé numérique et autonomie de 9 heures.',
    features: [
      'Processeur Intel Core i5 12e Génération 10 cœurs',
      'Mémoire vive 16 Go DDR4 ultra-fluide',
      'Stockage SSD NVMe 512 Go (démarrage en 5 secondes)',
      'Écran 15.6 pouces IPS Full HD antireflet',
      'Windows 11 Pro préactivé avec Pack Office inclus'
    ],
    stock: 14,
    isFeatured: true,
    brand: 'Lenovo',
    sku: 'DG-INF-NB15I5',
    warranty: '12 mois de garantie'
  },
  {
    id: 'prod-8',
    name: 'Friteuse Sans Huile Air Fryer XXL 8 Litres Digital Tactile 1800W',
    slug: 'air-fryer-xxl-8-litres-digital-tactile',
    category: 'electromenager',
    price: 38500,
    originalPrice: 55000,
    discountPercent: 30,
    rating: 4.9,
    reviewsCount: 45,
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Cuisinez sainement avec 85% d’huile en moins ! Poulet rôti entier, frites croustillantes, poisson braisé, gâteaux et pastels dorés sans fumée ni projection. Capacité familiale généreuse.',
    features: [
      'Grande cuve antiadhésive XXL de 8 Litres (poulet entier jusqu’à 2.5 kg)',
      'Écran tactile LED avec 8 programmes automatiques prédéfinis',
      'Minuterie réglable jusqu’à 60 minutes avec arrêt automatique',
      'Chauffage par circulation d’air chaud 360° ultra rapide',
      'Nettoyage facile au lave-vaisselle'
    ],
    stock: 18,
    isFeatured: true,
    isFlashSale: true,
    brand: 'Ninja Pro',
    sku: 'DG-ELM-AF8L',
    warranty: '6 mois de garantie'
  }
];

export const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'dakar-centre',
    name: 'Dakar Centre & Plateau / Médina / Almadies / Ngor / Ouakam / Mermoz',
    price: 1500,
    estimatedTime: 'Livraison express en 2 à 4 heures',
    description: 'Dakar intra-muros : Plateau, Médina, Fann, Point E, Mermoz, Sacré-Cœur, Almadies, Ngor, Yoff, Ouakam.',
    regions: ['Dakar']
  },
  {
    id: 'dakar-banlieue',
    name: 'Banlieue de Dakar (Parcelles, Guédiawaye, Pikine, Keur Massar, Rufisque)',
    price: 2000,
    estimatedTime: 'Livraison le jour même (4 à 8 heures)',
    description: 'Grand Dakar et banlieue : Parcelles Assainies, Grand Yoff, Guédiawaye, Pikine, Thiaroye, Keur Massar, Rufisque, Diamniadio.',
    regions: ['Dakar', 'Rufisque']
  },
  {
    id: 'thies-mbour',
    name: 'Thiès, Mbour, Saly, Somone & Petite Côte',
    price: 3000,
    estimatedTime: 'Livraison en 24h par transporteur partenaire',
    description: 'Thiès ville, Mbour, Saly Portudal, Somone, Popenguine, Ndayane, Tivaouane.',
    regions: ['Thiès']
  },
  {
    id: 'senegal-regions',
    name: 'Autres Régions du Sénégal (Saint-Louis, Touba, Kaolack, Ziguinchor, etc.)',
    price: 4000,
    estimatedTime: 'Livraison sous 24 à 48 heures sécurisée',
    description: 'Saint-Louis, Diourbel, Touba, Louga, Kaolack, Fatick, Kaffrine, Tambacounda, Kédougou, Kolda, Sédhiou, Ziguinchor.',
    regions: ['Saint-Louis', 'Diourbel', 'Touba', 'Kaolack', 'Louga', 'Fatick', 'Kaffrine', 'Tambacounda', 'Ziguinchor', 'Kolda']
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-2',
    authorName: 'Fatou Bintou Diop',
    city: 'Dakar (Sacré-Cœur)',
    rating: 5,
    date: '18 Août 2026',
    comment: 'Franchement le blender est d’une puissance incroyable ! J’ai broyé des fruits secs et fait du jus de bouye sans aucun morceau. Livré en moins de 3h chez moi et payé par Wave au livreur.',
    verifiedPurchase: true
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    authorName: 'Mamadou Lamine Ndiaye',
    city: 'Dakar (Almadies)',
    rating: 5,
    date: '14 Août 2026',
    comment: 'Téléphone 100% original neuf scellé avec facture et garantie. Le service client sur WhatsApp est très réactif et professionnel. Je recommande DIAYMA GAAW sans hésiter !',
    verifiedPurchase: true
  },
  {
    id: 'rev-3',
    productId: 'prod-5',
    authorName: 'Awa Sène',
    city: 'Thiès',
    rating: 5,
    date: '09 Août 2026',
    comment: 'Powerbank très solide avec les 4 câbles directement intégrés, très pratique pour ne rien oublier. La torche éclaire très fort. Reçue le lendemain à Thiès.',
    verifiedPurchase: true
  },
  {
    id: 'rev-4',
    productId: 'prod-8',
    authorName: 'Cheikh Tidiane Fall',
    city: 'Touba',
    rating: 5,
    date: '02 Août 2026',
    comment: 'Air Fryer parfait pour faire frire le poulet sans une seule goutte d’huile. Très économique et cuit super vite. Bravo pour le sérieux.',
    verifiedPurchase: true
  },
  {
    id: 'rev-5',
    productId: 'prod-4',
    authorName: 'Seynabou Diallo',
    city: 'Dakar (Mermoz)',
    rating: 5,
    date: '28 Juillet 2026',
    comment: 'Livraison express reçue en moins de 2h chrono après commande par WhatsApp. Le produit correspond exactement à la description. Service impeccable !',
    verifiedPurchase: true
  },
  {
    id: 'rev-6',
    productId: 'prod-3',
    authorName: 'Ousmane Ba',
    city: 'Saint-Louis',
    rating: 4,
    date: '21 Juillet 2026',
    comment: 'Très bon article et bon rapport qualité-prix. Arrivé bien emballé par le transporteur régional à Saint-Louis. Paiement Orange Money facile.',
    verifiedPurchase: true
  }
];

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    code: 'BIENVENUE10',
    discountPercent: 10,
    description: '10% de réduction pour votre 1ère commande'
  },
  {
    code: 'GAAW15',
    discountPercent: 15,
    description: '15% de réduction spéciale express'
  },
  {
    code: 'DAKAR20',
    discountPercent: 20,
    description: '20% de remise spéciale Dakar'
  }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'DIAYMA GAAW',
  slogan: 'Les bons produits au bon prix - N°1 E-commerce au Sénégal',
  phone: '707717281',
  whatsappPhone: '707717281',
  email: 'contact@diaymagaaw.sn',
  address: 'Sacré-Cœur 3, VDN, Dakar, Sénégal',
  currency: 'FCFA',
  freeShippingThreshold: 60000,
  enableWave: true,
  enableOrangeMoney: true,
  enableFreeMoney: true,
  enableCashOnDelivery: true,
  orderNoticeEmail: 'commandes@diaymagaaw.sn',
  deliveryNotificationWhatsApp: true,
  showAdminLockInFooter: false
};

