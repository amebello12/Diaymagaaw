import React from 'react';
import { Truck, CreditCard, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { ActiveView } from '../types';

interface TrustBadgesProps {
  onNavigate?: (view: ActiveView, categorySlug?: string | null) => void;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ onNavigate }) => {
  const items = [
    {
      icon: <Truck className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50/80 border-emerald-100 hover:border-emerald-300',
      title: '🚚 Livraison rapide',
      desc: 'Livraison à Dakar (2h-4h) et dans toutes les régions du Sénégal.',
      view: 'delivery' as ActiveView,
      categorySlug: null,
      actionText: 'Voir nos zones & tarifs'
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50/80 border-blue-100 hover:border-blue-300',
      title: '💳 Paiement sécurisé',
      desc: 'Wave, Orange Money, Free Money ou paiement en espèces à la livraison.',
      view: 'faq' as ActiveView,
      categorySlug: null,
      actionText: 'Moyens de paiement'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50/80 border-amber-100 hover:border-amber-300',
      title: '🔒 Achat 100% garanti',
      desc: 'Vos informations et commandes sont protégées. Service client 7j/7.',
      view: 'about' as ActiveView,
      categorySlug: null,
      actionText: 'Découvrir nos engagements'
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-red-600" />,
      bg: 'bg-red-50/80 border-red-100 hover:border-red-300',
      title: '✅ Produits vérifiés',
      desc: 'Articles neufs, authentiques et accompagnés d’une garantie.',
      view: 'shop' as ActiveView,
      categorySlug: null,
      actionText: 'Parcourir le catalogue'
    }
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            CONFIANCE & TRANSPARENCE AU SÉNÉGAL
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-2 font-display">
            Pourquoi choisir DIAYMA GAAW ?
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => onNavigate && onNavigate(item.view, item.categorySlug)}
              className={`p-5 rounded-2xl border ${item.bg} flex flex-col justify-between transition hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center mb-4 border border-gray-100 group-hover:scale-105 transition">
                  {item.icon}
                </div>
                <h4 className="font-extrabold text-gray-900 text-base mb-1 group-hover:text-red-600 transition">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {onNavigate && (
                <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-gray-700 group-hover:text-red-600 transition">
                  <span>{item.actionText}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

