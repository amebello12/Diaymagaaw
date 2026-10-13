import React, { useState, useMemo } from 'react';
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  MessageSquare, 
  Filter, 
  Plus, 
  Search, 
  Sparkles, 
  MapPin, 
  User, 
  X, 
  ShieldCheck, 
  Award,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { Review, Product, ActiveView } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  products: Product[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
  onSelectProduct?: (product: Product) => void;
  onNavigate?: (view: ActiveView, categorySlug?: string | null) => void;
  isFullPage?: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  products,
  onAddReview,
  onSelectProduct,
  onNavigate,
  isFullPage = false
}) => {
  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterProductId, setFilterProductId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [helpfulReviews, setHelpfulReviews] = useState<Record<string, number>>({});
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>({});

  // Review Form States
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formProductId, setFormProductId] = useState<string>('');
  const [formComment, setFormComment] = useState('');
  const [formVerified, setFormVerified] = useState(true);
  const [formSuccessMessage, setFormSuccessMessage] = useState(false);
  const [formError, setFormError] = useState('');

  // Rating labels helper
  const ratingLabels: Record<number, string> = {
    1: 'Décevant (1/5)',
    2: 'Passable (2/5)',
    3: 'Correct / Moyen (3/5)',
    4: 'Très bien (4/5)',
    5: 'Excellent ! (5/5)'
  };

  // Stats calculation
  const totalReviews = reviews.length;
  const averageRating = useMemo(() => {
    if (totalReviews === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / totalReviews).toFixed(1));
  }, [reviews, totalReviews]);

  // Star distribution breakdown
  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Star filter
      if (filterRating !== null && Math.round(r.rating) !== filterRating) {
        return false;
      }
      // Product filter
      if (filterProductId !== 'all') {
        if (filterProductId === 'general') {
          if (r.productId && r.productId !== 'general') return false;
        } else if (r.productId !== filterProductId) {
          return false;
        }
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesComment = r.comment.toLowerCase().includes(query);
        const matchesAuthor = r.authorName.toLowerCase().includes(query);
        const matchesCity = r.city.toLowerCase().includes(query);
        if (!matchesComment && !matchesAuthor && !matchesCity) return false;
      }
      return true;
    });
  }, [reviews, filterRating, filterProductId, searchTerm]);

  // Helpful click handler
  const handleHelpfulClick = (reviewId: string) => {
    if (userVoted[reviewId]) return;
    setUserVoted(prev => ({ ...prev, [reviewId]: true }));
    setHelpfulReviews(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
  };

  // Submit Review Form
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthorName.trim()) {
      setFormError('Veuillez renseigner votre nom ou prénom.');
      return;
    }
    if (!formComment.trim()) {
      setFormError('Veuillez écrire un commentaire ou votre retour d’expérience.');
      return;
    }

    const selectedProduct = formProductId ? formProductId : (products[0]?.id || 'general');

    onAddReview({
      productId: selectedProduct,
      authorName: formAuthorName.trim(),
      city: formCity.trim() || 'Dakar',
      rating: formRating,
      comment: formComment.trim(),
      verifiedPurchase: formVerified
    });

    setFormSuccessMessage(true);
    setFormError('');

    setTimeout(() => {
      setFormSuccessMessage(false);
      setIsModalOpen(false);
      // Reset form
      setFormAuthorName('');
      setFormCity('');
      setFormComment('');
      setFormRating(5);
    }, 1800);
  };

  // Find product by id
  const getProductForReview = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  return (
    <section id="avis-clients" className={`py-12 sm:py-16 ${isFullPage ? 'bg-gray-50 min-h-screen' : 'bg-white border-t border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb if full page */}
        {isFullPage && onNavigate && (
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6">
            <button 
              onClick={() => onNavigate('home', null)}
              className="hover:text-red-600 transition"
            >
              Accueil
            </button>
            <span>/</span>
            <span className="text-gray-900 font-bold">Avis & Expériences Clients</span>
          </nav>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Retours d'Expérience Réels au Sénégal</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight font-display">
              Avis Clients Certifiés
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl">
              Découvrez les témoignages de nos clients livrés à Dakar, Thiès, Touba, Saint-Louis et partout au Sénégal.
            </p>
          </div>

          {/* Action Button: Give Review */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm sm:text-base font-extrabold rounded-2xl shadow-lg shadow-red-600/25 transition cursor-pointer self-start md:self-auto"
          >
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span>Donner mon avis</span>
          </button>
        </div>

        {/* Big Rating Summary Banner */}
        <div className="bg-linear-to-br from-gray-900 via-gray-900 to-black text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl mb-10 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Score Box */}
            <div className="lg:col-span-4 text-center lg:text-left flex flex-col items-center lg:items-start justify-center border-b lg:border-b-0 lg:border-r border-gray-800 pb-6 lg:pb-0 lg:pr-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight font-display">
                  {averageRating}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-gray-400">/ 5</span>
              </div>

              {/* 5 Big Gold Stars */}
              <div className="flex items-center gap-1.5 my-2.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${
                      s <= Math.round(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs sm:text-sm font-bold text-gray-300">
                Basé sur <span className="text-white font-extrabold">{totalReviews} avis</span> certifiés DIAYMA GAAW
              </p>

              <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% achats et livraisons vérifiés</span>
              </div>
            </div>

            {/* Middle: Star breakdown bars */}
            <div className="lg:col-span-5 space-y-2">
              {[5, 4, 3, 2, 1].map((starVal) => {
                const count = starCounts[starVal] || 0;
                const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                const isSelected = filterRating === starVal;

                return (
                  <button
                    key={starVal}
                    onClick={() => setFilterRating(isSelected ? null : starVal)}
                    className={`w-full flex items-center gap-3 text-xs sm:text-sm text-left group p-1.5 rounded-xl transition cursor-pointer ${
                      isSelected ? 'bg-white/15 ring-1 ring-white/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1 w-16 sm:w-20 font-bold text-gray-300">
                      <span>{starVal}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>

                    {/* Bar progress */}
                    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="w-16 text-right text-xs font-mono text-gray-400 group-hover:text-white">
                      <span>{count}</span>
                      <span className="text-[10px] text-gray-500 ml-1">({percent}%)</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Trust badges Senegal */}
            <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Clients Satisfaits</h4>
                  <p className="text-[11px] text-gray-400">Paiement à la livraison après contrôle du colis.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Partout au Sénégal</h4>
                  <p className="text-[11px] text-gray-400">Dakar express 2h-4h, banlieue et régions en 24h-48h.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Partager mon expérience</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Rating filter pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrer :</span>
            </span>

            <button
              onClick={() => setFilterRating(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filterRating === null
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-200/70 border border-gray-200'
              }`}
            >
              Tous ({reviews.length})
            </button>

            {[5, 4, 3].map((star) => (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  filterRating === star
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-200/70 border border-gray-200'
                }`}
              >
                <span>{star}</span>
                <Star className={`w-3 h-3 ${filterRating === star ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                <span className="text-[10px] opacity-75">({starCounts[star] || 0})</span>
              </button>
            ))}
          </div>

          {/* Product filter & text search */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            
            {/* Filter by product */}
            <div className="relative w-full sm:w-auto">
              <select
                value={filterProductId}
                onChange={(e) => setFilterProductId(e.target.value)}
                className="w-full sm:w-48 pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-red-600 appearance-none cursor-pointer"
              >
                <option value="all">Tous les produits</option>
                <option value="general">Avis service global</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none text-xs">▼</span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Rechercher par mot-clé, ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-600"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Reviews Cards Grid */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 p-8">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Aucun avis ne correspond à vos critères</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Essayez de réinitialiser vos filtres ou soyez le premier à donner votre avis sur ce produit !
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {(filterRating !== null || filterProductId !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setFilterRating(null);
                    setFilterProductId('all');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition"
                >
                  Réinitialiser les filtres
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
              >
                Laisser un avis
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReviews.map((rev) => {
              const product = getProductForReview(rev.productId);
              const initials = rev.authorName
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'DG';

              const votes = (helpfulReviews[rev.id] || 0);
              const hasVoted = userVoted[rev.id];

              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top: Author, Avatar, Date, City */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-red-600 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
                              {rev.authorName}
                            </h4>
                            {rev.verifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200" title="Achat certifié par DIAYMA GAAW">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Achat Vérifié</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-500" />
                              {rev.city || 'Dakar'}
                            </span>
                            <span>•</span>
                            <span>{rev.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Numerical score tag */}
                      <span className="text-xs font-black px-2 py-0.5 bg-amber-50 text-amber-900 rounded-md border border-amber-200 shrink-0">
                        {rev.rating}/5
                      </span>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1 mb-2.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Product Mentioned if applicable */}
                    {product && (
                      <button
                        onClick={() => onSelectProduct && onSelectProduct(product)}
                        className="w-full mb-3 p-2 bg-gray-50 hover:bg-red-50/50 rounded-xl border border-gray-100 hover:border-red-200 transition text-left flex items-center gap-2.5 group cursor-pointer"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-8 h-8 object-contain bg-white rounded-lg border border-gray-200 p-0.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Produit évalué</span>
                          <span className="text-xs font-bold text-gray-800 group-hover:text-red-600 truncate block">
                            {product.name}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 shrink-0" />
                      </button>
                    )}

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Card Bottom: Helpful thumb */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="text-[11px] text-gray-400">
                      Livraison & service DIAYMA GAAW
                    </span>

                    <button
                      onClick={() => handleHelpfulClick(rev.id)}
                      disabled={hasVoted}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition text-xs font-semibold ${
                        hasVoted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'hover:bg-gray-100 text-gray-600 cursor-pointer'
                      }`}
                      title={hasVoted ? 'Vous avez trouvé cet avis utile' : 'Cet avis vous a-t-il été utile ?'}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                      <span>{hasVoted ? 'Utile' : 'Utile'}</span>
                      {votes > 0 && <span className="font-bold">({votes})</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA for more engagement */}
        {!isFullPage && onNavigate && (
          <div className="mt-10 p-6 bg-linear-to-r from-red-50 to-amber-50 rounded-3xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-gray-900">
                Vous avez récemment commandé chez DIAYMA GAAW ?
              </h3>
              <p className="text-xs text-gray-600">
                Aidez la communauté et les futurs acheteurs en partageant votre note avec étoiles et votre avis sur la livraison !
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0 cursor-pointer"
            >
              Donner mon avis maintenant
            </button>
          </div>
        )}

      </div>

      {/* MODAL: DONNER UN AVIS CLIENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-linear-to-r from-red-600 to-red-700 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-200 block">
                  Votre expérience compte
                </span>
                <h3 className="text-lg sm:text-xl font-black">
                  Donner mon avis & ma note
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              
              {formSuccessMessage ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-black text-gray-900">Merci pour votre avis !</h4>
                  <p className="text-xs text-gray-600 max-w-xs mx-auto">
                    Votre note de <span className="font-bold text-amber-600">{formRating}/5 étoiles</span> et votre commentaire ont été publiés avec succès sur DIAYMA GAAW.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  
                  {/* Rating Selector with Stars */}
                  <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl text-center space-y-2">
                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                      Attribuez une note avec les étoiles *
                    </label>

                    {/* Interactive Stars */}
                    <div className="flex items-center justify-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (formHoverRating || formRating) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setFormRating(star)}
                            onMouseEnter={() => setFormHoverRating(star)}
                            onMouseLeave={() => setFormHoverRating(0)}
                            className="p-1 text-2xl transition transform hover:scale-125 focus:outline-none cursor-pointer"
                            aria-label={`Donner une note de ${star} sur 5`}
                          >
                            <Star
                              className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Dynamic Label */}
                    <p className="text-xs font-extrabold text-amber-800">
                      {ratingLabels[formHoverRating || formRating]}
                    </p>
                  </div>

                  {/* Error Alert */}
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                      {formError}
                    </div>
                  )}

                  {/* Product Concerned */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Produit concerné par votre avis
                    </label>
                    <select
                      value={formProductId}
                      onChange={(e) => setFormProductId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-600 focus:bg-white"
                    >
                      <option value="">Avis général sur le service & livraison DIAYMA GAAW</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Author Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Votre nom ou prénom *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formAuthorName}
                        onChange={(e) => setFormAuthorName(e.target.value)}
                        placeholder="Ex : Marième Diagne, Pape Samba..."
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-red-600 focus:bg-white"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* City or Neighborhood */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Votre ville ou quartier au Sénégal *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="Ex : Dakar (Liberté 6), Thiès, Touba, Saint-Louis..."
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-red-600 focus:bg-white"
                      />
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Detailed Comment */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Votre avis détaillé *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      placeholder="Décrivez votre expérience : rapidité de la livraison, qualité du produit, conformité, facilité du paiement Wave / Orange Money..."
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                  </div>

                  {/* Verified purchase checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formVerified}
                      onChange={(e) => setFormVerified(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-[11px] text-gray-600 font-semibold">
                      J'atteste avoir commandé ce produit ou utilisé les services DIAYMA GAAW
                    </span>
                  </label>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition shadow-md shadow-red-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      <span>Publier mon avis ({formRating}/5)</span>
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>
        </div>
      )}

    </section>
  );
};
