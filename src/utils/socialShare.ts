import { Product, StoreSettings } from '../types';
import { formatFCFA } from './currency';

/**
 * Construit l'URL absolue partageable d'un produit
 */
export function getProductShareUrl(product: Product): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://diaymagaaw.sn';
  return `${origin}/#product-${product.slug || product.id}`;
}

/**
 * Message par défaut d'introduction pour le partage
 */
export function getProductShareText(product: Product, settings?: StoreSettings): string {
  const storeName = settings?.storeName || 'DIAYMA GAAW SÉNÉGAL';
  const price = formatFCFA(product.price);
  const oldPrice = product.originalPrice && product.originalPrice > product.price 
    ? ` (au lieu de ${formatFCFA(product.originalPrice)})` 
    : '';

  return `🔥 Découvrez cet article sur ${storeName} :\n\n📦 *${product.name}*\n💰 Prix : *${price}*${oldPrice}\n🚚 Livraison rapide partout au Sénégal ! Paiement Wave, Orange Money ou à la livraison.`;
}

/**
 * Lien de partage direct vers WhatsApp (amis, groupes, statut)
 */
export function getWhatsAppShareLink(product: Product, settings?: StoreSettings): string {
  const url = getProductShareUrl(product);
  const text = `${getProductShareText(product, settings)}\n\n👉 Commandez ici : ${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Lien de partage direct vers Facebook
 */
export function getFacebookShareLink(product: Product): string {
  const url = getProductShareUrl(product);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Lien de partage direct vers Twitter / X
 */
export function getTwitterShareLink(product: Product, settings?: StoreSettings): string {
  const url = getProductShareUrl(product);
  const text = getProductShareText(product, settings);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

/**
 * Lien de partage direct vers Telegram
 */
export function getTelegramShareLink(product: Product, settings?: StoreSettings): string {
  const url = getProductShareUrl(product);
  const text = getProductShareText(product, settings);
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/**
 * Lien de partage direct par Email
 */
export function getEmailShareLink(product: Product, settings?: StoreSettings): string {
  const url = getProductShareUrl(product);
  const storeName = settings?.storeName || 'DIAYMA GAAW';
  const subject = `Découvrez ${product.name} sur ${storeName}`;
  const body = `${getProductShareText(product, settings)}\n\nConsultez la fiche produit ici : ${url}`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Partage natif via Web Share API sur mobile (Android / iOS)
 * Ouvre la feuille de partage système proposant WhatsApp, Facebook, Instagram Stories/DM, Telegram, etc.
 */
export async function shareProductNative(
  product: Product, 
  settings?: StoreSettings
): Promise<{ shared: boolean; method: 'native' | 'clipboard' | 'fallback' }> {
  const url = getProductShareUrl(product);
  const text = getProductShareText(product, settings);
  const title = `${product.name} - ${settings?.storeName || 'DIAYMA GAAW'}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { shared: true, method: 'native' };
    } catch (err: any) {
      // Si l'utilisateur a annulé, ne pas déclencher d'erreur
      if (err.name === 'AbortError') {
        return { shared: false, method: 'native' };
      }
    }
  }

  // Fallback 1: Copie dans le presse-papier
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(`${text}\n\n👉 ${url}`);
      return { shared: true, method: 'clipboard' };
    } catch {
      // continue
    }
  }

  return { shared: false, method: 'fallback' };
}
