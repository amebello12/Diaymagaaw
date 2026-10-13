import React, { useState } from 'react';
import { Truck, MapPin, Clock, ShieldCheck, PhoneCall, CheckCircle, Calculator } from 'lucide-react';
import { DeliveryZone, StoreSettings } from '../types';
import { formatFCFA, STORE_PHONE_DISPLAY, formatPhoneNumber, cleanPhoneForWhatsApp } from '../utils/currency';

interface DeliveryPageProps {
  deliveryZones: DeliveryZone[];
  onStartShopping: () => void;
  settings?: StoreSettings;
}

export const DeliveryPage: React.FC<DeliveryPageProps> = ({
  deliveryZones,
  onStartShopping,
  settings
}) => {
  // Simulator state
  const [calcRegion, setCalcRegion] = useState(deliveryZones[0].id);
  const [calcNeighborhood, setCalcNeighborhood] = useState('');
  const [simulatedCost, setSimulatedCost] = useState<number | null>(null);

  const selectedZone = deliveryZones.find(z => z.id === calcRegion) || deliveryZones[0];
  const rawPhone = cleanPhoneForWhatsApp(settings?.whatsappPhone || settings?.phone);
  const displayPhone = formatPhoneNumber(settings?.phone || settings?.whatsappPhone);
  const storeName = settings?.storeName || 'DIAYMA GAAW';
  const freeThreshold = settings?.freeShippingThreshold ?? 60000;

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatedCost(selectedZone.price);
  };

  return (
    <div className="py-12 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>EXPÉDITIONS PARTOUT AU SÉNÉGAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-display">
            Zones, Tarifs et Délais de Livraison
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Chez <strong className="text-gray-900">DIAYMA GAAW</strong>, nous livrons vos commandes en temps record à Dakar, dans la banlieue et dans toutes les 14 régions du Sénégal.
          </p>
        </div>

        {/* Delivery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deliveryZones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-gray-900 mb-2 leading-snug">
                  {zone.name}
                </h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  {zone.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{zone.estimatedTime}</span>
                </div>
                <div className="text-xl font-black text-red-600 font-mono">
                  {formatFCFA(zone.price)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Free Shipping Alert */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              OFFRE SPÉCIALE DAKAR
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Livraison GRATUITE dès 60 000 FCFA d'achats !
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Profitez de la livraison offerte sur tout le département de Dakar pour toute commande supérieure ou égale à 60 000 FCFA.
            </p>
          </div>
          <button
            onClick={onStartShopping}
            className="px-6 py-3.5 bg-white text-emerald-800 font-black text-xs rounded-2xl hover:bg-emerald-50 shadow-md transition shrink-0"
          >
            Faire mes achats
          </button>
        </div>

        {/* Delivery Fee Calculator / Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">
                  Simulateur de Frais de Livraison
                </h3>
                <p className="text-xs text-gray-500">
                  Sélectionnez votre zone pour connaître le tarif et le délai exact
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Votre Région / Localité
                </label>
                <select
                  value={calcRegion}
                  onChange={(e) => {
                    setCalcRegion(e.target.value);
                    setSimulatedCost(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-red-600 font-medium"
                >
                  {deliveryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Votre Quartier / Adresse (Optionnel)
                </label>
                <input
                  type="text"
                  value={calcNeighborhood}
                  onChange={(e) => setCalcNeighborhood(e.target.value)}
                  placeholder="ex: Mermoz, Sacré-Cœur, Almadies, Guédiawaye..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Calculer les frais & délais
              </button>
            </form>

            {simulatedCost !== null && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1 animate-in fade-in">
                <div className="flex justify-between items-center font-bold text-sm">
                  <span>Frais estimés :</span>
                  <span className="font-mono text-base font-black text-red-600">{formatFCFA(simulatedCost)}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  ⏱️ <strong>Délai :</strong> {selectedZone.estimatedTime}
                </p>
                <p className="text-[11px] text-emerald-700">
                  ✓ Possibilité de paiement par Wave, Orange Money, Free Money ou à la livraison.
                </p>
              </div>
            )}
          </div>

          {/* Delivery Guarantees */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                Nos engagements livraison
              </h4>

              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Appel préalable :</strong> Le livreur vous appelle 30 minutes avant son arrivée.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Vérification sur place :</strong> Vous ouvrez et inspectez le colis avant tout paiement.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Colis protégés :</strong> Emballages renforcés contre les chocs et la poussière.</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Besoin d'aide ?</span>
                <a
                  href={`https://wa.me/${rawPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Service client {displayPhone}</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
