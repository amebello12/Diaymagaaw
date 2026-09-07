import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cleanPhoneForWhatsApp } from '../utils/currency';
import { StoreSettings } from '../types';

interface FloatingWhatsAppProps {
  settings?: StoreSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const [tooltipOpen, setTooltipOpen] = useState(true);
  const rawPhone = cleanPhoneForWhatsApp(settings?.whatsappPhone || settings?.phone);
  const storeName = settings?.storeName || 'DIAYMA GAAW';

  const defaultMessage = encodeURIComponent(
    `Bonjour ${storeName}, je souhaite avoir des informations sur vos produits et services de livraison au Sénégal.`
  );

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      
      {/* Mini Tooltip Bubble */}
      {tooltipOpen && (
        <div className="relative bg-white text-gray-900 px-3.5 py-2.5 rounded-2xl shadow-xl border border-gray-200 text-xs font-semibold max-w-xs flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300">
          <div>
            <p className="text-emerald-700 font-bold">Besoin d’aide ou commander ?</p>
            <p className="text-gray-500 text-[11px]">Écrivez-nous directement sur WhatsApp</p>
          </div>
          <button
            onClick={() => setTooltipOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            aria-label="Fermer la bulle"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main WhatsApp Action Button */}
      <a
        href={`https://wa.me/${rawPhone}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition group cursor-pointer"
        aria-label={`Contacter ${storeName} sur WhatsApp`}
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-emerald-600 animate-pulse"></span>
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-tight">
          Commander sur WhatsApp
        </span>
      </a>

    </div>
  );
};
