import { Product, Category, DeliveryZone, Review, StoreSettings, Order, PromoCode } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'sonorisation-amplificateur',
    name: 'Sonorisation & Amplificateur',
    slug: 'sonorisation-amplificateur',
    icon: 'Speaker',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
    itemCount: 16,
    description: 'Baffles amplifiés, tables de mixage, amplificateurs de puissance et micros professionnels'
  },
  {
    id: 'solaire-energie',
    name: 'Solaire & Énergie',
    slug: 'solaire-energie',
    icon: 'Sun',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop',
    itemCount: 22,
    description: 'Kits solaires complets, panneaux photovoltaïques, onduleurs hybrides et éclairage autonome'
  },
  {
    id: 'photo-video-numerique',
    name: 'Photo & Vidéo Numérique',
    slug: 'photo-video-numerique',
    icon: 'Camera',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
    itemCount: 15,
    description: 'Appareils photo numériques, caméras 4K, stabilisateurs gimbals et éclairages studio'
  },
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
    itemCount: 18,
    description: 'Smart TV 4K/8K, barres de son, home cinéma et enceintes Bluetooth puissantes'
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
  },
  {
    id: 'prod-sono-1',
    name: 'Enceinte de Soirée Amplifiée JBL PartyBox 310 - 240W RMS & Jeux de Lumières',
    slug: 'enceinte-amplifiee-jbl-partybox-310-240w',
    category: 'sonorisation-amplificateur',
    price: 385000,
    originalPrice: 420000,
    discountPercent: 8,
    rating: 4.9,
    reviewsCount: 24,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Son JBL Pro surpuissant de 240W avec effets lumineux dynamiques synchronisés au rythme de la musique. Batterie rechargeable offrant jusqu\'à 18h d\'autonomie. Entrées pour micro et guitare pour concerts et animations karaoké.',
    features: [
      'Puissance sonore explosive de 240 Watts RMS',
      'Jeux de lumières dynamiques avec effets stroboscopiques',
      'Batterie longue durée 18h avec poignée télescopique et roulettes',
      'Résistant aux éclaboussures norme IPX4',
      'Double entrée Jack micro/guitare avec réglage du gain'
    ],
    stock: 8,
    isFeatured: true,
    brand: 'JBL Pro',
    sku: 'DG-SONO-PB310',
    warranty: '1 an de garantie'
  },
  {
    id: 'prod-sono-2',
    name: 'Amplificateur Professionnel Stéréo 2x500W avec Bluetooth, USB & Réglages DSP',
    slug: 'amplificateur-pro-stereo-2x500w-dsp',
    category: 'sonorisation-amplificateur',
    price: 185000,
    originalPrice: 220000,
    discountPercent: 15,
    rating: 4.8,
    reviewsCount: 17,
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Amplificateur de puissance haute fidélité pour sonorisation de cérémonies, salles de fête et espaces extérieurs. Équipé d\'un récepteur Bluetooth 5.0, port USB/SD et protection thermique anti-surtension.',
    features: [
      'Puissance continue 2x 500W sous 4 Ohms / 2x 350W sous 8 Ohms',
      'Entrées XLR, Jack 6.35mm et RCA pour toutes tables de mixage',
      'Refroidissement par double ventilateur silencieux haute efficacité',
      'Affichage LED du niveau sonore (VU-mètre) et protection anti-court-circuit'
    ],
    stock: 6,
    isFeatured: true,
    brand: 'Yamaha Audio',
    sku: 'DG-SONO-AMP500',
    warranty: '1 an de garantie'
  },
  {
    id: 'prod-tv-1',
    name: 'Smart TV Samsung 55" QLED 4K 2024 - Quantum HDR, Dolby Atmos & AirPlay',
    slug: 'smart-tv-samsung-55-qled-4k',
    category: 'tv-audio',
    price: 425000,
    originalPrice: 480000,
    discountPercent: 11,
    rating: 4.9,
    reviewsCount: 31,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Plongez au cœur de l\'image avec la technologie Quantum Dot délivrant 100% du volume couleur. Processeur Quantum 4K avec intelligence artificielle, design ultra fin sans bordure et applications intégrées (Netflix, YouTube, IPTV).',
    features: [
      'Dalle 55 pouces (140 cm) 4K Ultra HD QLED 120Hz',
      'Technologie Quantum HDR et son immersif Dolby Atmos',
      'Système Tizen OS avec commande vocale et Gaming Hub',
      'Télécommande écologique rechargeable à l\'énergie solaire',
      'Connectique complète : 3x HDMI, 2x USB, Wi-Fi 5GHz & Bluetooth'
    ],
    stock: 7,
    isFeatured: true,
    brand: 'Samsung',
    sku: 'DG-TV-QLED55',
    warranty: '2 ans de garantie'
  },
  {
    id: 'prod-tv-2',
    name: 'Home Cinéma Barre de Son 5.1 Surround Sans Fil 600W avec Caisson de Basse',
    slug: 'barre-de-son-home-cinema-5-1-600w',
    category: 'tv-audio',
    price: 215000,
    originalPrice: 250000,
    discountPercent: 14,
    rating: 4.8,
    reviewsCount: 22,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Transformez votre salon en véritable salle de cinéma. Ensemble home cinéma 5.1 composé d\'une barre de son haute clarté, d\'un subwoofer caisson de basse sans fil puissant et de 2 enceintes arrière pour une spatialisation totale.',
    features: [
      'Puissance totale dynamique de 600 Watts',
      'Décodeur audio Dolby Digital et DTS Surround',
      'Caisson de basse sans fil pour des explosions et graves profonds',
      'Connexion HDMI eARC, Optique et Bluetooth instantané'
    ],
    stock: 9,
    isFeatured: true,
    brand: 'Sony Audio',
    sku: 'DG-TV-SOUND51',
    warranty: '1 an de garantie'
  },
  {
    id: 'prod-sol-1',
    name: 'Kit Solaire Autonome Complet 1500W : Onduleur Hybride 24V + 2 Panneaux 450W + Batterie Gel 200Ah',
    slug: 'kit-solaire-autonome-complet-1500w',
    category: 'solaire-energie',
    price: 545000,
    originalPrice: 620000,
    discountPercent: 12,
    rating: 4.9,
    reviewsCount: 19,
    images: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Alimentez votre maison en continu sans vous soucier des délestages ou coupures de courant ! Kit complet capable d\'alimenter réfrigérateur, téléviseur, ventilateurs, éclairage complet et chargeurs d\'ordinateurs 24h/24.',
    features: [
      'Onduleur hybride pur sinus 24V 1500W avec régulateur MPPT 60A',
      '2 Panneaux photovoltaïques monocristallins 450W haute efficacité',
      'Batterie Gel solaire à décharge profonde 12V 200Ah longue durée',
      'Câblage complet résistant aux UV et disjoncteurs de sécurité inclus'
    ],
    stock: 5,
    isFeatured: true,
    brand: 'Felicity Solar',
    sku: 'DG-SOL-KIT1500',
    warranty: '2 ans de garantie'
  },
  {
    id: 'prod-sol-2',
    name: 'Pack 2 Projecteurs Solaires LED 400W Extérieurs Étanches IP67 avec Télécommande',
    slug: 'pack-2-projecteurs-solaires-led-400w',
    category: 'solaire-energie',
    price: 52000,
    originalPrice: 68000,
    discountPercent: 23,
    rating: 4.8,
    reviewsCount: 46,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Éclairez votre cour, devanture, garage ou jardin avec 0 FCFA de facture d\'électricité. S\'allume automatiquement au coucher du soleil et s\'éteint à l\'aube. Grande portée d\'éclairage de 150 m² par projecteur.',
    features: [
      'Éclairage LED ultra lumineux 400W avec 384 puces LED SMD',
      'Batterie lithium LiFePO4 assurant 14 à 16h d\'éclairage par nuit',
      'Résistance totale aux intempéries, fortes pluies et poussières IP67',
      'Télécommande multifonction avec programmation de minuterie (3h, 5h, 8h)'
    ],
    stock: 28,
    isFeatured: false,
    brand: 'SunLight Pro',
    sku: 'DG-SOL-PROJ400',
    warranty: '1 an de garantie'
  },
  {
    id: 'prod-photo-1',
    name: 'Appareil Photo Numérique Hybride 4K Mirrorless 24.2 MP avec Objectif 18-55mm',
    slug: 'appareil-photo-hybride-4k-mirrorless-24mp',
    category: 'photo-video-numerique',
    price: 520000,
    originalPrice: 580000,
    discountPercent: 10,
    rating: 4.9,
    reviewsCount: 14,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Capteur APS-C 24.2 mégapixels haute sensibilité et enregistrement vidéo cinématographique 4K 30p / Full HD 120p. Autofocus ultra rapide avec suivi des yeux et écran orientable à 180° pour le vlog et les portraits.',
    features: [
      'Capteur CMOS 24.2 MP avec processeur d\'image dernière génération',
      'Vidéo 4K HDR sans crop et ralenti 120 fps Full HD',
      'Écran tactile orientable 3 pouces idéal pour selfies et vlogs',
      'Connexion sans fil Wi-Fi et Bluetooth pour transfert instantané sur smartphone',
      'Objectif zoom stabilisé 18-55mm f/3.5-5.6 inclus dans le coffret'
    ],
    stock: 4,
    isFeatured: true,
    brand: 'Sony Alpha',
    sku: 'DG-PHO-MIRROR24',
    warranty: '2 ans de garantie'
  },
  {
    id: 'prod-photo-2',
    name: 'Kit Studio Vidéo & Vlog : Ring Light 19" 60W + Trépied Pro 2m + 2 Micros Sans Fil',
    slug: 'kit-studio-vlog-ring-light-micros-sans-fil',
    category: 'photo-video-numerique',
    price: 58000,
    originalPrice: 75000,
    discountPercent: 22,
    rating: 4.8,
    reviewsCount: 39,
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Le kit incontournable pour les créateurs de contenu sur TikTok, Instagram, YouTube et ventes en direct. Anneau lumineux bicolore à intensité réglable, trépied métallique robuste et micros cravates sans fil avec réduction de bruit.',
    features: [
      'Ring Light LED 19 pouces (48 cm) à température variable (3000K - 6500K)',
      'Trépied en aluminium renforcé réglable jusqu\'à 2m10 de hauteur',
      'Paire de micros cravate sans fil Type-C & Lightning longue portée 20m',
      'Support multi-smartphones pour diffuser sur plusieurs plateformes simultanément'
    ],
    stock: 22,
    isFeatured: true,
    brand: 'StudioVlog Pro',
    sku: 'DG-PHO-KITSTUDIO',
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

