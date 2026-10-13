import React, { useState, useEffect } from 'react';
import { X, Gift, Check, ArrowRight } from 'lucide-react';

interface WelcomePopupProps {
  onShopNow: () => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onShopNow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Show after 3.5 seconds if not dismissed previously
    const hasSeen = sessionStorage.getItem('dg_welcome_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('dg_welcome_seen', 'true');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('BIENVENUE10');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-5 border border-gray-100">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gift Graphic */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/30 animate-pulse">
          <Gift className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            OFFRE EXCLUSIVE DE BIENVENUE
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 font-display">
            🎁 BIENVENUE CHEZ DIAYMA GAAW
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Recevez une réduction spéciale de <strong className="text-red-600 font-bold">-10%</strong> sur votre toute première commande au Sénégal !
          </p>
        </div>

        {/* Coupon Code Box */}
        <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-red-300 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] text-gray-400 font-bold uppercase">Votre Code Promo :</span>
            <span className="text-lg font-black font-mono text-red-600 tracking-wider">
              BIENVENUE10
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copié !</span>
              </>
            ) : (
              <span>Copier</span>
            )}
          </button>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => {
            handleClose();
            onShopNow();
          }}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-xs rounded-2xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
        >
          <span>UTILISER MON CODE & COMMANDER</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-gray-400">
          Valable sur tout le catalogue. Paiement Wave, Orange Money ou à la livraison.
        </p>

      </div>
    </div>
  );
};
