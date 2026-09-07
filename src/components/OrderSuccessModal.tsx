import React from 'react';
import { 
  CheckCircle2, 
  X, 
  MessageCircle, 
  Truck, 
  ShoppingBag, 
  Printer, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { formatFCFA, createWhatsAppOrderMessage, formatPhoneNumber } from '../utils/currency';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onContinueShopping: () => void;
  settings?: StoreSettings;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onContinueShopping,
  settings
}) => {
  if (!order) return null;
  const storePhone = settings?.whatsappPhone || settings?.phone;
  const displayPhone = formatPhoneNumber(storePhone);
  const storeName = settings?.storeName || 'DIAYMA GAAW';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-8 space-y-6">
        
        {/* Top Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            COMMANDE ENREGISTRÉE AVEC SUCCÈS
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
            Merci pour votre confiance !
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Votre commande <strong className="text-gray-900 font-mono">#{order.orderNumber}</strong> est bien reçue. Notre équipe prépare votre colis pour expédition immédiate.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-gray-200">
            <div>
              <span className="text-gray-500 block">N° Commande :</span>
              <strong className="text-gray-900 font-mono text-sm">{order.orderNumber}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Date :</span>
              <strong className="text-gray-900">{order.createdAt}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Paiement :</span>
              <strong className="text-gray-900 uppercase">
                {order.paymentMethod === 'cod' ? 'À la livraison' : order.paymentMethod}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Montant Total :</span>
              <strong className="text-red-600 font-black text-sm font-mono">{formatFCFA(order.total)}</strong>
            </div>
          </div>

          {/* Delivery & Customer details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
            <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-1">
              <span className="font-bold text-gray-900 block flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Destinataire :
              </span>
              <p className="font-semibold text-gray-800">{order.customer.fullName}</p>
              <p className="text-gray-600">📱 {order.customer.phone}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-1">
              <span className="font-bold text-gray-900 block">Adresse de livraison :</span>
              <p className="text-gray-800 font-medium">{order.customer.neighborhood}, {order.customer.city}</p>
              <p className="text-gray-500">{order.customer.address}</p>
            </div>
          </div>

          {/* Ordered Items summary */}
          <div className="space-y-1.5 pt-2">
            <span className="font-bold text-gray-900 block">Articles commandés :</span>
            {order.items.map((it) => (
              <div key={it.product.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                <span className="text-gray-800 font-medium truncate max-w-xs">{it.quantity}x {it.product.name}</span>
                <span className="font-bold text-gray-900 font-mono">{formatFCFA(it.product.price * it.quantity)}</span>
              </div>
            ))}
          </div>

        </div>

        {/* WhatsApp Notification CTA */}
        <div className="space-y-3">
          <a
            href={createWhatsAppOrderMessage(order.orderNumber, order.total, order.customer.fullName, order.customer.phone, storePhone)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-center"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Envoyer la confirmation sur WhatsApp ({displayPhone})</span>
          </a>

          <button
            onClick={() => {
              onClose();
              onContinueShopping();
            }}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continuer mes achats sur {storeName}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
