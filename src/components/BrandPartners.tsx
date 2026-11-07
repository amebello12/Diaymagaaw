import React from 'react';
import { ShieldCheck, Award, CheckCircle2, Headphones, Sparkles, ArrowRight } from 'lucide-react';

interface BrandPartnersProps {
  onSelectBrand?: (brandName: string) => void;
}

interface SponsorBrand {
  name: string;
  category: string;
  accentColor: string;
  logo: React.ReactNode;
  description: string;
}

export const BrandPartners: React.FC<BrandPartnersProps> = ({ onSelectBrand }) => {
  const brands: SponsorBrand[] = [
    {
      name: 'JBL',
      category: 'Audio & Sonorisation',
      accentColor: '#FF5A00',
      description: 'Enceintes Bluetooth, PartyBox & Son Pro',
      logo: (
        <div className="flex items-center justify-center font-black tracking-tighter">
          <div className="bg-[#FF5A00] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs">
            <span className="text-xl sm:text-2xl font-black tracking-tight font-sans">JBL</span>
            <div className="w-1.5 h-4 bg-white rounded-xs"></div>
          </div>
        </div>
      ),
    },
    {
      name: 'Samsung',
      category: 'Smartphones & Écrans',
      accentColor: '#1428A0',
      description: 'Galaxy, Téléviseurs Crystal UHD & Frigos',
      logo: (
        <div className="flex items-center justify-center">
          <div className="border-2 border-[#1428A0] text-[#1428A0] px-3.5 py-1 rounded-full font-black tracking-[0.2em] text-sm sm:text-base font-sans uppercase">
            SAMSUNG
          </div>
        </div>
      ),
    },
    {
      name: 'Sony',
      category: 'Hi-Fi & Home Cinéma',
      accentColor: '#000000',
      description: 'Systèmes audio puissants & Bravia 4K',
      logo: (
        <div className="flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-serif font-black tracking-[0.18em] text-gray-950 uppercase">
            SONY
          </span>
        </div>
      ),
    },
    {
      name: 'Ahuja',
      category: 'Sonorisation Public Adress',
      accentColor: '#C8102E',
      description: 'Amplis, Haut-parleurs de mosquée & Événements',
      logo: (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#C8102E] text-white flex items-center justify-center font-bold text-[10px]">
              A
            </div>
            <span className="text-lg sm:text-xl font-black tracking-widest text-[#C8102E] font-sans">
              AHUJA
            </span>
          </div>
        </div>
      ),
    },
    {
      name: 'Behringer',
      category: 'Tables de Mixage & Studio',
      accentColor: '#EA580C',
      description: 'Tables amplifiées, Micros studio & Amplis',
      logo: (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-500 fill-current">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-2.48 0-4.5-2.02-4.5-4.5S10.52 7.5 13 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z"/>
            </svg>
            <span className="text-sm sm:text-base font-black tracking-wider text-gray-900 uppercase">
              BEHRINGER
            </span>
          </div>
        </div>
      ),
    },
    {
      name: 'Astech',
      category: 'Électroménager Sénégal',
      accentColor: '#DC2626',
      description: 'Réfrigérateurs, Congélateurs & Split Inverter',
      logo: (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-red-600 rotate-45"></div>
            <span className="text-lg sm:text-xl font-black italic tracking-tighter text-red-600 uppercase">
              ASTECH
            </span>
          </div>
        </div>
      ),
    },
    {
      name: 'Sharp',
      category: 'Climatisation & Cuisine',
      accentColor: '#E60012',
      description: 'Micro-ondes, Climatiseurs & Écrans',
      logo: (
        <div className="flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-black tracking-wider text-[#E60012] font-sans uppercase">
            SHARP
          </span>
        </div>
      ),
    },
    {
      name: 'Shure',
      category: 'Micros & Systèmes HF',
      accentColor: '#059669',
      description: 'Micros filaires SM58 & Récepteurs sans fil',
      logo: (
        <div className="flex items-center justify-center">
          <div className="bg-emerald-950 text-emerald-400 px-3 py-1 rounded-md font-mono font-black text-sm sm:text-base tracking-widest uppercase border border-emerald-800">
            SHURE
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white via-gray-50 to-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100">
            <Award className="w-3.5 h-3.5 text-red-600" />
            <span>Grandes Marques & Partenaires Officiels</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 font-display">
            Matériel Audio, Électroménager & Téléphonie Certifié
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Retrouvez tous vos équipements d'origine des plus grands constructeurs mondiaux avec garantie officielle et SAV au Sénégal.
          </p>
        </div>

        {/* 8 Sponsor Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {brands.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => onSelectBrand?.(b.name)}
              className="group relative flex flex-col items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-red-400 hover:shadow-md transition-all duration-200 text-center cursor-pointer min-h-[120px]"
              title={`Voir les produits de la marque ${b.name}`}
            >
              <div className="w-full flex-1 flex items-center justify-center py-2 transition-transform duration-200 group-hover:scale-105">
                {b.logo}
              </div>
              <div className="w-full pt-2 border-t border-gray-100 mt-1">
                <span className="block text-[11px] font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {b.name}
                </span>
                <span className="block text-[9px] text-gray-500 truncate mt-0.5">
                  {b.category}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Official Warranty & Quality Trust Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">100% Produits d'Origine</h4>
                <p className="text-[11px] text-gray-500">Zéro contrefaçon, articles scellés avec numéro de série</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start pt-3 sm:pt-0 sm:pl-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">Garantie Réelle au Sénégal</h4>
                <p className="text-[11px] text-gray-500">Prise en charge SAV et assistance technique directe</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start pt-3 sm:pt-0 sm:pl-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">Service Client & Conseils</h4>
                <p className="text-[11px] text-gray-500">Conseillers disponibles 7j/7 sur WhatsApp et téléphone</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
