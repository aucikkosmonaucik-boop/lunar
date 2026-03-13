import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Package, MapPin, Heart, Settings, LogOut } from 'lucide-react';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'addresses'>('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      action: () => console.log('Navigate to orders'),
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
            <form className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ''}
                  className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  className="w-full bg-transparent border-b border-gray-200 py-3 text-[15px] text-[#1a1a1a] placeholder-gray-300 font-light tracking-wide focus:outline-none focus:border-[#D4AF37] transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">New Password (Optional)</label>
                <input
                  type="password"
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
                  type="button" 
                  className="w-full sm:w-auto bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.3em] py-4 px-10 hover:bg-[#D4AF37] transition-colors duration-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
