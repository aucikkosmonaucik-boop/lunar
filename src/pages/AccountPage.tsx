import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Package, MapPin, Heart, Settings, LogOut } from 'lucide-react';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      icon: <Package className="w-8 h-8 text-[#1a1a1a] stroke-[1.2]" />,
      action: () => console.log('Navigate to orders'),
    },
    {
      title: 'Addresses',
      description: 'Edit your delivery preferences and addresses for orders',
      icon: <MapPin className="w-8 h-8 text-[#1a1a1a] stroke-[1.2]" />,
      action: () => console.log('Navigate to addresses'),
    },
    {
      title: 'Wishlist',
      description: 'View your saved favorite items and collections',
      icon: <Heart className="w-8 h-8 text-[#1a1a1a] stroke-[1.2]" />,
      action: () => navigate('/sklep?category=jewelry'),
    },
    {
      title: 'Account Settings',
      description: 'Manage your personal details and password',
      icon: <Settings className="w-8 h-8 text-[#1a1a1a] stroke-[1.2]" />,
      action: () => console.log('Navigate to settings'),
    }
  ];

  return (
    <div className="min-h-[60vh] px-4 py-12 w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="mb-10 w-full">
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-4xl md:text-5xl tracking-widest text-[#1a1a1a] uppercase font-light text-center">
          My Account
        </h1>
        <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-gray-500">
          Welcome back, {user.name || user.email}
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        {accountSections.map((section, index) => (
          <button
            key={index}
            onClick={section.action}
            className="group flex flex-col sm:flex-row items-center sm:items-start p-6 border border-gray-200 hover:border-[#1a1a1a] bg-white transition-all duration-300 text-center sm:text-left rounded-sm w-full"
          >
            <div className="flex-shrink-0 sm:mr-6 mb-4 sm:mb-0">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                {section.icon}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-[14px] uppercase tracking-widest font-medium text-[#1a1a1a] mb-2 group-hover:text-gray-600 transition-colors">
                {section.title}
              </h2>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                {section.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] font-medium text-gray-500 hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
