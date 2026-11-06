import { Product, Category } from '../types';

export interface CatalogParseResult {
  products: Product[];
  categories: Category[];
  totalParsed: number;
  errors: string[];
}

/**
 * Normalise un nom de catégorie ou de slug
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Extrait les nombres d'un prix même avec devise (ex: "25 000 FCFA", "15000 XOF", "45,000")
 */
function parsePrice(value: any): number {
  if (typeof value === 'number') return Math.round(value);
  if (!value) return 0;
  const cleaned = String(value)
    .replace(/[^\d.,]/g, '')
    .replace(/\s+/g, '')
    .replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Analyse une ligne CSV en tenant compte des guillemets
 */
function parseCsvLine(line: string, delimiter = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Détecte le séparateur CSV le plus probable (, ou ;)
 */
function detectCsvDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  return ',';
}

/**
 * Parse un fichier CSV ou JSON de catalogue produits
 */
export function parseCatalogFileContent(content: string, existingCategories: Category[] = []): CatalogParseResult {
  const trimmed = content.trim();
  const errors: string[] = [];
  const parsedProducts: Product[] = [];
  const newCategoriesMap = new Map<string, Category>();

  // Si c'est du JSON
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed);
      const rawList: any[] = Array.isArray(data) ? data : (data.products || data.items || [data]);

      rawList.forEach((item, index) => {
        try {
          const name = String(item.name || item.title || item.nom || `Article ${index + 1}`).trim();
          const price = parsePrice(item.price || item.prix || item.sale_price || 0);
          const originalPrice = parsePrice(item.originalPrice || item.original_price || item.compare_at_price || 0);
          const categoryName = String(item.category || item.categorie || item.fb_product_category || item.google_product_category || 'Divers').trim();
          const categorySlug = slugify(categoryName);

          const images: string[] = [];
          if (Array.isArray(item.images)) {
            images.push(...item.images.filter(Boolean));
          } else if (item.image_link || item.image || item.photo) {
            images.push(String(item.image_link || item.image || item.photo).trim());
          }
          if (images.length === 0) {
            images.push('https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop');
          }

          const features: string[] = Array.isArray(item.features)
            ? item.features
            : item.features
            ? String(item.features).split(',').map(f => f.trim()).filter(Boolean)
            : [];

          const id = String(item.id || item.sku || `prod-${Date.now()}-${index}`);
          const slug = item.slug ? slugify(item.slug) : slugify(name);

          const product: Product = {
            id,
            name,
            slug: slug || `prod-${index}`,
            category: categorySlug,
            price: price > 0 ? price : 10000,
            originalPrice: originalPrice > price ? originalPrice : undefined,
            discountPercent: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined,
            rating: typeof item.rating === 'number' ? item.rating : 5,
            reviewsCount: typeof item.reviewsCount === 'number' ? item.reviewsCount : 0,
            images,
            description: String(item.description || `${name} de qualité supérieure disponible chez DIAYMA GAAW.`),
            features,
            stock: typeof item.stock === 'number' ? item.stock : 15,
            isFeatured: Boolean(item.isFeatured ?? item.featured ?? false),
            isFlashSale: Boolean(item.isFlashSale ?? (originalPrice > price)),
            isNew: Boolean(item.isNew ?? true),
            brand: String(item.brand || 'DIAYMA GAAW'),
            sku: String(item.sku || `SKU-${id}`),
            warranty: item.warranty ? String(item.warranty) : 'Garantie officielle DIAYMA GAAW',
          };

          parsedProducts.push(product);

          if (!existingCategories.some(c => c.slug === categorySlug) && !newCategoriesMap.has(categorySlug)) {
            newCategoriesMap.set(categorySlug, {
              id: categorySlug,
              name: categoryName,
              slug: categorySlug,
              icon: 'Package',
              image: images[0],
              itemCount: 1,
              description: `Articles dans la catégorie ${categoryName}`
            });
          }
        } catch (err) {
          errors.push(`Erreur sur l'article JSON n°${index + 1}: ${String(err)}`);
        }
      });

      return {
        products: parsedProducts,
        categories: Array.from(newCategoriesMap.values()),
        totalParsed: parsedProducts.length,
        errors,
      };
    } catch (jsonErr) {
      errors.push(`Fichier JSON invalide: ${String(jsonErr)}`);
    }
  }

  // Traitement CSV
  const lines = trimmed.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return {
      products: [],
      categories: [],
      totalParsed: 0,
      errors: ['Le fichier CSV est vide ou ne contient pas de lignes de données.'],
    };
  }

  const delimiter = detectCsvDelimiter(lines[0]);
  const rawHeaders = parseCsvLine(lines[0], delimiter).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  // Mapping des colonnes courantes (Meta Catalog, Shopify, WooCommerce ou CSV personnalisé)
  const colIndex = {
    id: rawHeaders.findIndex(h => ['id', 'sku', 'reference', 'code'].includes(h)),
    title: rawHeaders.findIndex(h => ['title', 'name', 'nom', 'designation', 'article', 'produit'].includes(h)),
    description: rawHeaders.findIndex(h => ['description', 'desc', 'details', 'body (html)'].includes(h)),
    price: rawHeaders.findIndex(h => ['price', 'prix', 'sale_price', 'regular_price', 'cout'].includes(h)),
    salePrice: rawHeaders.findIndex(h => ['sale_price', 'prix_solde', 'prix_promo', 'discount_price'].includes(h)),
    category: rawHeaders.findIndex(h => ['category', 'categorie', 'fb_product_category', 'google_product_category', 'type', 'rayon'].includes(h)),
    image: rawHeaders.findIndex(h => ['image_link', 'image', 'photo', 'images', 'img', 'image url', 'src'].includes(h)),
    brand: rawHeaders.findIndex(h => ['brand', 'marque', 'fabricant', 'vendor'].includes(h)),
    stock: rawHeaders.findIndex(h => ['stock', 'quantity', 'quantite', 'qte', 'availability'].includes(h)),
    features: rawHeaders.findIndex(h => ['features', 'caracteristiques', 'tags'].includes(h)),
  };

  if (colIndex.title === -1 && colIndex.price === -1) {
    return {
      products: [],
      categories: [],
      totalParsed: 0,
      errors: ['Format CSV non reconnu. Le fichier doit au moins comporter une colonne pour le nom/titre (ex: "title" ou "nom") et le prix (ex: "price" ou "prix").'],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCsvLine(lines[i], delimiter);
      if (values.length === 0 || values.every(v => !v)) continue;

      const title = colIndex.title !== -1 ? values[colIndex.title] : `Article ${i}`;
      if (!title || !title.trim()) continue;

      let price = colIndex.price !== -1 ? parsePrice(values[colIndex.price]) : 10000;
      let salePrice = colIndex.salePrice !== -1 ? parsePrice(values[colIndex.salePrice]) : 0;
      
      let originalPrice: number | undefined = undefined;
      let discountPercent: number | undefined = undefined;

      // Si Meta Catalog: price = regular price, sale_price = discounted price
      if (salePrice > 0 && price > salePrice) {
        originalPrice = price;
        price = salePrice;
        discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
      }

      const categoryName = colIndex.category !== -1 && values[colIndex.category] 
        ? values[colIndex.category].trim() 
        : 'Divers';
      const categorySlug = slugify(categoryName);

      const imageUrl = colIndex.image !== -1 && values[colIndex.image] 
        ? values[colIndex.image].trim() 
        : 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop';

      const stockRaw = colIndex.stock !== -1 ? values[colIndex.stock] : '15';
      const stock = stockRaw.toLowerCase().includes('in stock') ? 15 : parsePrice(stockRaw) || 10;

      const desc = colIndex.description !== -1 && values[colIndex.description]
        ? values[colIndex.description].trim()
        : `${title} disponible chez DIAYMA GAAW au Sénégal.`;

      const brand = colIndex.brand !== -1 && values[colIndex.brand]
        ? values[colIndex.brand].trim()
        : 'DIAYMA GAAW';

      const rawId = colIndex.id !== -1 && values[colIndex.id] ? values[colIndex.id].trim() : '';
      const id = rawId ? `prod-${slugify(rawId)}` : `prod-${Date.now()}-${i}`;
      const sku = rawId || `SKU-${slugify(title).substring(0, 8).toUpperCase()}`;

      const product: Product = {
        id,
        name: title.trim(),
        slug: `${slugify(title)}-${i}`,
        category: categorySlug,
        price: price > 0 ? price : 5000,
        originalPrice,
        discountPercent,
        rating: 5,
        reviewsCount: 0,
        images: [imageUrl],
        description: desc,
        features: colIndex.features !== -1 && values[colIndex.features]
          ? values[colIndex.features].split(',').map(f => f.trim()).filter(Boolean)
          : ['Livraison rapide Dakar et toutes régions', 'Article vérifié et garanti', 'Paiement Wave, Orange Money ou à la livraison'],
        stock,
        isFeatured: false,
        isFlashSale: Boolean(discountPercent && discountPercent > 0),
        isNew: true,
        brand,
        sku,
        warranty: 'Garantie officielle DIAYMA GAAW',
      };

      parsedProducts.push(product);

      if (!existingCategories.some(c => c.slug === categorySlug) && !newCategoriesMap.has(categorySlug)) {
        newCategoriesMap.set(categorySlug, {
          id: categorySlug,
          name: categoryName,
          slug: categorySlug,
          icon: 'Package',
          image: imageUrl,
          itemCount: 1,
          description: `Articles dans la catégorie ${categoryName}`
        });
      }
    } catch (rowErr) {
      errors.push(`Erreur ligne CSV ${i + 1}: ${String(rowErr)}`);
    }
  }

  return {
    products: parsedProducts,
    categories: Array.from(newCategoriesMap.values()),
    totalParsed: parsedProducts.length,
    errors,
  };
}

/**
 * Génère un modèle CSV prêt à être rempli pour téléversement de catalogue
 */
export function generateSampleCatalogCsv(): string {
  const headers = [
    'sku',
    'name',
    'category',
    'price',
    'original_price',
    'stock',
    'brand',
    'description',
    'image_link',
    'features'
  ];

  const sampleRows = [
    [
      'DG-SAMP-01',
      '"Smart TV 55 Pouces 4K Ultra HD Frameless"',
      '"TV & Audio"',
      '245000',
      '295000',
      '8',
      '"Samsung"',
      '"Téléviseur Smart 4K sans bordures avec télécommande vocale et récepteur satellite intégré."',
      '"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop"',
      '"Écran 55 pouces 4K UHD, HDR10+, Smart TV Tizen OS, 3 ports HDMI"'
    ],
    [
      'DG-SAMP-02',
      '"Baffle Amplifié Rechargeable 1000W Double Sub"',
      '"Sonorisation & Amplificateur"',
      '85000',
      '110000',
      '15',
      '"DIAYMA GAAW"',
      '"Enceinte sono puissante avec 2 micros sans fil, effets LED et batterie 12h pour fêtes et événements."',
      '"https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop"',
      '"Puissance 1000W PMPO, 2 Micros sans fil inclus, Bluetooth 5.3, Port USB/SD"'
    ],
    [
      'DG-SAMP-03',
      '"Kit Solaire Complet 300W avec 4 Lampes & Onduleur"',
      '"Solaire & Énergie"',
      '135000',
      '165000',
      '12',
      '"SolarTech"',
      '"Autonomie énergétique totale pour maison ou commerce avec batterie gel haute durée de vie."',
      '"https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop"',
      '"Panneau solaire 300W monocristallin, Onduleur hybride 500VA, 4 Ampoules LED"'
    ]
  ];

  return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\r\n');
}

export function downloadSampleCatalogCsv(): void {
  const csvContent = generateSampleCatalogCsv();
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'modele-catalogue-produits-diaymagaaw.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
