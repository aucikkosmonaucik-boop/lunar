import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { useCart } from '../hooks/useCart';
import { Package, MapPin, Heart, Settings, LogOut, Clock, ArrowRight, Trash2, Phone, Award, Coins, Sparkles, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLoyalty } from '../hooks/useLoyalty';
interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const AccountPage: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const { items: wishlistItems, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { loyaltyPoints, tier, rewards, userCoupons, history, redeemReward } = useLoyalty();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'addresses' | 'orders' | 'wishlist' | 'loyalty'>('overview');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Form states
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPassword, setEditPassword] = useState('');
  const [editStreet, setEditStreet] = useState(user?.street || '');
  const [editCity, setEditCity] = useState(user?.city || '');
  const [editPostal, setEditPostal] = useState(user?.postalCode || '');
  const [editCountry, setEditCountry] = useState(user?.country || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/orders/list');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditStreet(user.street || '');
      setEditCity(user.city || '');
      setEditPostal(user.postalCode || '');
      setEditCountry(user.country || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          password: editPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      await checkAuth?.();
      
      showNotification('Your profile has been updated successfully.');
      setEditPassword(''); 
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: editStreet,
          city: editCity,
          postalCode: editPostal,
          country: editCountry,
          phone: editPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update address');
      }

      await checkAuth?.();

      showNotification('Address updated successfully.');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('WARNING: This action is permanent. All your data, including order history and wishlist, will be deleted. Are you sure you want to proceed?');
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      await logout();
      navigate('/');
      window.location.reload(); // Force full reload to clear any remaining state
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'An error occurred during account deletion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!window.confirm('Are you sure you want to remove your saved address?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: '',
          city: '',
          postalCode: '',
          country: '',
          phone: '',
        }),
      });

      if (!response.ok) throw new Error('Failed to delete address');

      await checkAuth?.();
      showNotification('Address removed successfully.');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const accountSections = [
    {
      title: 'Punkty Lojalnościowe & Kupony',
      description: `Masz ${loyaltyPoints} pkt • Wymieniaj punkty na kupony rabatowe`,
      icon: <Award className="w-8 h-8 text-[#D4AF37] stroke-[1.2] group-hover:scale-110 transition-transform duration-300" />,
      action: () => setActiveTab('loyalty'),
      highlight: true,
    },
    {
      title: 'My Orders',
      description: 'Track packages, return or reorder purchased items',
      icon: <Package className="w-8 h-8 text-[#1a1a1a] stroke-[1.2] group-hover:text-[#D4AF37] transition-colors duration-300" />,
      action: () => setActiveTab('orders'),
    },
    {
      title: 'Addresses',
      description: 'Edit your delivery preferences and addresses for orders',
      icon: <MapPin className="w-8 h-8 text-[#1a1a1a] stroke-[1.2] group-hover:text-[#D4AF37] transition-colors duration-300" />,
      action: () => setActiveTab('addresses'),
    },
    {
      title: 'Wishlist',
      description: 'View your saved favorite items and collections',
      icon: <Heart className="w-8 h-8 text-[#1a1a1a] stroke-[1.2] group-hover:text-[#D4AF37] transition-colors duration-300" />,
      action: () => setActiveTab('wishlist'),
    },
    {
      title: 'Account Settings',
      description: 'Manage your personal details and password',
      icon: <Settings className="w-8 h-8 text-[#1a1a1a] stroke-[1.2] group-hover:text-[#D4AF37] transition-colors duration-300" />,
      action: () => setActiveTab('settings'),
    },
  ];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white" style={{ paddingTop: '100px' }}>
      <div className="w-full max-w-5xl px-4 pb-24 flex flex-col items-center mx-auto">
        <div className="mb-10 w-full">
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-4xl md:text-5xl tracking-widest text-[#1a1a1a] uppercase font-light text-center">
            My Account
          </h1>
          <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-gray-500">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

        {activeTab === 'overview' ? (
          <>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              {accountSections.map((section, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={section.action}
                  className="group flex flex-col sm:flex-row items-center sm:items-start p-8 border border-gray-200 hover:border-[#D4AF37] bg-white transition-all duration-300 text-center sm:text-left rounded-sm w-full shadow-sm hover:shadow-md"
                >
                  <div className="flex-shrink-0 sm:mr-6 mb-4 sm:mb-0">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#fcfaf5] transition-colors duration-300">
                      {section.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[14px] uppercase tracking-widest font-medium text-[#1a1a1a] mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">
                      {section.title}
                    </h2>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-16 flex items-center justify-center w-full text-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] font-medium text-gray-500 hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </>
        ) : activeTab === 'orders' ? (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-3xl text-[#1a1a1a] mb-10 tracking-widest uppercase text-center font-light">
              Order History
            </h2>
            
            <div className="w-full space-y-8">
              {ordersLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-wonders-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-sm border border-dashed border-gray-200">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4 stroke-[1]" />
                  <p className="text-gray-500 uppercase tracking-widest text-xs">No orders found yet</p>
                  <Link to="/shop" className="mt-6 inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-wonders-gold hover:text-[#1a1a1a] transition-colors">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden text-left">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Order Placed</p>
                          <p className="text-xs text-[#1a1a1a] font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Order ID</p>
                          <p className="text-xs text-[#1a1a1a] font-medium">{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Total</p>
                          <p className="text-xs text-[#1a1a1a] font-medium">
                            {order.total.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold ${order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-50 last:border-0 pb-6 last:pb-0 mb-6 last:mb-0">
                          <div className="w-24 h-24 bg-gray-50 flex-shrink-0 rounded-sm overflow-hidden border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow text-center sm:text-left">
                            <h3 className="text-sm font-medium text-[#1a1a1a] uppercase tracking-widest mb-2">{item.name}</h3>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-4">Qty: {item.quantity} • {item.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] text-wonders-gold uppercase tracking-widest font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              Estimated delivery: 3-5 business days
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Link 
                              to={`/product/${item.productId}`}
                              className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1a1a1a] border border-[#1a1a1a] px-6 py-2.5 hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
                            >
                              View Product
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-right">
                      <button className="text-[10px] uppercase tracking-widest font-medium text-gray-400 hover:text-[#1a1a1a] inline-flex items-center gap-1 transition-colors">
                        View Order Details <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setActiveTab('overview')}
              className="mt-12 text-[11px] uppercase tracking-widest text-gray-500 hover:text-[#1a1a1a] border-b border-transparent hover:border-[#1a1a1a] transition-all pb-0.5"
            >
              Back to Overview
            </button>
          </div>
        ) : activeTab === 'wishlist' ? (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-3xl text-[#1a1a1a] mb-10 tracking-widest uppercase text-center font-light">
              Your Wishlist
            </h2>
                       <div className="w-full">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-24 bg-gray-50/50 rounded-sm border border-dashed border-gray-200 w-full">
                  <Heart className="w-16 h-16 text-gray-200 mx-auto mb-6 stroke-[1]" />
                  <p className="text-gray-400 uppercase tracking-[0.3em] text-[10px] font-medium">Your wishlist is currently empty</p>
                  <Link to="/shop" className="mt-8 inline-block text-[11px] uppercase tracking-[0.4em] font-bold text-[#D4AF37] hover:text-[#1a1a1a] transition-all border-b border-[#D4AF37] pb-1">
                    Explore Our Collection
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                  {wishlistItems.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-100 rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 flex p-5 gap-7 group relative">
                      <Link to={`/product/${product.id}`} className="w-28 h-36 bg-gray-50 flex-shrink-0 rounded-sm overflow-hidden border border-gray-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </Link>
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] mb-2 font-medium">Lunar Collection</p>
                          <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-xl font-light text-[#1a1a1a] uppercase tracking-wider mb-2 leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-[#D4AF37] text-sm font-bold tracking-[0.15em]">
                            {product.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <button 
                            type="button"
                            onClick={() => addToCart(product, 1)}
                            disabled={product.stock === 0}
                            className={`text-[10px] uppercase tracking-[0.25em] font-bold px-6 py-3 transition-all duration-300 ${
                              product.stock === 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-[#1a1a1a] text-white hover:bg-[#D4AF37]'
                            }`}
                          >
                            {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
                          </button>
                          <button 
                            type="button"
                            onClick={() => removeFromFavorites(product.id)}
                            className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                          >
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setActiveTab('overview')}
              className="mt-12 text-[11px] uppercase tracking-widest text-gray-500 hover:text-[#1a1a1a] border-b border-transparent hover:border-[#1a1a1a] transition-all pb-0.5"
            >
              Back to Overview
            </button>
          </div>
        ) : activeTab === 'loyalty' ? (
          <div className="w-full max-w-4xl flex flex-col items-center space-y-10 animate-fade-in text-left">
            {/* Header Tier Card */}
            <div className="w-full bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#2b2518] text-white p-8 md:p-10 rounded-sm shadow-xl border border-[#D4AF37]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-[#D4AF37] text-[11px] uppercase tracking-[0.3em] font-bold mb-2">
                    <Sparkles className="w-4 h-4" /> LUNAR Club • Program Lojalnościowy
                  </div>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-4xl md:text-5xl font-light tracking-wider">
                    Twoje Saldo: <span className="font-semibold text-[#D4AF37]">{loyaltyPoints} PKT</span>
                  </h2>
                  <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">
                    Zbierasz punkty za każde zamówienie i wymieniasz je na kupony rabatowe
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-[#D4AF37]/40 px-6 py-4 rounded-sm text-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold block mb-1">
                    Aktualny Status
                  </span>
                  <span className="text-lg font-serif tracking-widest text-white font-bold block">
                    {tier.name}
                  </span>
                  <span className="text-[10px] text-gray-300 tracking-wider">
                    Mnożnik punktów: {tier.multiplier}x
                  </span>
                </div>
              </div>

              {/* Tier progress */}
              <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                <div className="flex justify-between text-xs text-gray-300 uppercase tracking-widest mb-2 font-medium">
                  <span>Postęp do kolejnego poziomu</span>
                  <span>{tier.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#f3e5ab] transition-all duration-700"
                    style={{ width: `${tier.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* REWARDS STORE SECTION */}
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-3xl text-[#1a1a1a] tracking-widest uppercase font-light">
                    Wymień Punkty na Kupony Rabatowe
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                    Wybierz nagrodę, a wygenerowany kupon pojawi się w Twoim portfelu poniżej
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rewards.map((reward) => {
                  const canAfford = loyaltyPoints >= reward.pointsCost;
                  const isRedeeming = redeemingRewardId === reward.id;

                  return (
                    <div
                      key={reward.id}
                      className={`bg-white border rounded-sm p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
                        canAfford
                          ? 'border-gray-200 hover:border-[#D4AF37] hover:shadow-md'
                          : 'border-gray-100 opacity-60 bg-gray-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-full">
                            <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {reward.pointsCost} PKT
                          </span>
                          <span className="text-sm font-bold text-green-700 font-mono">
                            {reward.discountType === 'PERCENTAGE' ? `-${reward.discountValue}%` : `-${reward.discountValue.toFixed(2)}€`}
                          </span>
                        </div>

                        <h4 className="font-serif text-xl text-[#1a1a1a] font-bold mb-2">
                          {reward.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                          {reward.description || 'Kupon rabatowy ważny na zakupy w sklepie Lunar.'}
                        </p>
                        {reward.minOrderValue > 0 && (
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-4">
                            Min. zamówienie: {reward.minOrderValue.toFixed(2)}€
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!canAfford || isRedeeming}
                        onClick={async () => {
                          setRedeemingRewardId(reward.id);
                          const res = await redeemReward(reward.id);
                          setRedeemingRewardId(null);
                          if (res.success) {
                            showNotification(res.message, 'success');
                          } else {
                            showNotification(res.message, 'error');
                          }
                        }}
                        className={`w-full py-3.5 px-4 text-xs uppercase tracking-[0.2em] font-bold rounded-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                          canAfford
                            ? 'bg-[#1a1a1a] text-white hover:bg-[#D4AF37] shadow'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isRedeeming ? (
                          <span>Generowanie...</span>
                        ) : canAfford ? (
                          <>
                            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                            <span>Wymień za {reward.pointsCost} pkt</span>
                          </>
                        ) : (
                          <span>Brakuje {reward.pointsCost - loyaltyPoints} pkt</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MY ACTIVE COUPONS WALLET */}
            <div className="w-full space-y-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-3xl text-[#1a1a1a] tracking-widest uppercase font-light">
                    Mój Portfel Kuponów ({userCoupons.filter(c => !c.isUsed).length} aktywnych)
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                    Wykupione przez Ciebie kupony, gotowe do użycia w koszyku
                  </p>
                </div>
                <Link
                  to="/cart"
                  className="text-xs uppercase tracking-widest font-bold text-[#D4AF37] hover:text-black flex items-center gap-1 border-b border-[#D4AF37] pb-0.5"
                >
                  <span>Przejdź do Koszyka</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {userCoupons.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-sm border border-dashed border-gray-200">
                  <Coins className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Nie masz jeszcze wygenerowanych kuponów
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Wymień swoje punkty powyżej, aby zdobyć kod rabatowy.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={`p-5 rounded-sm border transition-all ${
                        coupon.isUsed
                          ? 'bg-gray-50 border-gray-200 opacity-50'
                          : 'bg-white border-[#D4AF37]/50 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-base text-black bg-gray-100 px-3 py-1 rounded border border-gray-200">
                          {coupon.code}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            coupon.isUsed ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {coupon.isUsed ? 'Wykorzystany' : 'Aktywny'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600 my-2">
                        <span>Zniżka:</span>
                        <span className="font-bold text-green-700 text-sm">
                          {coupon.discountType === 'PERCENTAGE' ? `-${coupon.discountValue}%` : `-${coupon.discountValue.toFixed(2)}€`}
                        </span>
                      </div>

                      {!coupon.isUsed && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              setCopiedCouponCode(coupon.code);
                              setTimeout(() => setCopiedCouponCode(null), 2000);
                            }}
                            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedCouponCode === coupon.code ? 'Skopiowano!' : 'Kopiuj Kod'}</span>
                          </button>

                          <Link
                            to="/cart"
                            className="py-2 px-4 bg-[#1a1a1a] hover:bg-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors text-center"
                          >
                            Użyj
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* POINTS HISTORY AUDIT */}
            <div className="w-full space-y-4 pt-6 border-t border-gray-200">
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-[#1a1a1a] tracking-widest uppercase font-light">
                Historia Punktów
              </h3>

              <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                <div className="divide-y divide-gray-100 text-xs">
                  {history.map((h) => (
                    <div key={h.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-black">{h.description}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(h.createdAt).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                      <span className={`font-bold text-sm ${h.points > 0 ? 'text-green-600' : 'text-amber-700'}`}>
                        {h.points > 0 ? `+${h.points}` : h.points} PKT
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('overview')}
              className="mt-8 text-[11px] uppercase tracking-widest text-gray-500 hover:text-[#1a1a1a] border-b border-transparent hover:border-[#1a1a1a] transition-all pb-0.5"
            >
              Back to Overview
            </button>
          </div>
        ) : activeTab === 'addresses' ? (
          <div className="w-full max-w-2xl bg-white p-8 md:p-10 border border-gray-100 rounded-sm shadow-sm md:mt-[-130px] transition-all duration-500">
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-3xl text-[#1a1a1a] mb-8 tracking-widest uppercase text-center font-light">
              Delivery Address
            </h2>
            <form className="space-y-6" onSubmit={handleUpdateAddress}>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Street Address</label>
                <input
                  type="text"
                  value={editStreet}
                  onChange={(e) => setEditStreet(e.target.value)}
                  placeholder="e.g. 123 Luxury Ave"
                  className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="New York"
                    className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={editPostal}
                    onChange={(e) => setEditPostal(e.target.value)}
                    placeholder="10001"
                    className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6 pt-6">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('overview')} 
                  className="text-[11px] uppercase tracking-widest text-gray-500 hover:text-[#1a1a1a] border-b border-transparent hover:border-[#1a1a1a] transition-all pb-0.5"
                >
                  Back to Overview
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.3em] py-4 px-10 hover:bg-[#D4AF37] transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Address'}
                </button>
              </div>
            </form>

            {(user?.street || user?.city || user?.postalCode || user?.country) && (
              <div className="mt-12 pt-12 border-t border-gray-100 w-full">
                <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-[#1a1a1a] mb-8 tracking-widest uppercase text-center font-light">
                  Saved Delivery Address
                </h3>
                <div className="max-w-md mx-auto relative group">
                  <div className="bg-[#fcfaf5] border border-[#f5eeeb] p-10 rounded-sm shadow-sm group-hover:shadow-md transition-all duration-500 relative overflow-hidden">
                    {/* Decorative gold line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
                    
                    <div className="absolute top-4 right-4 translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        type="button"
                        onClick={handleDeleteAddress}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Remove Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="mb-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#f5eeeb]">
                        <MapPin className="w-5 h-5 text-[#D4AF37] stroke-[1.5]" />
                      </div>
                      
                      <div className="space-y-4 text-center">
                        <span className="text-[9px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">Default Residence</span>
                        <div className="pt-2">
                          <p className="text-[17px] text-[#1a1a1a] font-light tracking-wide mb-1 leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                            {user.street}
                          </p>
                          <p className="text-[14px] text-gray-600 font-light tracking-[0.05em] mb-1">
                            {user.postalCode} • {user.city}
                          </p>
                          <p className="text-[12px] text-gray-400 font-medium tracking-[0.2em] uppercase pt-2">
                            {user.country}
                          </p>
                          {user.phone && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-[#D4AF37]">
                              <Phone className="w-3.5 h-3.5" />
                              <p className="text-[13px] font-medium tracking-wider">{user.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white p-8 md:p-10 border border-gray-100 rounded-sm shadow-sm">
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-3xl text-[#1a1a1a] mb-8 tracking-widest uppercase text-center font-light">
              Personal Details
            </h2>
            <form className="space-y-6" onSubmit={handleUpdateProfile}>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">New Password (Optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6 pt-6">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('overview')} 
                  className="text-[11px] uppercase tracking-widest text-gray-500 hover:text-[#1a1a1a] border-b border-transparent hover:border-[#1a1a1a] transition-all pb-0.5"
                >
                  Back to Overview
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.3em] py-4 px-10 hover:bg-[#D4AF37] transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <div className="mt-16 pt-12 border-t border-red-50">
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-xl text-red-800 mb-4 tracking-widest uppercase font-light">
                Danger Zone
              </h3>
              <p className="text-[13px] text-gray-400 font-light mb-6 tracking-wide leading-relaxed">
                Deleting your account will permanently remove all your data, including your address, order history, and wishlist. This action cannot be undone.
              </p>
              <button 
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="text-[10px] uppercase tracking-[0.2em] font-medium text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 px-6 py-3 transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-red-500"
              >
                Delete Account Permanently
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-white border border-gray-100 shadow-2xl rounded-sm flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-500 z-50`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-[#D4AF37]' : 'bg-red-500'}`} />
          <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#1a1a1a]">
            {notification.message}
          </p>
          <button 
            onClick={() => setNotification(null)}
            className="ml-4 text-gray-400 hover:text-[#1a1a1a] transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
