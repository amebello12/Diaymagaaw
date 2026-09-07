/**
 * Helper utilities for Senegalese e-commerce (FCFA currency, phone numbers, WhatsApp, etc.)
 */

export function formatFCFA(amount: number): string {
  if (isNaN(amount)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' FCFA';
}

export function calculateDiscount(originalPrice?: number, currentPrice?: number): number {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export const WHATSAPP_STORE_PHONE = '+221707717281'; // Numéro officiel WhatsApp
export const STORE_PHONE_DISPLAY = '+221 70 771 72 81';
export const STORE_PHONE_RAW = '221707717281';
export const STORE_EMAIL = 'contact@diaymagaaw.sn';

export function formatPhoneNumber(phone?: string): string {
  if (!phone) return STORE_PHONE_DISPLAY;
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 9) {
    // Ex: 707717281 -> +221 70 771 72 81
    return `+221 ${digitsOnly.slice(0, 2)} ${digitsOnly.slice(2, 5)} ${digitsOnly.slice(5, 7)} ${digitsOnly.slice(7, 9)}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('221')) {
    const local = digitsOnly.slice(3);
    return `+221 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
  }
  return phone.startsWith('+') ? phone : `+221 ${phone}`;
}

export function cleanPhoneForWhatsApp(phone?: string): string {
  if (!phone) return STORE_PHONE_RAW;
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 9) {
    return '221' + digitsOnly;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('221')) {
    return digitsOnly;
  }
  return digitsOnly || STORE_PHONE_RAW;
}

export function createWhatsAppProductMessage(productName: string, price: number, sku?: string, customPhone?: string): string {
  const phone = cleanPhoneForWhatsApp(customPhone);
  const text = `Bonjour DIAYMA GAAW, je souhaite avoir des informations et commander le produit suivant :\n\n📦 *${productName}*\n💰 *Prix :* ${formatFCFA(price)}\n🔖 *Réf :* ${sku || 'DG-PROD'}\n\nEst-il toujours disponible pour une livraison rapide ? Merci !`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function createWhatsAppOrderMessage(orderNumber: string, total: number, customerName: string, customerPhone: string, customStorePhone?: string): string {
  const targetPhone = cleanPhoneForWhatsApp(customStorePhone);
  const text = `Bonjour DIAYMA GAAW, j'ai passé la commande *${orderNumber}* sur votre boutique.\n\n👤 *Client :* ${customerName}\n📱 *Téléphone :* ${customerPhone}\n💵 *Total :* ${formatFCFA(total)}\n\nMerci de confirmer la prise en charge de ma livraison !`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

export function isValidSenegalPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-\+\(\)]/g, '');
  // Match 77, 78, 76, 75, 70 followed by 7 digits or with 221 prefix
  return /^(221)?(77|78|76|75|70)\d{7}$/.test(clean);
}
