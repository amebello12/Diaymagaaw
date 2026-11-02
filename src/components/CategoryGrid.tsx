import React from 'react';
import { Category, Product } from '../types';
import { 
  Smartphone, 
  Laptop, 
  Tv, 
  Refrigerator, 
  Home, 
  HeartPulse, 
  Headphones, 
  Flame,
  ArrowRight,
  Speaker,
  Sun,
  Camera,
  Zap,
  Volume2
} from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  products?: Product[];
  onSelectCategory: (categorySlug: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  products = [],
  onSelectCategory
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Speaker':
      case 'Volume2':
        return <Speaker className="w-5 h-5 text-indigo-600" />;
      case 'Sun':
      case 'Zap':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Camera':
        return <Camera className="w-5 h-5 text-cyan-600" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5" />;
      case 'Tv':
        return <Tv className="w-5 h-5" />;
      case 'Refrigerator':
        return <Refrigerator className="w-5 h-5" />;
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5" />;
      case 'Headphones':
        return <Headphones className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-red-500 fill-red-500" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Nos Rayons Principaux</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 font-display">
              Explorez par Catégories
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Trouvez les meilleurs équipements électroniques, maison & bien-être au Sénégal
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat) => {
            const isPromo = cat.slug === 'promotions';

            // Photo réelle d'un produit présent dans cette collection
            const matchingProduct = isPromo
              ? products.find(p => (p.discountPercent && p.discountPercent > 0) && p.images && p.images.length > 0)
              : products.find(p => p.category === cat.slug && p.images && p.images.length > 0);

            const displayImage = (matchingProduct && matchingProduct.images && matchingProduct.images[0])
              ? matchingProduct.images[0]
              : cat.image;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group relative text-left rounded-2xl overflow-hidden border p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isPromo 
                    ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:border-red-400' 
                    : 'bg-gray-50 hover:bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Product image from collection */}
                <div className="relative h-28 sm:h-36 rounded-xl overflow-hidden mb-3 bg-gray-900">
                  <img
                    src={displayImage}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-gray-950/20 to-transparent"></div>
                  
                  <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-sm">
                    {getIcon(cat.icon)}
                  </div>

                  {isPromo ? (
                    <div className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" />
                      <span>PROMO</span>
                    </div>
                  ) : matchingProduct ? (
                    <div className="absolute top-2.5 right-2.5 bg-gray-950/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/20">
                      Photo article réel
                    </div>
                  ) : null}

                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md">
                      {cat.itemCount} articles
                    </span>
                    {matchingProduct && (
                      <span className="text-[10px] text-gray-200/90 truncate max-w-[110px] hidden sm:inline">
                        {matchingProduct.name.split(' ')[0]} {matchingProduct.name.split(' ')[1] || ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-sm sm:text-base font-bold truncate transition ${
                      isPromo ? 'text-red-600' : 'text-gray-900 group-hover:text-red-600'
                    }`}>
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                      {matchingProduct ? `Inclus : ${matchingProduct.name}` : (cat.description || 'Voir la collection')}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition shrink-0 ml-2">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
