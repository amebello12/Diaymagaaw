import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CheckCircle2, 
  FileCode, 
  Layers, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { generateShopifyThemeZip } from '../utils/shopifyZipGenerator';

interface ShopifyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopifyExportModal: React.FC<ShopifyExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const zipBlob = await generateShopifyThemeZip();
      
      // Trigger browser download
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diayma-gaaw-shopify-theme.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch (err) {
      console.error('Erreur génération zip Shopify', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-gray-950 via-emerald-950 to-gray-900 text-white px-6 py-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
              🛍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-display">
                  Thème Shopify Téléversable (Online Store 2.0)
                </h2>
                <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full">
                  100% Compatible
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Téléchargez l'archive .ZIP prête à être téléversée sur votre boutique Shopify officielle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 text-xs sm:text-sm text-gray-700">
          
          {/* Main Download CTA Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-red-50 p-6 rounded-3xl border-2 border-emerald-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Download className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900 font-display">
                diayma-gaaw-shopify-theme.zip
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Package Liquid officiel complet configuré avec la devise FCFA, Wave, Orange Money et la livraison à Dakar.
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition inline-flex items-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>
                {isGenerating ? 'Génération de l’archive en cours...' : 'TÉLÉCHARGER LE THÈME SHOPIFY (.ZIP)'}
              </span>
            </button>

            {downloadSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>Téléchargement réussi ! Suivez les étapes ci-dessous pour l'installer sur Shopify.</span>
              </div>
            )}
          </div>

          {/* Installation Instructions */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-600" />
              Guide d'installation étape par étape sur Shopify :
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Connectez-vous à Shopify Admin</span>
                </div>
                <p className="text-xs text-gray-600">
                  Accédez à votre compte vendeur sur <em>votre-boutique.myshopify.com/admin</em>.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Menu Boutique en ligne</span>
                </div>
                <p className="text-xs text-gray-600">
                  Dans la barre latérale gauche, cliquez sur <strong>Boutique en ligne</strong> &gt; <strong>Thèmes</strong>.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Téléverser l'archive .ZIP</span>
                </div>
                <p className="text-xs text-gray-600">
                  Cliquez sur <strong>Ajouter un thème</strong> puis <strong>Téléverser le fichier zip</strong> et sélectionnez le fichier téléchargé.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Publier ou Personnaliser</span>
                </div>
                <p className="text-xs text-gray-600">
                  Cliquez sur <strong>Publier</strong> pour mettre en ligne instantanément votre boutique au Sénégal !
                </p>
              </div>
            </div>
          </div>

          {/* Included Features Checklist */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-xs text-gray-900 uppercase">
              Fichiers & Structure inclus dans l'archive Shopify :
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-700">
              <span className="flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                layout/theme.liquid
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                sections/header.liquid
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                sections/hero-banner.liquid
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                sections/trust-badges.liquid
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                snippets/whatsapp-floating.liquid
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                config/settings_schema.json
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
