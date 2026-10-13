import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  Truck,
  ShieldCheck
} from 'lucide-react';
import { CartItem, StoreSettings, PromoCode } from '../types';
import { formatFCFA } from '../utils/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (appliedDiscountPercent: number) => void;
  onContinueShopping: () => void;
  settings?: StoreSettings;
  promoCodes?: PromoCode[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  settings,
  promoCodes = []
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 60000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const clean = promoCode.trim().toUpperCase();

    // Check active promo codes from admin or default
    const matched = promoCodes.find(p => p.code.toUpperCase() === clean);
    if (matched) {
      setDiscountPercent(matched.discountPercent);
      setPromoSuccess(`Code ${matched.code} (-${matched.discountPercent}%) appliqué avec succès !`);
      return;
    }

    if (clean === 'BIENVENUE10' || clean === 'GAAW10') {
      setDiscountPercent(10);
      setPromoSuccess('Code promo -10% appliqué avec succès !');
    } else if (clean === 'SENEGAL15') {
      setDiscountPercent(15);
      setPromoSuccess('Code VIP -15% appliqué !');
    } else {
      setPromoError('Code promo invalide ou expiré');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-black text-gray-900 font-display">
              Mon Panier ({items.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Delivery Goal Bar */}
        <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 text-xs">
          {remainingForFreeShipping > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-emerald-900 font-semibold">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  Livraison gratuite à Dakar
                </span>
                <span>Plus que <strong>{formatFCFA(remainingForFreeShipping)}</strong></span>
              </div>
              <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Félicitations ! Vous bénéficiez de la livraison offerte sur Dakar !</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">Votre panier est vide</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Découvrez nos offres d’appareils électroménagers et smartphones aux meilleurs prix au Sénégal.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onContinueShopping();
                }}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Découvrir la boutique
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-between"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-gray-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                      {item.product.name}
                    </h4>
                    <p className="text-xs font-black text-red-600 mt-1">
                      {formatFCFA(item.product.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-bold text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Supprimer du panier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-gray-900 font-mono">
                      {formatFCFA(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer & Checkout Box */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-white space-y-4">
            
            {/* Promo Code input */}
            <form onSubmit={handleApplyPromo} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Code Promo (ex: BIENVENUE10)"
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-red-600"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Appliquer
                </button>
              </div>
              {promoSuccess && (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {promoSuccess}
                </p>
              )}
              {promoError && (
                <p className="text-[11px] font-bold text-red-600">{promoError}</p>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span className="font-semibold text-gray-900">{formatFCFA(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Réduction ({discountPercent}%) :</span>
                  <span>-{formatFCFA(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Frais de livraison :</span>
                <span>Calculé à l'étape suivante</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                <span>TOTAL ESTIMÉ :</span>
                <span className="text-red-600 text-base font-mono">
                  {formatFCFA(subtotal - discountAmount)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onCheckout(discountPercent);
              }}
              className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>PASSER LA COMMANDE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile Money Assurance */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Wave • Orange Money • Free Money • À la réception</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
