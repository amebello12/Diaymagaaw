import React from 'react';
import { ActiveView, StoreSettings } from '../types';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Truck,
  Lock
} from 'lucide-react';
import { STORE_PHONE_DISPLAY, STORE_EMAIL, STORE_PHONE_RAW, formatPhoneNumber, cleanPhoneForWhatsApp } from '../utils/currency';
import { WaveLogo, OrangeMoneyLogo, FreeMoneyLogo, CashOnDeliveryLogo } from './PaymentLogos';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate: (view: ActiveView, categorySlug?: string | null) => void;
  onOpenExportShopify?: () => void;
  onOpenAdmin?: () => void;
  settings?: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin, settings }) => {
  const rawPhone = cleanPhoneForWhatsApp(settings?.whatsappPhone || settings?.phone);
  const displayPhone = formatPhoneNumber(settings?.phone || settings?.whatsappPhone);
  const email = settings?.email || STORE_EMAIL;
  const address = settings?.address || 'Dakar, Sénégal (Livraisons Dakar & toutes les régions)';

  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-12 border-t border-gray-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Col 1 & 2: Brand Story */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-block bg-white p-2 rounded-2xl shadow-md border border-gray-800">
              <BrandLogo size="md" />
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              {settings?.slogan ? (
                <span>« <strong className="text-gray-200">{settings.slogan}</strong> »</span>
              ) : (
                <span>« <strong className="text-gray-200">Achetez simplement, recevez rapidement</strong> » — La boutique en ligne de référence pour vos achats d'électronique, électroménager, maison et santé au Sénégal.</span>
              )}
            </p>

            <div className="space-y-2 text-xs text-gray-300 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href={`tel:+${rawPhone}`} className="hover:text-white transition">
                  {displayPhone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition">
                  {email}
                </a>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-900 hover:bg-blue-600 text-gray-300 hover:text-white flex items-center justify-center transition text-xs font-bold"
                aria-label="Facebook DIAYMA GAAW"
              >
                FB
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-900 hover:bg-pink-600 text-gray-300 hover:text-white flex items-center justify-center transition text-xs font-bold"
                aria-label="Instagram DIAYMA GAAW"
              >
                IG
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-900 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center transition text-xs font-bold"
                aria-label="TikTok DIAYMA GAAW"
              >
                TT
              </a>
              <a
                href={`https://wa.me/${rawPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-900 hover:bg-emerald-600 text-gray-300 hover:text-white flex items-center justify-center transition"
                aria-label="WhatsApp DIAYMA GAAW"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Rayons / Collections */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Nos Rayons
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('shop', 'telephones-accessoires')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Téléphones & Accessoires
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'electromenager')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Électroménager & Cuisine
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'informatique')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Informatique & Bureautique
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'tv-audio')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Smart TV & Audio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'sante-bien-etre')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Santé & Bien-être
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'promotions')}
                  className="text-red-400 font-bold hover:text-red-300 transition cursor-pointer"
                >
                  🔥 Offres & Promos Flash
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Service Client */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Service Client
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('delivery', null)}
                  className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tarifs & Délais Livraison</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq', null)}
                  className="hover:text-white transition cursor-pointer"
                >
                  Garanties & Retours (7 jours)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq', null)}
                  className="hover:text-white transition cursor-pointer"
                >
                  Foire Aux Questions (FAQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about', null)}
                  className="hover:text-white transition cursor-pointer"
                >
                  À propos de DIAYMA GAAW
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact', null)}
                  className="hover:text-white transition cursor-pointer"
                >
                  Contact & Support Client
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Paiements Officiels Sénégal */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Paiements Mobiles Officiels
            </h4>
            <p className="text-xs text-gray-400">
              Réglez en toute sérénité au Sénégal avec nos partenaires officiels :
            </p>

            <div className="flex flex-col items-start gap-2 pt-1">
              {settings?.enableWave !== false && <WaveLogo size="sm" />}
              {settings?.enableOrangeMoney !== false && <OrangeMoneyLogo size="sm" />}
              {settings?.enableFreeMoney !== false && <FreeMoneyLogo size="sm" />}
              {settings?.enableCashOnDelivery !== false && <CashOnDeliveryLogo size="sm" />}
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Bonjour ${settings?.storeName || 'DIAYMA GAAW'}, je souhaite passer commande.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/40"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Assistance WhatsApp 7j/7</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-xs text-gray-500">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p>
              © {new Date().getFullYear()} DIAYMA GAAW Sénégal. Tous droits réservés.
            </p>
            
            {/* Cadenas discret / masqué pour l'accès administration */}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="opacity-15 hover:opacity-100 transition-opacity duration-300 p-1 text-gray-700 hover:text-gray-400 cursor-pointer flex items-center gap-1 group mt-0.5"
                title="Accès Administrateur DIAYMA GAAW"
                aria-label="Accès Administrateur"
              >
                <Lock className="w-3 h-3 text-gray-700 group-hover:text-red-500 transition-colors" />
                <span className="sr-only">Administration</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => onNavigate('faq', null)} className="hover:underline cursor-pointer">Mentions légales</button>
            <button onClick={() => onNavigate('faq', null)} className="hover:underline cursor-pointer">CGV</button>
            <button onClick={() => onNavigate('faq', null)} className="hover:underline cursor-pointer">Confidentialité</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
