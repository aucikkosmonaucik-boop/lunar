import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Package, MapPin, Heart, Settings, LogOut, Clock, ArrowRight } from 'lucide-react';
import { products } from '../data/products';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'addresses' | 'orders'>('overview');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
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

      showNotification('Your profile has been updated successfully.');
      setEditPassword(''); 
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
      action: () => navigate('/sklep?category=jewelry'),
    },
    {
      title: 'Account Settings',
      description: 'Manage your personal details and password',
      icon: <Settings className="w-8 h-8 text-[#1a1a1a] stroke-[1.2] group-hover:text-[#D4AF37] transition-colors duration-300" />,
      action: () => setActiveTab('settings'),
    }
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
              {[
                {
                  id: 'ORD-7729',
                  date: 'March 10, 2026',
                  status: 'Processing',
                  items: [products[5]], // Golden Solar Necklace
                  delivery: 'Processing: 2-4 business days'
                },
                {
                  id: 'ORD-6510',
                  date: 'February 24, 2026',
                  status: 'Delivered',
                  items: [products[4]], // Silver Orbit Earrings
                  delivery: 'Delivered on February 28, 2026'
                }
              ].map((order) => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Order Placed</p>
                        <p className="text-xs text-[#1a1a1a] font-medium">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Order ID</p>
                        <p className="text-xs text-[#1a1a1a] font-medium">{order.id}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold ${order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {order.items.map((product) => (
                      <div key={product.id} className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-24 h-24 bg-gray-50 flex-shrink-0 rounded-sm overflow-hidden border border-gray-100">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                          <h3 className="text-sm font-medium text-[#1a1a1a] uppercase tracking-widest mb-2">{product.name}</h3>
                          <p className="text-gray-500 text-xs font-light mb-4 line-clamp-2 italic">"{product.description}"</p>
                          <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] text-wonders-gold uppercase tracking-widest font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            {order.delivery}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <button className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1a1a1a] border border-[#1a1a1a] px-6 py-2.5 hover:bg-[#1a1a1a] hover:text-white transition-all duration-300">
                            Buy Again
                          </button>
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
              ))}
            </div>
            
            <button 
              onClick={() => setActiveTab('overview')}
              className="mt-12 text-[11px] uppercase tracking-widest text-gray-500 hover:text-[#1a1a1a] border-b border-transparent hover:border-[#1a1a1a] transition-all pb-0.5"
            >
              Back to Overview
            </button>
          </div>
        ) : activeTab === 'addresses' ? (
          <div className="w-full max-w-2xl bg-white p-8 md:p-10 border border-gray-100 rounded-sm shadow-sm">
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-3xl text-[#1a1a1a] mb-8 tracking-widest uppercase text-center font-light">
              Delivery Address
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 123 Luxury Ave"
                  className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">City</label>
                  <input
                    type="text"
                    placeholder="New York"
                    className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Postal Code</label>
                  <input
                    type="text"
                    placeholder="10001"
                    className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Country</label>
                <input
                  type="text"
                  placeholder="United States"
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
                  type="button" 
                  className="w-full sm:w-auto bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.3em] py-4 px-10 hover:bg-[#D4AF37] transition-colors duration-300"
                >
                  Update Address
                </button>
              </div>
            </form>
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
