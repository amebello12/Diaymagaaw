import React, { useState } from 'react';
import { 
  X, 
  User, 
  Package, 
  MapPin, 
  Search, 
  CheckCircle, 
  Clock, 
  Truck, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Order, CustomerUser } from '../types';
import { formatFCFA } from '../utils/currency';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentUser: CustomerUser | null;
  onLogin: (user: CustomerUser) => void;
  onLogout: () => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentUser,
  onLogin,
  onLogout
}) => {
  const [tab, setTab] = useState<'orders' | 'track' | 'profile' | 'login'>('orders');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState('');

  // Login form state
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  if (!isOpen) return null;

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError('');
    setTrackedOrder(null);

    const query = trackingNumberInput.trim().toUpperCase();
    if (!query) return;

    const found = orders.find(
      (o) => o.orderNumber.toUpperCase() === query || o.trackingNumber.toUpperCase() === query
    );

    if (found) {
      setTrackedOrder(found);
    } else {
      setTrackingError(`Aucune commande trouvée avec la référence "${query}". Vérifiez votre code (ex: DG-12345).`);
    }
  };

  const handleRegisterOrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !phoneInput.trim()) return;

    const newUser: CustomerUser = {
      id: 'usr-' + Date.now(),
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      email: emailInput.trim() || 'client@diaymagaaw.sn',
      savedAddresses: [
        {
          region: 'Dakar',
          city: 'Dakar',
          neighborhood: 'Sacré-Cœur',
          address: 'Villa 124'
        }
      ]
    };
    onLogin(newUser);
    setTab('orders');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 font-display">
                Espace Client & Suivi de Commande
              </h2>
              <p className="text-xs text-gray-500">
                {currentUser ? `Connecté : ${currentUser.name}` : 'Accédez à votre historique'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 px-6 bg-white overflow-x-auto">
          <button
            onClick={() => setTab('orders')}
            className={`py-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap ${
              tab === 'orders' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Mes Commandes ({orders.length})
          </button>

          <button
            onClick={() => setTab('track')}
            className={`py-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              tab === 'track' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Suivre un Colis</span>
          </button>

          {currentUser ? (
            <button
              onClick={() => setTab('profile')}
              className={`py-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                tab === 'profile' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Mon Profil
            </button>
          ) : (
            <button
              onClick={() => setTab('login')}
              className={`py-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                tab === 'login' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Connexion / Inscription
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          
          {/* TAB: Orders List */}
          {tab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Aucune commande enregistrée</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Vous n'avez pas encore passé de commande sur cette session.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-black text-sm text-gray-900">
                            #{order.orderNumber}
                          </span>
                          <span className="block text-[11px] text-gray-400">{order.createdAt}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded-full">
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        {order.items.map((it) => (
                          <div key={it.product.id} className="flex justify-between text-gray-700">
                            <span className="truncate max-w-xs">{it.quantity}x {it.product.name}</span>
                            <span className="font-semibold">{formatFCFA(it.product.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Destinataire : {order.customer.fullName} ({order.customer.city})</span>
                        <span className="font-black text-red-600 font-mono text-sm">{formatFCFA(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Track a Package */}
          {tab === 'track' && (
            <div className="space-y-6">
              <form onSubmit={handleTrackSearch} className="space-y-3">
                <label className="block text-xs font-bold text-gray-700">
                  Entrez votre référence de commande ou numéro de suivi
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    placeholder="ex: DG-84920 ou SN-TRACK-..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs uppercase font-mono focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Rechercher
                  </button>
                </div>
                {trackingError && (
                  <p className="text-xs text-red-600 font-semibold">{trackingError}</p>
                )}
              </form>

              {trackedOrder && (
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        Commande #{trackedOrder.orderNumber}
                      </h4>
                      <p className="text-xs text-gray-500">Date : {trackedOrder.createdAt}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                      ✓ En route
                    </span>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Commande confirmée</p>
                        <p className="text-[11px] text-gray-500">Paiement : {trackedOrder.paymentMethod.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Colis emballé & préparé au dépôt</p>
                        <p className="text-[11px] text-gray-500">Entrepôt Dakar</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                        3
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-900">En cours de livraison avec le coursier</p>
                        <p className="text-[11px] text-amber-800">Destination : {trackedOrder.customer.neighborhood}, {trackedOrder.customer.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Login / Register */}
          {tab === 'login' && (
            <form onSubmit={handleRegisterOrLogin} className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-gray-900">Créer mon compte client</h3>
                <p className="text-xs text-gray-500">Pour suivre vos commandes et sauvegarder vos adresses de livraison.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="ex: Aminata Fall"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Numéro de téléphone</label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="77 000 00 00"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email (Optionnel)</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="aminata@gmail.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Enregistrer mon compte
              </button>
            </form>
          )}

          {/* TAB: Profile */}
          {tab === 'profile' && currentUser && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-sm text-gray-900">{currentUser.name}</h4>
                <p className="text-xs text-gray-600">📱 {currentUser.phone}</p>
                <p className="text-xs text-gray-600">✉️ {currentUser.email}</p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-xs text-gray-700 uppercase">Adresses enregistrées</h5>
                {currentUser.savedAddresses.map((addr, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{addr.neighborhood}, {addr.city}</p>
                      <p className="text-gray-500">{addr.address}</p>
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Par défaut</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onLogout}
                className="py-2.5 px-4 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
