import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingCart, 
  Zap, 
  MessageCircle, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  ChevronRight,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { Product, Review, StoreSettings } from '../types';
import { formatFCFA, createWhatsAppProductMessage } from '../utils/currency';
import { ActiveFlame } from './ActiveFlame';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts?: Product[];
  reviews?: Review[];
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  onSelectProduct?: (product: Product) => void;
  onAddReview?: (review: Omit<Review, 'id' | 'date'>) => void;
  settings?: StoreSettings;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  reviews = [],
  onClose,
  onAddToCart = (_product: Product, _quantity: number) => {},
  onBuyNow = (_product: Product, _quantity: number) => {},
  onSelectProduct = (_product: Product) => {},
  onAddReview = (_review: Omit<Review, 'id' | 'date'>) => {},
  settings
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery' | 'warranty' | 'reviews'>('desc');
  
  // Review form state
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newCity, setNewCity] = useState('Dakar');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const productReviews = (reviews || []).filter(r => r.productId === product.id);
  const relatedProducts = (allProducts || [])
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim() || !newComment.trim()) return;
    onAddReview({
      productId: product.id,
      authorName: newAuthorName.trim(),
      city: newCity,
      rating: newRating,
      comment: newComment.trim(),
      verifiedPurchase: true
    });
    setReviewSubmitted(true);
    setNewAuthorName('');
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Sticky Header with Close Button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium truncate">
            <span>Accueil</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="capitalize">{product.category.replace('-', ' ')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-8 flex-1">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Gallery */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square w-full rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-4">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />

                {/* Promo Pill */}
                {product.discountPercent && product.discountPercent > 0 && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg">
                    PROMO -{product.discountPercent}%
                  </div>
                )}

                {/* Stock Pill */}
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-sm">
                  ✓ En stock à Dakar
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl bg-gray-50 border-2 overflow-hidden shrink-0 transition ${
                        activeImageIndex === idx ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Buy Box & Product Info */}
            <div className="lg:col-span-6 space-y-5">
              
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                  <span className="uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                    {product.brand || 'Boutique DIAYMA GAAW'}
                  </span>
                  <span>RÉF : {product.sku}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {product.rating} / 5
                  </span>
                  <span className="text-xs text-gray-500">
                    ({product.reviewsCount + productReviews.length} avis certifiés)
                  </span>
                </div>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
                    {formatFCFA(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-gray-400 line-through">
                        {formatFCFA(product.originalPrice)}
                      </span>
                      <span className="text-xs font-black text-red-600 bg-white px-2 py-0.5 rounded border border-red-200 flex items-center gap-1 shadow-xs">
                        <ActiveFlame size="xs" glow={false} />
                        <span>Économisez {formatFCFA(product.originalPrice - product.price)}</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="block text-[11px] text-gray-500 font-medium">Disponibilité :</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {product.stock} exemplaires restants
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700">Quantité :</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-gray-600 hover:text-red-600 transition"
                    aria-label="Diminuer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-black text-sm text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2.5 text-gray-600 hover:text-red-600 transition"
                    aria-label="Augmenter"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  Total : <strong className="text-gray-900">{formatFCFA(product.price * quantity)}</strong>
                </span>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-2">
                
                {/* 1. Buy Now (Direct Checkout) */}
                <button
                  onClick={() => onBuyNow(product, quantity)}
                  className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>ACHETER MAINTENANT ({formatFCFA(product.price * quantity)})</span>
                </button>

                {/* 2. Add to Cart */}
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="w-full py-3.5 px-6 bg-gray-900 hover:bg-gray-800 active:scale-98 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ajouter au panier</span>
                </button>

                {/* 3. WhatsApp Direct Order */}
                <a
                  href={createWhatsAppProductMessage(product.name, product.price, product.sku, settings?.whatsappPhone || settings?.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 text-center"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Commander sur WhatsApp</span>
                </a>
              </div>

              {/* Fast trust assurances */}
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-gray-600">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Livraison 2h à 4h à Dakar</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{product.warranty || 'Garantie officielle 6 mois'}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Detailed Tabs Navigation */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab('desc')}
                className={`px-5 py-3 text-xs sm:text-sm font-bold transition border-b-2 whitespace-nowrap ${
                  activeTab === 'desc'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Description Complète
              </button>

              <button
                onClick={() => setActiveTab('specs')}
                className={`px-5 py-3 text-xs sm:text-sm font-bold transition border-b-2 whitespace-nowrap ${
                  activeTab === 'specs'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Caractéristiques Techniques
              </button>

              <button
                onClick={() => setActiveTab('delivery')}
                className={`px-5 py-3 text-xs sm:text-sm font-bold transition border-b-2 whitespace-nowrap ${
                  activeTab === 'delivery'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Livraison au Sénégal
              </button>

              <button
                onClick={() => setActiveTab('warranty')}
                className={`px-5 py-3 text-xs sm:text-sm font-bold transition border-b-2 whitespace-nowrap ${
                  activeTab === 'warranty'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Garantie & Retours
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-5 py-3 text-xs sm:text-sm font-bold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>Avis Clients</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[11px]">
                  {productReviews.length}
                </span>
              </button>
            </div>

            {/* Tab Content Display */}
            <div className="py-6 text-sm text-gray-700 leading-relaxed">
              
              {activeTab === 'desc' && (
                <div className="space-y-4">
                  <p className="text-base font-medium text-gray-900">{product.description}</p>
                  <p className="text-gray-600">
                    Produit authentique et sélectionné par nos experts chez DIAYMA GAAW pour sa fiabilité, sa durabilité et son rapport qualité-prix imbattable sur le marché sénégalais.
                  </p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900">Fiche technique détaillée :</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.features.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="text-xs font-medium text-gray-800">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <h5 className="font-bold text-emerald-900 text-sm">📍 Dakar Centre & Plateau</h5>
                      <p className="text-xs text-emerald-800 mt-1">Délai : 2h à 4h chrono</p>
                      <p className="text-xs font-bold text-emerald-900 mt-2">Tarif : 1 500 FCFA</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <h5 className="font-bold text-blue-900 text-sm">📍 Banlieue (Guédiawaye, Keur Massar, Rufisque)</h5>
                      <p className="text-xs text-blue-800 mt-1">Délai : Même jour (4h-8h)</p>
                      <p className="text-xs font-bold text-blue-900 mt-2">Tarif : 2 000 FCFA</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <h5 className="font-bold text-amber-900 text-sm">📍 Thiès, Saint-Louis, Touba & Régions</h5>
                      <p className="text-xs text-amber-800 mt-1">Délai : 24h à 48h</p>
                      <p className="text-xs font-bold text-amber-900 mt-2">Tarif : 3 000 - 4 000 FCFA</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    💡 Vous pouvez vérifier le colis avec le livreur avant de payer en espèces ou par Wave / Orange Money / Free Money.
                  </p>
                </div>
              )}

              {activeTab === 'warranty' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      Garantie Sérénité DIAYMA GAAW
                    </h5>
                    <p className="text-xs text-gray-600 mt-1">
                      {product.warranty || 'Tous nos produits bénéficient d’une garantie légale de conformité avec remplacement à neuf en cas de défaut d’usine.'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-blue-600" />
                      Politique de retour & échange
                    </h5>
                    <p className="text-xs text-gray-600 mt-1">
                      Vous disposez de 7 jours après réception pour tester votre article. En cas de non-conformité, nous échangeons l’article gratuitement à votre domicile.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  
                  {/* Reviews List */}
                  <div className="space-y-3">
                    {productReviews.length === 0 ? (
                      <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-xl">
                        Soyez le premier client à laisser un avis pour ce produit !
                      </p>
                    ) : (
                      productReviews.map((rev) => (
                        <div key={rev.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{rev.authorName}</span>
                              <span className="text-xs text-gray-400">({rev.city})</span>
                              {rev.verifiedPurchase && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  ✓ Achat vérifié
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">{rev.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-700">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Review Form */}
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
                    <h5 className="font-bold text-sm text-gray-900 mb-3">Laisser un avis vérifié</h5>
                    {reviewSubmitted ? (
                      <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl">
                        ✓ Merci ! Votre avis a été enregistré avec succès.
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Votre Nom & Prénom</label>
                            <input
                              type="text"
                              required
                              value={newAuthorName}
                              onChange={(e) => setNewAuthorName(e.target.value)}
                              placeholder="ex: Aminata Ndiaye"
                              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Votre Ville / Quartier</label>
                            <input
                              type="text"
                              required
                              value={newCity}
                              onChange={(e) => setNewCity(e.target.value)}
                              placeholder="ex: Dakar (Mermoz)"
                              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Note sur 5</label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setNewRating(star)}
                                className="p-1"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Votre Commentaire</label>
                          <textarea
                            required
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Partagez votre expérience avec ce produit..."
                            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                        >
                          Publier mon avis
                        </button>
                      </form>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Related Products: « Vous pourriez aussi aimer » */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  Vous pourriez aussi aimer
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                      setActiveImageIndex(0);
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-red-300 transition cursor-pointer group"
                  >
                    <img src={rel.images[0]} alt={rel.name} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate group-hover:text-red-600">{rel.name}</p>
                      <p className="text-xs font-black text-red-600 mt-0.5">{formatFCFA(rel.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
