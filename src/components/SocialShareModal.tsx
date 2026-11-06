import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Facebook, 
  Send, 
  Mail, 
  ExternalLink,
  Instagram
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { 
  getProductShareUrl, 
  getProductShareText, 
  getWhatsAppShareLink, 
  getFacebookShareLink, 
  getTelegramShareLink, 
  getEmailShareLink,
  shareProductNative 
} from '../utils/socialShare';
import { formatFCFA } from '../utils/currency';

interface SocialShareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  settings?: StoreSettings;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  product,
  isOpen,
  onClose,
  settings
}) => {
  if (!isOpen || !product) return null;

  const [copied, setCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const shareUrl = getProductShareUrl(product);
  const shareText = getProductShareText(product, settings);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n👉 ${shareUrl}`);
      setCopied(true);
      setCopyFeedback('Lien et descriptif copiés dans le presse-papier !');
      setTimeout(() => {
        setCopied(false);
        setCopyFeedback(null);
      }, 3000);
    } catch {
      setCopyFeedback('Impossible de copier automatiquement.');
    }
  };

  const handleNativeShare = async () => {
    const res = await shareProductNative(product, settings);
    if (res.shared) {
      if (res.method === 'clipboard') {
        setCopied(true);
        setCopyFeedback('Lien copié dans le presse-papier !');
        setTimeout(() => {
          setCopied(false);
          setCopyFeedback(null);
        }, 3000);
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50/50 via-white to-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Partager cet article</h3>
              <p className="text-[11px] text-gray-500">Envoyer le lien directement à vos contacts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-14 h-14 object-contain rounded-xl bg-white border border-gray-200 shrink-0 p-1"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-gray-900 truncate">{product.name}</h4>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono font-black text-red-600 text-xs">{formatFCFA(product.price)}</span>
              {product.originalPrice && (
                <span className="text-[10px] text-gray-400 line-through">{formatFCFA(product.originalPrice)}</span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">✓ En stock chez DIAYMA GAAW</span>
          </div>
        </div>

        {/* Share Options Grid */}
        <div className="p-5 space-y-4">
          <p className="text-xs font-bold text-gray-700">Choisir une application :</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* 1. WhatsApp */}
            <a
              href={getWhatsAppShareLink(product, settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition group text-center"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                <MessageCircle className="w-5 h-5 fill-white" />
              </div>
              <span className="text-[11px] font-bold">WhatsApp</span>
            </a>

            {/* 2. Facebook */}
            <a
              href={getFacebookShareLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition group text-center"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                <Facebook className="w-5 h-5 fill-white" />
              </div>
              <span className="text-[11px] font-bold">Facebook</span>
            </a>

            {/* 3. Instagram / Autres (via Copie / Native Share) */}
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-gradient-to-tr from-amber-50 via-pink-50 to-purple-50 hover:from-amber-100 hover:to-purple-100 text-purple-900 border border-pink-200 transition group text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                <Instagram className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold">Instagram & +</span>
            </button>

            {/* 4. Telegram */}
            <a
              href={getTelegramShareLink(product, settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition group text-center"
            >
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                <Send className="w-5 h-5 fill-white" />
              </div>
              <span className="text-[11px] font-bold">Telegram</span>
            </a>

          </div>

          {/* Copy Link Input Bar */}
          <div className="pt-2">
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">
              Ou copiez directement le lien de la page :
            </label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 pr-2 focus-within:border-red-500 focus-within:bg-white transition">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs text-gray-700 px-2.5 outline-none font-mono truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
            {copyFeedback && (
              <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{copyFeedback}</span>
              </p>
            )}
          </div>

          {/* Native Share button for Smartphones */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3 px-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Ouvrir les options de partage du téléphone</span>
          </button>
        </div>
      </div>
    </div>
  );
};
