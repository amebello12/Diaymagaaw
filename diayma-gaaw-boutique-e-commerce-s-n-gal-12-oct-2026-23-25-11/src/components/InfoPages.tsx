import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock, 
  ShieldCheck, 
  Send, 
  Truck, 
  CheckCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { STORE_PHONE_DISPLAY, STORE_PHONE_RAW, STORE_EMAIL, formatPhoneNumber, cleanPhoneForWhatsApp } from '../utils/currency';
import { StoreSettings } from '../types';

interface ContactPageProps {
  onStartShopping: () => void;
  settings?: StoreSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onStartShopping, settings }) => {
  const [formSent, setFormSent] = useState(false);
  const rawPhone = cleanPhoneForWhatsApp(settings?.whatsappPhone || settings?.phone);
  const displayPhone = formatPhoneNumber(settings?.phone || settings?.whatsappPhone);
  const email = settings?.email || STORE_EMAIL;
  const storeName = settings?.storeName || 'DIAYMA GAAW';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            SERVICE CLIENT SÉNÉGAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-display">
            Contactez {storeName}
          </h1>
          <p className="text-sm text-gray-600">
            Une question sur un produit, une commande en cours ou les délais de livraison ? Notre équipe à Dakar vous répond 7 jours sur 7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Direct Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            <a
              href={`https://wa.me/${rawPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-emerald-600 text-white rounded-3xl shadow-lg flex items-center gap-4 hover:bg-emerald-700 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-200 block uppercase">Canal prioritaire</span>
                <h4 className="text-lg font-black">WhatsApp Officiel</h4>
                <p className="text-xs text-emerald-100 mt-0.5">Réponse instantanée en wolof et français ({displayPhone})</p>
              </div>
            </a>

            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Appel Téléphonique</h4>
                  <p className="text-xs text-gray-500">{displayPhone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Adresse Email</h4>
                  <p className="text-xs text-gray-500">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Horaires d'Ouverture</h4>
                  <p className="text-xs text-gray-500">Lundi au Samedi : 08h30 - 21h00 | Dimanche : 10h00 - 18h00</p>
                </div>
              </div>
            </div>

          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-base text-gray-900 mb-4">Envoyez-nous un message</h3>

            {formSent ? (
              <div className="p-6 bg-emerald-50 text-emerald-900 rounded-2xl text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base">Message envoyé avec succès !</h4>
                <p className="text-xs text-emerald-800">
                  Notre équipe service client prendra contact avec vous dans les plus brefs délais.
                </p>
                <button
                  onClick={onStartShopping}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Retourner à la boutique
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Votre Nom & Prénom *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Ousmane Sow"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Numéro de Téléphone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="77 000 00 00"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sujet du message</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Question sur la livraison à Thiès / Commande #DG-12345"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Votre Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Écrivez votre message ici..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer mon message</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export const AboutPage: React.FC<{ onStartShopping: () => void }> = ({ onStartShopping }) => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            NOTRE HISTOIRE & MISSION
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-display">
            À Propos de DIAYMA GAAW
          </h1>
          <p className="text-base text-gray-600">
            « Achetez simplement, recevez rapidement »
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
          <p>
            Fondée au Sénégal, <strong>DIAYMA GAAW</strong> est une plateforme e-commerce généraliste moderne née pour répondre aux exigences des consommateurs sénégalais : authenticité des produits, rapidité absolue de la livraison et simplicité des modes de paiement locaux (Wave, Orange Money et espèces à la livraison).
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-6">Nos Engagements :</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Produits vérifiés et certifiés 100% neufs :</strong> Aucun produit d'occasion reconditionné non certifié.</li>
            <li><strong>Livraison ultra-rapide :</strong> Entre 2h et 4h à Dakar intra-muros, et expédition sécurisée sous 24h à 48h dans toutes les régions du Sénégal.</li>
            <li><strong>Paiement en confiance :</strong> Le client a la possibilité d'inspecter et d'ouvrir son colis avant de payer.</li>
          </ul>
        </div>

        <div className="text-center pt-6">
          <button
            onClick={onStartShopping}
            className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            Découvrir nos produits en vedette
          </button>
        </div>

      </div>
    </div>
  );
};

export const FAQPage: React.FC<{ 
  onStartShopping?: () => void;
  onOpenContact?: () => void;
  settings?: StoreSettings;
}> = ({ onStartShopping, onOpenContact, settings }) => {
  const displayPhone = formatPhoneNumber(settings?.phone || settings?.whatsappPhone);
  const storeName = settings?.storeName || 'DIAYMA GAAW';

  const faqs = [
    {
      q: `Comment passer commande sur ${storeName} ?`,
      a: 'C’est très simple ! Choisissez vos articles, cliquez sur "Acheter maintenant" ou "Ajouter au panier", renseignez votre numéro de téléphone et votre adresse à Dakar ou en région, puis choisissez votre mode de paiement (Wave, Orange Money, Free Money ou à la livraison).'
    },
    {
      q: 'Quels sont les délais de livraison ?',
      a: 'À Dakar (Plateau, Médina, Almadies, Mermoz, etc.), la livraison s’effectue en 2h à 4h. Dans la banlieue (Guédiawaye, Pikine, Keur Massar, Rufisque), livraison le jour même. Dans les autres régions (Thiès, Touba, Saint-Louis, Ziguinchor, etc.), comptez 24h à 48h.'
    },
    {
      q: 'Puis-je payer en espèces à la livraison ?',
      a: 'Oui, absolument ! Le paiement à la livraison (Cash on delivery) est disponible pour Dakar et sa banlieue. Vous payez directement au coursier après inspection de votre colis.'
    },
    {
      q: 'Comment fonctionne la garantie et les retours ?',
      a: 'Tous nos articles bénéficient d’une garantie légale de conformité de 3 à 12 mois. Vous disposez de 7 jours après réception pour tester le produit et demander un échange si nécessaire.'
    },
    {
      q: 'Comment contacter le service client ?',
      a: `Vous pouvez nous joindre instantanément sur WhatsApp au ${displayPhone} ou par appel 7 jours sur 7.`
    }
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            RÉPONSES AUX QUESTIONS FRÉQUENTES
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-display">
            Foire Aux Questions (FAQ) & Retours
          </h1>
          <p className="text-sm text-gray-600">
            Toutes les réponses pour commander en toute tranquillité au Sénégal.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 bg-white rounded-2xl border border-gray-200 space-y-2 shadow-xs">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 pl-7 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onStartShopping && (
            <button
              onClick={onStartShopping}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Découvrir la boutique DIAYMA GAAW
            </button>
          )}

          {onOpenContact && (
            <button
              onClick={onOpenContact}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold text-xs rounded-xl shadow-xs transition"
            >
              Poser une autre question à notre équipe
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

