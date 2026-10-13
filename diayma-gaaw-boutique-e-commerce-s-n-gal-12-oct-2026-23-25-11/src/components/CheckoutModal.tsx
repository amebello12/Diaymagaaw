import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle, 
  MapPin, 
  Phone, 
  User, 
  AlertCircle,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { CartItem, Order, OrderCustomer, PaymentMethod, DeliveryZone, StoreSettings } from '../types';
import { formatFCFA, isValidSenegalPhone, STORE_PHONE_DISPLAY, formatPhoneNumber } from '../utils/currency';
import { WaveLogo, OrangeMoneyLogo, FreeMoneyLogo, CashOnDeliveryLogo } from './PaymentLogos';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedDiscountPercent: number;
  deliveryZones: DeliveryZone[];
  onOrderCompleted: (order: Order) => void;
  settings?: StoreSettings;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedDiscountPercent,
  deliveryZones,
  onOrderCompleted,
  settings
}) => {
  if (!isOpen) return null;

  // Determine initial payment method based on enabled settings
  const getDefaultPaymentMethod = (): PaymentMethod => {
    if (settings?.enableCashOnDelivery !== false) return 'cod';
    if (settings?.enableWave !== false) return 'wave';
    if (settings?.enableOrangeMoney !== false) return 'orange_money';
    if (settings?.enableFreeMoney !== false) return 'free_money';
    return 'cod';
  };

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState(deliveryZones[0]?.id || 'dakar-centre');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(getDefaultPaymentMethod());
  const [waveOrOmNumber, setWaveOrOmNumber] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * appliedDiscountPercent) / 100);

  // Selected delivery zone pricing
  const currentZone = deliveryZones.find(z => z.id === selectedZoneId) || deliveryZones[0];
  
  // Free delivery for Dakar if subtotal >= freeShippingThreshold (from admin settings)
  const freeThreshold = settings?.freeShippingThreshold ?? 60000;
  const isFreeDelivery = subtotal >= freeThreshold && currentZone.id.includes('dakar');
  const deliveryFee = isFreeDelivery ? 0 : currentZone.price;
  const grandTotal = subtotal - discountAmount + deliveryFee;

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim()) errs.fullName = 'Le nom complet est obligatoire';
    if (!phone.trim()) {
      errs.phone = 'Le numéro de téléphone est obligatoire';
    } else if (!isValidSenegalPhone(phone)) {
      errs.phone = 'Numéro invalide. Ex: 77 123 45 67 ou 78 000 00 00';
    }

    if (!neighborhood.trim()) {
      errs.neighborhood = 'Veuillez préciser votre quartier ou commune';
    }
    if (!address.trim()) {
      errs.address = 'Veuillez préciser votre adresse ou un repère (ex: près de la pharmacie...)';
    }

    if ((paymentMethod === 'wave' || paymentMethod === 'orange_money') && !waveOrOmNumber.trim()) {
      errs.waveOrOmNumber = 'Veuillez indiquer le numéro avec lequel vous effectuez le transfert';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `DG-${randomSuffix}`;

    const customer: OrderCustomer = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      region: currentZone.name,
      city: currentZone.regions[0] || 'Dakar',
      neighborhood: neighborhood.trim(),
      address: address.trim(),
      deliveryNotes: deliveryNotes.trim() || undefined
    };

    const newOrder: Order = {
      id: 'order-' + Date.now(),
      orderNumber,
      createdAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      total: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'cash_on_delivery' : 'pending',
      orderStatus: 'reçue',
      customer,
      trackingNumber: `SN-TRACK-${randomSuffix}`,
      waveOrOmNumber: waveOrOmNumber.trim() || undefined
    };

    setTimeout(() => {
      setIsSubmitting(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore if confetti fails
      }
      onOrderCompleted(newOrder);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm">
              DG
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 font-display">
                Finaliser ma Commande
              </h2>
              <p className="text-xs text-gray-500">
                Paiement sécurisé au Sénégal • Livraison rapide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-4 sm:p-8 flex-1 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Form: Delivery & Contact details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
                  <User className="w-4 h-4 text-red-600" />
                  <span>1. Vos Coordonnées (Client)</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nom complet <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="ex: Moussa Ndiaye"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-600'
                      }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Numéro de Téléphone (WhatsApp/Appel) <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="70 771 72 81"
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono focus:outline-none ${
                            errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-600'
                          }`}
                        />
                        <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3.5" />
                      </div>
                      {errors.phone && <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email (Optionnel)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="moussa@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>2. Adresse de Livraison au Sénégal</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Zone de livraison <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-red-600 font-medium"
                    >
                      {deliveryZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} — {formatFCFA(zone.price)} ({zone.estimatedTime})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Quartier / Commune <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="ex: Médina, Mermoz, Parcelles U22..."
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                          errors.neighborhood ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-600'
                        }`}
                      />
                      {errors.neighborhood && <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.neighborhood}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Repère & Détails Adresse <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="ex: En face station Shell, Villa N°42"
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                          errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-600'
                        }`}
                      />
                      {errors.address && <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.address}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Instructions pour le livreur (Optionnel)
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="ex: Appeler avant de venir, livrer de préférence entre 14h et 18h..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>3. Mode de Paiement</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Cash on Delivery */}
                  {settings?.enableCashOnDelivery !== false && (
                    <label
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <CashOnDeliveryLogo size="sm" />
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Paiement à la livraison</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Espèces au livreur après vérification</p>
                      </div>
                    </label>
                  )}

                  {/* Wave */}
                  {settings?.enableWave !== false && (
                    <label
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        paymentMethod === 'wave'
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <WaveLogo size="sm" />
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'wave'}
                          onChange={() => setPaymentMethod('wave')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Wave Sénégal</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Transfert instantané 0% frais</p>
                      </div>
                    </label>
                  )}

                  {/* Orange Money */}
                  {settings?.enableOrangeMoney !== false && (
                    <label
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        paymentMethod === 'orange_money'
                          ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <OrangeMoneyLogo size="sm" />
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'orange_money'}
                          onChange={() => setPaymentMethod('orange_money')}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Orange Money</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Via code ou transfert OM</p>
                      </div>
                    </label>
                  )}

                  {/* Free Money */}
                  {settings?.enableFreeMoney !== false && (
                    <label
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        paymentMethod === 'free_money'
                          ? 'border-red-600 bg-red-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FreeMoneyLogo size="sm" />
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'free_money'}
                          onChange={() => setPaymentMethod('free_money')}
                          className="text-red-600 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Free Money</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Transfert rapide Free Sénégal</p>
                      </div>
                    </label>
                  )}

                </div>

                {/* Mobile Money Notice */}
                {(paymentMethod === 'wave' || paymentMethod === 'orange_money' || paymentMethod === 'free_money') && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Instructions de transfert Mobile Money :</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Effectuez le transfert du montant exact (<strong>{formatFCFA(grandTotal)}</strong>) au numéro officiel : <strong className="text-gray-900">{formatPhoneNumber(settings?.phone || settings?.whatsappPhone)}</strong> ({settings?.storeName || 'DIAYMA GAAW'}).
                    </p>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Numéro {paymentMethod === 'wave' ? 'Wave' : paymentMethod === 'orange_money' ? 'Orange Money' : 'Free Money'} de l'expéditeur <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        value={waveOrOmNumber}
                        onChange={(e) => setWaveOrOmNumber(e.target.value)}
                        placeholder="Votre numéro de transfert..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                      />
                      {errors.waveOrOmNumber && (
                        <p className="text-[10px] text-red-600 font-bold mt-1">{errors.waveOrOmNumber}</p>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Right Summary: Order recap */}
            <div className="lg:col-span-5 bg-gray-50 rounded-3xl p-5 border border-gray-200 space-y-5">
              <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-200 pb-3">
                Récapitulatif ({items.length} produit{items.length > 1 ? 's' : ''})
              </h3>

              {/* Items summary list */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt=""
                      className="w-12 h-12 object-contain bg-white p-1 rounded-xl border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-gray-500">Qté : {item.quantity} × {formatFCFA(item.product.price)}</p>
                    </div>
                    <span className="font-bold text-gray-900 font-mono">
                      {formatFCFA(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2 text-xs pt-3 border-t border-gray-200 text-gray-600">
                <div className="flex justify-between">
                  <span>Sous-total articles :</span>
                  <span className="font-semibold text-gray-900">{formatFCFA(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Réduction promo :</span>
                    <span>-{formatFCFA(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Frais de livraison ({currentZone.name.split('/')[0]}) :</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryFee === 0 ? <strong className="text-emerald-600">GRATUIT</strong> : formatFCFA(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-300">
                  <span>TOTAL À PAYER :</span>
                  <span className="text-red-600 text-lg font-mono">
                    {formatFCFA(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="p-3 bg-white rounded-2xl border border-gray-200 space-y-1.5 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Commande 100% garantie & vérifiée</span>
                </div>
                <p>
                  Un agent du service client DIAYMA GAAW vous appellera pour confirmer l'heure exacte de livraison avant le départ du coursier.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Validation en cours...</span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>CONFIRMER MA COMMANDE</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
