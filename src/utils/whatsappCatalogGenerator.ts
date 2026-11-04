/**
 * Utilitaires officiels de liaison et synchronisation du catalogue avec WhatsApp Business
 * Conforme aux spécifications Meta Commerce Manager (Facebook & WhatsApp Business Catalog)
 */

import { Product, StoreSettings, CartItem } from '../types';
import { formatFCFA, cleanPhoneForWhatsApp, formatPhoneNumber } from './currency';

/**
 * Nettoie une chaîne de caractères pour un champ CSV (gestion des guillemets et retours à la ligne)
 */
function escapeCsvValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""').replace(/\r\n|\r|\n/g, ' ');
  return `"${str}"`;
}

/**
 * Formate et valide l'URL d'image d'un produit pour Meta Commerce Manager
 * Meta refuse strictement les Data URIs (data:image/...) dans les flux CSV/XML.
 * On convertit donc les Data URIs en URL HTTP dédiée /api/catalog/image/:id.jpg
 */
export function formatMetaImageUrl(rawImage: string | undefined | null, productId: string, baseUrl: string): string {
  if (!rawImage || typeof rawImage !== 'string') {
    return `${baseUrl}/logo.jpg`;
  }
  const trimmed = rawImage.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('data:image')) {
    return `${baseUrl}/api/catalog/image/${encodeURIComponent(productId)}.jpg`;
  }
  if (trimmed.startsWith('/')) {
    return `${baseUrl}${trimmed}`;
  }
  return `${baseUrl}/logo.jpg`;
}

/**
 * Génère le fichier CSV au format officiel Meta Commerce Manager / WhatsApp Business Catalog
 * Spécification officielle : https://www.facebook.com/business/help/120325381656392
 */
export function generateMetaCatalogCsv(products: Product[], settings?: StoreSettings, customBaseUrl?: string): string {
  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'sale_price',
    'link',
    'image_link',
    'brand',
    'google_product_category',
    'fb_product_category',
    'item_group_id',
    'status'
  ];

  const baseUrl = customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://diaymagaaw.sn');
  const brandDefault = settings?.storeName || 'DIAYMA GAAW';

  const rows = products.map((product) => {
    const id = product.sku || product.id;
    const title = product.name;
    const description = product.description || `${product.name} disponible chez ${brandDefault} au Sénégal. Livraison rapide Dakar et régions.`;
    const availability = (product.stock > 0) ? 'in stock' : 'out of stock';
    const condition = 'new';
    
    // Format monétaire officiel Meta pour l'Afrique de l'Ouest : 27500 XOF
    const basePriceNumber = product.originalPrice && product.originalPrice > product.price 
      ? product.originalPrice 
      : product.price;
    const price = `${basePriceNumber} XOF`;
    const salePrice = (product.originalPrice && product.originalPrice > product.price) 
      ? `${product.price} XOF` 
      : '';

    const link = `${baseUrl}/#product-${product.slug || product.id}`;
    const imageLink = formatMetaImageUrl(product.images?.[0], product.id, baseUrl);
    const brand = product.brand || brandDefault;
    const googleCategory = product.category;
    const fbCategory = product.category;
    const itemGroupId = product.category;
    const status = 'active';

    return [
      escapeCsvValue(id),
      escapeCsvValue(title),
      escapeCsvValue(description),
      escapeCsvValue(availability),
      escapeCsvValue(condition),
      escapeCsvValue(price),
      escapeCsvValue(salePrice),
      escapeCsvValue(link),
      escapeCsvValue(imageLink),
      escapeCsvValue(brand),
      escapeCsvValue(googleCategory),
      escapeCsvValue(fbCategory),
      escapeCsvValue(itemGroupId),
      escapeCsvValue(status)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Télécharge le fichier CSV prêt à être importé dans Meta Commerce Manager / WhatsApp Business
 */
export function downloadWhatsAppCatalogCsv(products: Product[], settings?: StoreSettings, filename = 'catalogue-whatsapp-business-diaymagaaw.csv'): void {
  const csvContent = generateMetaCatalogCsv(products, settings);
  // Ajout du BOM UTF-8 pour ouverture parfaite dans Excel / Google Sheets
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Génère un texte formaté WhatsApp pour diffuser l'ensemble du catalogue ou les meilleures offres
 */
export function generateWhatsAppCatalogShareMessage(products: Product[], settings?: StoreSettings): string {
  const storeName = settings?.storeName || 'DIAYMA GAAW';
  const phone = formatPhoneNumber(settings?.whatsappPhone || settings?.phone);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://diaymagaaw.sn';

  let msg = `🛍️ *CATALOGUE OFFICIEL ${storeName.toUpperCase()} SÉNÉGAL*\n`;
  msg += `✨ _${settings?.slogan || 'Les bons produits au bon prix - N°1 au Sénégal' }_\n`;
  msg += `🚚 *Livraison rapide :* Dakar (2h-4h) & toutes les régions du Sénégal\n`;
  msg += `💳 *Paiement sécurisé :* Wave, Orange Money, Free Money ou à la livraison\n\n`;
  msg += `══════════════════════\n`;
  msg += `🔥 *SÉLECTION D'ARTICLES EN STOCK :*\n\n`;

  const previewList = products.slice(0, 10);
  previewList.forEach((prod, index) => {
    const promoTag = prod.discountPercent ? ` (-${prod.discountPercent}%)` : '';
    msg += `${index + 1}. *${prod.name}*\n`;
    msg += `   💰 Prix : *${formatFCFA(prod.price)}*${promoTag}\n`;
    if (prod.stock > 0) {
      msg += `   ✅ En stock (${prod.stock} unités)\n`;
    }
    msg += `   🔗 Voir : ${siteUrl}/#product-${prod.slug || prod.id}\n\n`;
  });

  if (products.length > 10) {
    msg += `➕ _Et +de ${products.length - 10} autres articles disponibles sur notre site web._\n\n`;
  }

  msg += `══════════════════════\n`;
  msg += `📲 *Commander directement par WhatsApp :* ${phone}\n`;
  msg += `🌐 *Visiter la boutique complète :* ${siteUrl}\n`;

  return msg;
}

/**
 * Partage le catalogue complet sur WhatsApp
 */
export function shareCatalogOnWhatsApp(products: Product[], settings?: StoreSettings): void {
  const text = generateWhatsAppCatalogShareMessage(products, settings);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Génère le lien WhatsApp Business pour commander un panier complet
 */
export function createCartWhatsAppOrderLink(
  items: CartItem[], 
  deliveryFee: number, 
  total: number, 
  settings?: StoreSettings,
  customerName?: string
): string {
  const phone = cleanPhoneForWhatsApp(settings?.whatsappPhone || settings?.phone);
  const storeName = settings?.storeName || 'DIAYMA GAAW';

  let msg = `Bonjour *${storeName}*, je souhaite valider la commande de mon panier :\n\n`;
  if (customerName) {
    msg += `👤 *Client :* ${customerName}\n\n`;
  }
  msg += `📦 *ARTICLES COMMANDÉS :*\n`;

  items.forEach((item, index) => {
    msg += `${index + 1}. *${item.product.name}*\n`;
    msg += `   Quantité : ${item.quantity} x ${formatFCFA(item.product.price)} = *${formatFCFA(item.product.price * item.quantity)}*\n`;
    if (item.product.sku) {
      msg += `   Réf : ${item.product.sku}\n`;
    }
  });

  msg += `\n─────────────────────\n`;
  if (deliveryFee > 0) {
    msg += `🚚 *Frais de livraison :* ${formatFCFA(deliveryFee)}\n`;
  } else {
    msg += `🚚 *Livraison :* GRATUITE\n`;
  }
  msg += `💵 *TOTAL À PAYER : ${formatFCFA(total)}*\n\n`;
  msg += `Merci de me confirmer la disponibilité et le délai de livraison à mon adresse au Sénégal !`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

/**
 * Génère le flux au format XML RSS 2.0 / Google Merchant / Meta Product Feed
 * Utilisable directement dans Meta Commerce Manager (Facebook Marketplace & WhatsApp Business)
 */
export function generateMetaCatalogXml(products: Product[], settings?: StoreSettings, baseUrl?: string): string {
  const storeName = settings?.storeName || 'DIAYMA GAAW';
  const siteUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://diaymagaaw.sn');

  const escapeXml = (unsafe: string | number | undefined | null): string => {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const itemsXml = products.map((product) => {
    const id = product.sku || product.id;
    const title = product.name;
    const description = product.description || `${product.name} disponible chez ${storeName} au Sénégal. Livraison rapide Dakar et régions.`;
    const availability = (product.stock > 0) ? 'in stock' : 'out of stock';
    const condition = 'new';
    const link = `${siteUrl}/#product-${product.slug || product.id}`;
    const imageLink = formatMetaImageUrl(product.images?.[0], product.id, siteUrl);
    const brand = product.brand || storeName;

    const basePriceNumber = product.originalPrice && product.originalPrice > product.price 
      ? product.originalPrice 
      : product.price;
    const price = `${basePriceNumber} XOF`;
    const salePrice = (product.originalPrice && product.originalPrice > product.price) 
      ? `\n      <g:sale_price>${product.price} XOF</g:sale_price>` 
      : '';

    return `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>${salePrice}
      <g:product_type>${escapeXml(product.category)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(storeName)} - Flux Catalogue Facebook Marketplace & WhatsApp Business</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Flux de données officiel pour la synchronisation automatique des articles sur Meta Commerce Manager, Facebook Marketplace et WhatsApp Business</description>
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Obtient l'URL canonique du flux de synchronisation Meta (CSV ou XML)
 */
export function getFeedUrl(format: 'csv' | 'xml' = 'csv', customOrigin?: string): string {
  let origin = customOrigin;
  if (!origin && typeof window !== 'undefined') {
    origin = window.location.origin;
  }
  if (!origin) {
    origin = 'https://diaymagaaw.sn';
  }
  return `${origin}/api/catalog/feed.${format}`;
}

/**
 * Télécharge le fichier XML
 */
export function downloadMetaCatalogXml(products: Product[], settings?: StoreSettings, filename = 'catalogue-meta-facebook-whatsapp.xml'): void {
  const xmlContent = generateMetaCatalogXml(products, settings);
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

